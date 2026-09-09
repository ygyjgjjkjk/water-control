import { create } from 'zustand';
import type {
  Zone,
  FlowHistoryPoint,
  HistoricalPoint,
  Anomaly,
  Alert,
  VisionState,
  VisionScenario,
  IoTDevice,
  AnomalyType,
} from '../types';
import { ZONE_DEFS, buildInitialZones, buildInitialDevices, generateHistoricalData } from '../data/mockData';
import { detectAnomaly, estimateLoss, estimateCost, riskScoreFor } from '../services/aiEngine';
import { forcedEventOffset, naturalFlow, type ForcedEvent } from './zoneSimulation';
import { DEMO_STEPS, DEMO_TARGET_ZONE } from './demoScript';

const HISTORY_LEN = 60;
const WASTE_FLOW_RATE = 9; // L/min assumed running-faucet rate for CV waste estimate
const PRICE_PER_LITER = 1.1; // illustrative KZT/L institutional water+sewerage tariff

let anomalyCounter = 0;
let alertCounter = 0;

function newAnomalyId() {
  anomalyCounter += 1;
  return `AN-${Date.now()}-${anomalyCounter}`;
}
function newAlertId() {
  alertCounter += 1;
  return `AL-${Date.now()}-${alertCounter}`;
}

interface SimulationState {
  zones: Zone[];
  liveHistory: Record<string, FlowHistoryPoint[]>;
  aggregateHistory: FlowHistoryPoint[];
  historicalData: HistoricalPoint[];
  anomalies: Anomaly[];
  alerts: Alert[];
  vision: VisionState;
  devices: IoTDevice[];
  forcedEvents: Record<string, ForcedEvent>;
  demoMode: boolean;
  demoStepIndex: number;
  demoElapsedMs: number;
  presentationMode: boolean;
  systemOnline: boolean;
  aiActive: boolean;
  simMinutes: number;
  todayConsumption: number;
  monthConsumption: number;
  waterSaved: number;
  estimatedCost: number;
  isolatedZoneIds: string[];

  tick: () => void;
  simulateLeak: (zoneId?: string, type?: AnomalyType) => void;
  simulateWaterWaste: () => void;
  setVisionScenario: (s: VisionScenario) => void;
  toggleDemoMode: () => void;
  togglePresentationMode: () => void;
  resolveAlert: (id: string) => void;
  resolveAlertsForZone: (zoneId: string) => void;
  investigateAlert: (id: string) => void;
  markAllAlertsRead: () => void;
  isolateZone: (zoneId: string) => void;
  restoreZone: (zoneId: string) => void;
}

const initialZones = buildInitialZones();
const nowClock = new Date();

export const useSimulationStore = create<SimulationState>((set, get) => ({
  zones: initialZones,
  liveHistory: Object.fromEntries(initialZones.map((z) => [z.id, []])),
  aggregateHistory: [],
  historicalData: generateHistoricalData(7),
  anomalies: [],
  alerts: [],
  vision: {
    scenario: 'closed',
    personDetected: false,
    handsDetected: false,
    waterFlow: false,
    wasteTimerSec: 0,
    wasteDetected: false,
    estimatedWasteL: 0,
  },
  devices: buildInitialDevices(initialZones),
  forcedEvents: {},
  demoMode: false,
  demoStepIndex: 0,
  demoElapsedMs: 0,
  presentationMode: false,
  systemOnline: true,
  aiActive: true,
  simMinutes: nowClock.getHours() * 60 + nowClock.getMinutes(),
  todayConsumption: initialZones.filter((z) => z.id !== 'main').reduce((s, z) => s + z.dailyConsumption, 0),
  monthConsumption: 612_400,
  waterSaved: 430,
  estimatedCost: estimateCost(612_400, PRICE_PER_LITER),
  isolatedZoneIds: [],

  tick: () => {
    const state = get();
    const simMinutes = (state.simMinutes + 1) % (24 * 60);
    const hour = Math.floor(simMinutes / 60);
    const minute = simMinutes % 60;
    const dayReset = simMinutes === 0;

    const newForcedEvents = { ...state.forcedEvents };
    const newAnomalies = [...state.anomalies];
    const newAlerts = [...state.alerts];
    let waterSavedDelta = 0;

    const updatedZones: Zone[] = state.zones
      .filter((z) => z.id !== 'main')
      .map((zone) => {
        if (state.isolatedZoneIds.includes(zone.id)) {
          return { ...zone, currentFlow: 0, status: 'NORMAL' as const, activeAnomaly: 'None' as const, riskScore: 1 };
        }

        let flow = naturalFlow(zone.baseline, zone.stdDev, hour, minute, zone.category);

        const forced = newForcedEvents[zone.id];
        let forcedActive = false;
        if (forced) {
          // one tick == one real-world second, so ticks elapsed doubles as "seconds elapsed"
          // for the hand-tuned curves in forcedEventOffset (fade/ramp/period constants below).
          const elapsedSec = (simMinutes - forced.startedAt + 24 * 60) % (24 * 60);
          const offset = forcedEventOffset(forced.type, elapsedSec, zone.baseline);
          if (offset > 0.05) {
            flow += offset;
            forcedActive = true;
          } else if (forced.type === 'Open Tap') {
            delete newForcedEvents[zone.id];
          }
        }

        flow = Math.round(flow * 10) / 10;

        const detection = detectAnomaly(flow, zone.baseline, zone.stdDev, {
          isNight: hour < 6 || hour >= 21,
          spikeSpeed: forcedActive ? 220 : 40,
          forcedType: forced?.type,
        });

        let status = zone.status;
        let activeAnomaly = zone.activeAnomaly;
        let riskScore = riskScoreFor(detection.deviationPct, detection.isAnomaly);

        if (detection.isAnomaly) {
          status = detection.severity === 'HIGH' ? 'CRITICAL' : detection.severity === 'MEDIUM' ? 'HIGH' : 'HIGH';
          activeAnomaly = detection.type;

          const existing = newAnomalies.find((a) => a.zoneId === zone.id && a.active);
          if (!existing) {
            const id = newAnomalyId();
            newAnomalies.push({
              id,
              timestamp: Date.now(),
              zoneId: zone.id,
              zoneName: zone.name,
              type: detection.type,
              severity: detection.severity,
              confidence: detection.confidence,
              actualFlow: flow,
              baselineFlow: zone.baseline,
              deviation: Math.round(detection.deviationPct),
              estimatedLoss: estimateLoss(flow - zone.baseline, 1),
              active: true,
            });
            newAlerts.unshift({
              id: newAlertId(),
              timestamp: Date.now(),
              title:
                detection.type === 'Pipe Burst'
                  ? 'Вероятный порыв трубы'
                  : detection.type === 'Hidden Leak'
                    ? 'Обнаружена скрытая утечка'
                    : detection.type === 'Open Tap'
                      ? 'Аномально высокий расход'
                      : detection.type === 'Toilet Leak'
                        ? 'Периодическая протечка'
                        : 'Аномальное потребление',
              location: zone.name,
              type: detection.type,
              severity: detection.severity,
              confidence: detection.confidence,
              estimatedLoss: estimateLoss(flow - zone.baseline, 1),
              status: 'OPEN',
              read: false,
            });
          } else {
            existing.actualFlow = flow;
            existing.confidence = detection.confidence;
            existing.deviation = Math.round(detection.deviationPct);
            existing.estimatedLoss = Math.round((existing.estimatedLoss + estimateLoss(flow - zone.baseline, 1)) * 10) / 10;
            const linkedAlert = newAlerts.find((a) => a.timestamp === existing.timestamp || (a.location === zone.name && a.status !== 'RESOLVED' && a.type === existing.type));
            if (linkedAlert) linkedAlert.estimatedLoss = existing.estimatedLoss;
          }
        } else if (activeAnomaly !== 'None') {
          const existing = newAnomalies.find((a) => a.zoneId === zone.id && a.active);
          const wasLow = existing ? existing.severity !== 'HIGH' : true;
          if (wasLow) {
            // auto-resolve minor anomalies once flow normalizes
            if (existing) existing.active = false;
            const linkedAlert = newAlerts.find((a) => a.location === zone.name && a.status !== 'RESOLVED');
            if (linkedAlert) {
              linkedAlert.status = 'RESOLVED';
              waterSavedDelta += linkedAlert.estimatedLoss * 0.2;
            }
            activeAnomaly = 'None';
            status = 'NORMAL';
            riskScore = riskScoreFor(0, false);
          } else {
            status = 'CRITICAL';
          }
        } else {
          status = 'NORMAL';
        }

        const dailyConsumption = dayReset
          ? Math.round(flow)
          : zone.dailyConsumption + Math.round(flow * 10) / 10;

        return {
          ...zone,
          currentFlow: flow,
          status,
          activeAnomaly,
          riskScore,
          dailyConsumption,
        };
      });

    const totalFlow = Math.round(updatedZones.reduce((s, z) => s + z.currentFlow, 0) * 10) / 10;
    const totalDaily = Math.round(updatedZones.reduce((s, z) => s + z.dailyConsumption, 0));
    const mainZone = state.zones.find((z) => z.id === 'main')!;
    const zonesWithMain: Zone[] = [
      { ...mainZone, currentFlow: totalFlow, dailyConsumption: totalDaily, status: 'NORMAL', riskScore: 5, activeAnomaly: 'None' },
      ...updatedZones,
    ];

    const liveHistory = { ...state.liveHistory };
    for (const zone of zonesWithMain) {
      const buf = liveHistory[zone.id] ?? [];
      const point: FlowHistoryPoint = {
        t: Date.now(),
        flow: zone.currentFlow,
        baseline: zone.baseline,
        anomaly: zone.activeAnomaly !== 'None',
      };
      liveHistory[zone.id] = [...buf, point].slice(-HISTORY_LEN);
    }
    const aggregateHistory = [
      ...state.aggregateHistory,
      {
        t: Date.now(),
        flow: totalFlow,
        baseline: ZONE_DEFS.filter((z) => z.id !== 'main').reduce((s, z) => s + z.baseline, 0),
        anomaly: updatedZones.some((z) => z.activeAnomaly !== 'None'),
      },
    ].slice(-HISTORY_LEN);

    // Vision module tick
    const vision = { ...state.vision };
    if (vision.scenario === 'waste') {
      vision.wasteTimerSec += 1;
      if (vision.wasteTimerSec >= 15 && !vision.wasteDetected) {
        vision.wasteDetected = true;
        newAlerts.unshift({
          id: newAlertId(),
          timestamp: Date.now(),
          title: 'Вода течёт без обнаруженной активности',
          location: 'Столовая — камера раковины',
          type: 'Water Waste',
          severity: 'MEDIUM',
          confidence: 91,
          estimatedLoss: Math.round((vision.wasteTimerSec / 60) * WASTE_FLOW_RATE * 10) / 10,
          status: 'OPEN',
          read: false,
        });
      }
      if (vision.wasteDetected) {
        vision.estimatedWasteL = Math.round((vision.wasteTimerSec / 60) * WASTE_FLOW_RATE * 10) / 10;
        const openWasteAlert = newAlerts.find((a) => a.type === 'Water Waste' && a.status !== 'RESOLVED');
        if (openWasteAlert) openWasteAlert.estimatedLoss = vision.estimatedWasteL;
      }
    }

    // Devices heartbeat jitter
    const devices = state.devices.map((d) => ({
      ...d,
      lastUpdate: Date.now(),
      battery: d.type === 'edge-server' ? 100 : Math.max(5, d.battery - (Math.random() < 0.02 ? 1 : 0)),
      signal: Math.min(100, Math.max(40, d.signal + Math.round((Math.random() - 0.5) * 6))),
      flow: d.zoneId ? zonesWithMain.find((z) => z.id === d.zoneId)?.currentFlow ?? d.flow : d.flow,
    }));

    const estimatedCost = estimateCost(totalDaily * 30, PRICE_PER_LITER);

    set({
      zones: zonesWithMain,
      liveHistory,
      aggregateHistory,
      anomalies: newAnomalies.slice(-50),
      alerts: newAlerts.slice(0, 60),
      vision,
      devices,
      forcedEvents: newForcedEvents,
      simMinutes,
      todayConsumption: totalDaily,
      monthConsumption: state.monthConsumption + totalFlow,
      estimatedCost,
      waterSaved: state.waterSaved + waterSavedDelta,
    });
  },

  simulateLeak: (zoneId, type) => {
    const state = get();
    const candidates = state.zones.filter((z) => z.id !== 'main');
    const zone = zoneId ? candidates.find((z) => z.id === zoneId) : candidates[Math.floor(Math.random() * candidates.length)];
    if (!zone) return;
    const types: AnomalyType[] = ['Hidden Leak', 'Open Tap', 'Toilet Leak', 'Pipe Burst'];
    const chosenType = type ?? types[Math.floor(Math.random() * types.length)];
    set({
      forcedEvents: {
        ...state.forcedEvents,
        [zone.id]: { zoneId: zone.id, type: chosenType, startedAt: state.simMinutes },
      },
    });
  },

  simulateWaterWaste: () => {
    set({
      vision: {
        scenario: 'waste',
        personDetected: false,
        handsDetected: false,
        waterFlow: true,
        wasteTimerSec: 0,
        wasteDetected: false,
        estimatedWasteL: 0,
      },
    });
  },

  setVisionScenario: (scenario: VisionScenario) => {
    const map: Record<VisionScenario, Omit<VisionState, 'scenario' | 'wasteTimerSec' | 'wasteDetected' | 'estimatedWasteL'>> = {
      washing: { personDetected: true, handsDetected: true, waterFlow: true },
      leaving: { personDetected: false, handsDetected: false, waterFlow: false },
      waste: { personDetected: false, handsDetected: false, waterFlow: true },
      closed: { personDetected: false, handsDetected: false, waterFlow: false },
    };
    set({
      vision: {
        scenario,
        ...map[scenario],
        wasteTimerSec: 0,
        wasteDetected: false,
        estimatedWasteL: 0,
      },
    });
  },

  toggleDemoMode: () => {
    const active = !get().demoMode;
    set({ demoMode: active, demoStepIndex: 0, demoElapsedMs: 0 });
    if (active) {
      get().simulateLeak(DEMO_TARGET_ZONE, 'Hidden Leak');
    }
  },

  togglePresentationMode: () => set((s) => ({ presentationMode: !s.presentationMode })),

  resolveAlert: (id: string) => {
    const state = get();
    const resolved = state.alerts.find((a) => a.id === id);
    if (!resolved) return;
    resolveAlertInternal(state, set, (a) => a.id === id, resolved);
  },

  resolveAlertsForZone: (zoneId: string) => {
    const state = get();
    const zone = state.zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const resolved = state.alerts.find((a) => a.status !== 'RESOLVED' && (a.location === zone.name || a.location.startsWith(zone.name)));
    if (!resolved) return;
    resolveAlertInternal(state, set, (a) => a.id === resolved.id, resolved);
  },

  investigateAlert: (id: string) => {
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'INVESTIGATING' as const, read: true } : a)) }));
  },

  markAllAlertsRead: () => set((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })) })),

  isolateZone: (zoneId: string) => {
    const state = get();
    const zone = state.zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const forcedEvents = { ...state.forcedEvents };
    delete forcedEvents[zoneId];
    const alerts = state.alerts.map((a) =>
      a.status !== 'RESOLVED' && (a.location === zone.name || a.location.startsWith(zone.name)) ? { ...a, status: 'RESOLVED' as const } : a,
    );
    const savedDelta = state.alerts
      .filter((a) => a.status !== 'RESOLVED' && (a.location === zone.name || a.location.startsWith(zone.name)))
      .reduce((s, a) => s + a.estimatedLoss, 0);
    const anomalies = state.anomalies.map((a) => (a.zoneId === zoneId ? { ...a, active: false } : a));
    const zones = state.zones.map((z) => (z.id === zoneId ? { ...z, currentFlow: 0, status: 'NORMAL' as const, activeAnomaly: 'None' as const, riskScore: 1 } : z));
    set({
      isolatedZoneIds: [...state.isolatedZoneIds, zoneId],
      forcedEvents,
      alerts,
      anomalies,
      zones,
      waterSaved: state.waterSaved + savedDelta,
    });
  },

  restoreZone: (zoneId: string) => {
    set((s) => ({ isolatedZoneIds: s.isolatedZoneIds.filter((id) => id !== zoneId) }));
  },
}));

function resolveAlertInternal(
  state: SimulationState,
  set: (partial: Partial<SimulationState>) => void,
  match: (a: Alert) => boolean,
  resolved: Alert,
) {
  const alerts = state.alerts.map((a) => (match(a) ? { ...a, status: 'RESOLVED' as const } : a));
  const forcedEvents = { ...state.forcedEvents };
  const zone = state.zones.find((z) => z.name === resolved.location || resolved.location.startsWith(z.name));
  if (zone) delete forcedEvents[zone.id];
  const anomalies = state.anomalies.map((a) => (a.zoneName === resolved.location ? { ...a, active: false } : a));
  const zones = state.zones.map((z) =>
    resolved.location === z.name || resolved.location.startsWith(z.name)
      ? { ...z, activeAnomaly: 'None' as const, status: 'NORMAL' as const, riskScore: 5 }
      : z,
  );
  const vision =
    resolved.type === 'Water Waste'
      ? { ...state.vision, scenario: 'closed' as const, waterFlow: false, wasteDetected: false, wasteTimerSec: 0 }
      : state.vision;
  set({ alerts, forcedEvents, anomalies, zones, vision, waterSaved: state.waterSaved + resolved.estimatedLoss });
}

// --- Demo mode step progression, advanced externally alongside the tick clock ---
let demoTimer = 0;
let lastDemoMode = false;

export function advanceDemoClock(deltaMs: number) {
  const state = useSimulationStore.getState();
  if (state.demoMode && !lastDemoMode) demoTimer = 0;
  lastDemoMode = state.demoMode;
  if (!state.demoMode) return;

  demoTimer += deltaMs;
  const step = DEMO_STEPS[state.demoStepIndex];
  if (!step) return;
  if (demoTimer >= step.durationMs) {
    demoTimer = 0;
    const nextIndex = state.demoStepIndex + 1;
    if (nextIndex >= DEMO_STEPS.length) {
      useSimulationStore.setState({ demoMode: false, demoStepIndex: 0 });
      useSimulationStore.getState().resolveAlertsForZone(DEMO_TARGET_ZONE);
    } else {
      useSimulationStore.setState({ demoStepIndex: nextIndex });
    }
  }
}

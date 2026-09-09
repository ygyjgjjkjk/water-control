import type { HistoricalPoint, Zone, IoTDevice } from '../types';

/**
 * Real floor plan of the school, transcribed from the building's plumbing sketch.
 * floor: 0 = 1 этаж, 1 = 2 этаж, 2 = 3 этаж. baseline/stdDev are simulation
 * parameters (L/min), not measured — tuned per room type and fixture count (`units`).
 */
export const ZONE_DEFS: Omit<
  Zone,
  'currentFlow' | 'dailyConsumption' | 'status' | 'riskScore' | 'activeAnomaly' | 'sensorOnline'
>[] = [
  { id: 'main', name: 'Главная водная магистраль', category: 'Магистраль', units: 1, building: 'Техпомещение', floor: 0, sensorId: 'ESP32-WATER-01', baseline: 42, stdDev: 8 },

  // 1 этаж
  { id: 'canteen', name: 'Столовая', category: 'Столовая', units: 1, building: '1 этаж', floor: 0, sensorId: 'ESP32-WATER-02', baseline: 9.5, stdDev: 2.4 },
  { id: 'lab-it-f1', name: 'Лаборатория информатики', category: 'Лаборатория', units: 2, building: '1 этаж', floor: 0, sensorId: 'ESP32-WATER-03', baseline: 1.6, stdDev: 0.5 },
  { id: 'toilet-f1-w', name: 'Женский туалет — 1 этаж', category: 'Санузел', units: 2, building: '1 этаж', floor: 0, sensorId: 'ESP32-WATER-04', baseline: 4.0, stdDev: 1.1 },
  { id: 'toilet-f1-m', name: 'Мужской туалет — 1 этаж', category: 'Санузел', units: 2, building: '1 этаж', floor: 0, sensorId: 'ESP32-WATER-05', baseline: 4.0, stdDev: 1.1 },
  { id: 'toilet-f1-staff', name: 'Служебный туалет — 1 этаж', category: 'Санузел', units: 3, building: '1 этаж', floor: 0, sensorId: 'ESP32-WATER-06', baseline: 6.0, stdDev: 1.6 },
  { id: 'washroom-f1', name: 'Умывальники — 1 этаж', category: 'Умывальник', units: 2, building: '1 этаж', floor: 0, sensorId: 'ESP32-WATER-07', baseline: 3.0, stdDev: 0.9 },
  { id: 'gym', name: 'Спортзал', category: 'Спортзал', units: 2, building: '1 этаж', floor: 0, sensorId: 'ESP32-WATER-08', baseline: 9.5, stdDev: 2.3 },

  // 2 этаж
  { id: 'toilet-f2-w', name: 'Женский туалет — 2 этаж', category: 'Санузел', units: 2, building: '2 этаж', floor: 1, sensorId: 'ESP32-WATER-09', baseline: 4.0, stdDev: 1.1 },
  { id: 'toilet-f2-m', name: 'Мужской туалет — 2 этаж', category: 'Санузел', units: 2, building: '2 этаж', floor: 1, sensorId: 'ESP32-WATER-10', baseline: 4.0, stdDev: 1.1 },
  { id: 'lab-science-f2', name: 'Лаборатории (физика, химия, информатика)', category: 'Лаборатория', units: 6, building: '2 этаж', floor: 1, sensorId: 'ESP32-WATER-11', baseline: 6.0, stdDev: 1.7 },
  { id: 'drying-room', name: 'Сушилка', category: 'Сушилка', units: 1, building: '2 этаж', floor: 1, sensorId: 'ESP32-WATER-12', baseline: 0.8, stdDev: 0.3 },
  { id: 'dorm-f2', name: 'Жилой блок — 2 этаж', category: 'Жилой блок', units: 2, building: '2 этаж', floor: 1, sensorId: 'ESP32-WATER-13', baseline: 8.5, stdDev: 2.1 },

  // 3 этаж
  { id: 'dorm-f3', name: 'Жилой блок — 3 этаж', category: 'Жилой блок', units: 2, building: '3 этаж', floor: 2, sensorId: 'ESP32-WATER-14', baseline: 8.5, stdDev: 2.1 },
  { id: 'toilet-f3-staff', name: 'Служебный туалет — 3 этаж', category: 'Санузел', units: 2, building: '3 этаж', floor: 2, sensorId: 'ESP32-WATER-15', baseline: 4.0, stdDev: 1.1 },
  { id: 'lab-bio-f3', name: 'Лаборатории (биология)', category: 'Лаборатория', units: 3, building: '3 этаж', floor: 2, sensorId: 'ESP32-WATER-16', baseline: 3.6, stdDev: 1.0 },
  { id: 'toilet-f3-w', name: 'Женский туалет — 3 этаж', category: 'Санузел', units: 2, building: '3 этаж', floor: 2, sensorId: 'ESP32-WATER-17', baseline: 4.0, stdDev: 1.1 },
  { id: 'toilet-f3-m', name: 'Мужской туалет — 3 этаж', category: 'Санузел', units: 2, building: '3 этаж', floor: 2, sensorId: 'ESP32-WATER-18', baseline: 4.0, stdDev: 1.1 },
];

/** Diurnal multiplier: near-zero at night, ramps at school start, peaks at breaks/lunch, tapers after school. */
export function dayShapeMultiplier(hour: number, minute: number): number {
  const t = hour + minute / 60;
  if (t < 6.5) return 0.03 + Math.random() * 0.02; // night, near dry
  if (t < 7.5) return 0.25 + (t - 6.5) * 0.5; // early arrival
  if (t < 8) return 0.9; // morning rush
  if (t < 9.5) return 0.55; // class time
  if (t < 9.75) return 1.5; // short break
  if (t < 11.25) return 0.6; // class
  if (t < 11.75) return 1.7; // recess
  if (t < 12.75) return 0.65;
  if (t < 13.75) return 2.1; // lunch peak
  if (t < 15.5) return 0.6; // afternoon class
  if (t < 16) return 1.1; // end of day rush
  if (t < 18) return 0.3; // cleaning staff
  return 0.05 + Math.random() * 0.02; // evening/night
}

/** Dormitory blocks are occupied around the clock, so their usage curve doesn't fully drop off overnight. */
export function dormShapeMultiplier(hour: number, minute: number): number {
  const t = hour + minute / 60;
  if (t < 6.5) return 0.12 + Math.random() * 0.03; // night, low but not dry (occasional use)
  if (t < 8) return 1.6; // morning routine / showers
  if (t < 12) return 0.35;
  if (t < 14) return 0.6; // lunch break back at dorm
  if (t < 18) return 0.4;
  if (t < 20) return 0.7;
  if (t < 22.5) return 1.4; // evening routine / showers
  return 0.3;
}

export function isNightHour(hour: number): boolean {
  return hour < 6 || hour >= 21;
}

export function isDormZone(category: string): boolean {
  return category === 'Жилой блок';
}

/** Integrates the diurnal shape minute-by-minute to estimate expected consumption from midnight up to `uptoMinutes`. */
export function expectedConsumptionSoFar(baselinePerMin: number, uptoMinutes: number, category = ''): number {
  const shapeFn = isDormZone(category) ? dormShapeMultiplier : dayShapeMultiplier;
  let total = 0;
  for (let m = 0; m < uptoMinutes; m++) {
    total += baselinePerMin * shapeFn(Math.floor(m / 60), m % 60);
  }
  return total;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateHistoricalData(days = 7): HistoricalPoint[] {
  const points: HistoricalPoint[] = [];
  const rand = seededRandom(1337);
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  for (const zone of ZONE_DEFS) {
    const shapeFn = isDormZone(zone.category) ? dormShapeMultiplier : dayShapeMultiplier;
    for (let i = 0; i < days * 24; i++) {
      const ts = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hour = ts.getHours();
      const shape = shapeFn(hour, 0);
      const noise = 0.85 + rand() * 0.3;
      let flow = zone.baseline * shape * noise;

      let anomaly = false;
      let anomalyType: HistoricalPoint['anomalyType'] = 'None';

      // Sprinkle a handful of historical anomalies for realism (esp. at night = hidden leak)
      const isAnomalyHour = rand() < 0.015;
      if (isAnomalyHour) {
        anomaly = true;
        if (isNightHour(hour)) {
          anomalyType = 'Hidden Leak';
          flow = zone.baseline * 0.4 + rand() * zone.baseline * 0.6 + 8;
        } else if (rand() < 0.4) {
          anomalyType = 'Open Tap';
          flow = flow * (2.2 + rand() * 1.5);
        } else if (rand() < 0.5) {
          anomalyType = 'Toilet Leak';
          flow = flow + zone.baseline * (1.5 + rand());
        } else {
          anomalyType = 'Unusual Consumption';
          flow = flow * (1.8 + rand());
        }
      }

      flow = Math.max(0, Math.round(flow * 10) / 10);
      const consumption = Math.round(flow * 60 * 10) / 10; // L over that hour

      points.push({
        timestamp: ts.toISOString(),
        location: zone.name,
        waterFlow: flow,
        consumption,
        baseline: Math.round(zone.baseline * shape * 10) / 10,
        anomaly,
        anomalyType,
      });
    }
  }
  return points;
}

export function buildInitialZones(): Zone[] {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const simMinutesSoFar = hour * 60 + minute;
  return ZONE_DEFS.map((z) => {
    const shape = (isDormZone(z.category) ? dormShapeMultiplier : dayShapeMultiplier)(hour, minute);
    const flow = Math.round(z.baseline * shape * (0.9 + Math.random() * 0.2) * 10) / 10;
    const expected = expectedConsumptionSoFar(z.baseline, simMinutesSoFar, z.category);
    return {
      ...z,
      sensorOnline: true,
      currentFlow: flow,
      dailyConsumption: Math.round(expected * (0.9 + Math.random() * 0.2)),
      status: 'NORMAL',
      riskScore: Math.round(5 + Math.random() * 10),
      activeAnomaly: 'None',
    };
  });
}

export function buildInitialDevices(zones: Zone[]): IoTDevice[] {
  const now = Date.now();

  return [
    ...zones.map((z) => ({
      id: z.sensorId,
      name: z.sensorId,
      type: 'flow-sensor' as const,
      status: 'ONLINE' as const,
      battery: 70 + Math.round(Math.random() * 28),
      signal: 75 + Math.round(Math.random() * 23),
      lastUpdate: now,
      flow: z.currentFlow,
      temperature: 18 + Math.round(Math.random() * 6),
      zoneId: z.id,
    })),
    {
      id: 'ESP32-CAM-01',
      name: 'ESP32-CAM-01',
      type: 'camera',
      status: 'ONLINE',
      battery: 91,
      signal: 88,
      lastUpdate: now,
      temperature: 24,
      zoneId: 'canteen',
    },
    {
      id: 'ESP32-CAM-02',
      name: 'ESP32-CAM-02',
      type: 'camera',
      status: 'ONLINE',
      battery: 84,
      signal: 82,
      lastUpdate: now,
      temperature: 23,
      zoneId: 'washroom-f1',
    },
    {
      id: 'RASPBERRY-PI-01',
      name: 'RASPBERRY-PI-01',
      type: 'edge-server',
      status: 'ONLINE',
      battery: 100,
      signal: 100,
      lastUpdate: now,
      temperature: 41,
    },
  ];
}

export type ZoneStatus = 'NORMAL' | 'HIGH' | 'CRITICAL' | 'OFFLINE';

export type AnomalyType =
  | 'Hidden Leak'
  | 'Open Tap'
  | 'Toilet Leak'
  | 'Pipe Burst'
  | 'Unusual Consumption'
  | 'None';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'RESOLVED';

export interface Zone {
  id: string;
  name: string;
  category: string; // room type, e.g. "Санузел", "Лаборатория" — used to group the pipeline diagram
  units: number; // count of physical fixtures this zone represents (e.g. "×2" stalls)
  building: string;
  floor: number;
  sensorId: string;
  sensorOnline: boolean;
  currentFlow: number; // L/min
  baseline: number; // L/min expected
  stdDev: number;
  dailyConsumption: number; // L
  status: ZoneStatus;
  riskScore: number; // 0-100
  activeAnomaly: AnomalyType;
}

export interface FlowHistoryPoint {
  t: number; // epoch ms
  flow: number;
  baseline: number;
  anomaly: boolean;
}

export interface HistoricalPoint {
  timestamp: string; // ISO
  location: string;
  waterFlow: number;
  consumption: number;
  baseline: number;
  anomaly: boolean;
  anomalyType: AnomalyType;
}

export interface Anomaly {
  id: string;
  timestamp: number;
  zoneId: string;
  zoneName: string;
  type: AnomalyType;
  severity: Severity;
  confidence: number; // 0-100
  actualFlow: number;
  baselineFlow: number;
  deviation: number; // %
  estimatedLoss: number; // L
  active: boolean;
}

export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export interface Alert {
  id: string;
  timestamp: number;
  title: string;
  location: string;
  type: AnomalyType | 'Water Waste';
  severity: Severity;
  confidence: number;
  estimatedLoss: number; // L
  status: AlertStatus;
  read: boolean;
}

export type VisionScenario =
  | 'washing'
  | 'leaving'
  | 'waste'
  | 'closed';

export interface VisionState {
  scenario: VisionScenario;
  personDetected: boolean;
  handsDetected: boolean;
  waterFlow: boolean;
  wasteTimerSec: number;
  wasteDetected: boolean;
  estimatedWasteL: number;
}

export type DeviceType = 'flow-sensor' | 'camera' | 'edge-server';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING';

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  battery: number; // %
  signal: number; // %
  lastUpdate: number; // epoch ms
  flow?: number;
  temperature?: number;
  zoneId?: string;
}

export interface DemoStepDef {
  label: string;
  durationMs: number;
}

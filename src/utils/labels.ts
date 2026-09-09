import type { AnomalyType, Severity, ZoneStatus, AlertStatus, DeviceStatus, VisionScenario } from '../types';

/**
 * Internal state values stay in English (used as switch/comparison keys throughout
 * the simulation engine) — these maps translate them for display only.
 */

export const ANOMALY_TYPE_RU: Record<AnomalyType, string> = {
  'Hidden Leak': 'Скрытая утечка',
  'Open Tap': 'Открытый кран',
  'Toilet Leak': 'Протечка унитаза',
  'Pipe Burst': 'Порыв трубы',
  'Unusual Consumption': 'Нетипичное потребление',
  None: 'Норма',
};

export const SEVERITY_RU: Record<Severity, string> = {
  HIGH: 'ВЫСОКАЯ',
  MEDIUM: 'СРЕДНЯЯ',
  LOW: 'НИЗКАЯ',
  RESOLVED: 'РЕШЕНО',
};

export const ZONE_STATUS_RU: Record<ZoneStatus, string> = {
  NORMAL: 'НОРМА',
  HIGH: 'ВЫСОКИЙ',
  CRITICAL: 'КРИТИЧНО',
  OFFLINE: 'НЕ В СЕТИ',
};

export const ALERT_STATUS_RU: Record<AlertStatus, string> = {
  OPEN: 'ОТКРЫТО',
  INVESTIGATING: 'РАССЛЕДУЕТСЯ',
  RESOLVED: 'РЕШЕНО',
};

export const DEVICE_STATUS_RU: Record<DeviceStatus, string> = {
  ONLINE: 'В СЕТИ',
  OFFLINE: 'НЕ В СЕТИ',
  WARNING: 'ВНИМАНИЕ',
};

export const VISION_SCENARIO_RU: Record<VisionScenario, string> = {
  washing: 'Мытьё рук',
  leaving: 'Человек уходит',
  waste: 'Вода продолжает течь',
  closed: 'Кран закрыт',
};

import type { AnomalyType } from '../types';
import { dayShapeMultiplier, dormShapeMultiplier, isDormZone } from '../data/mockData';

export interface ForcedEvent {
  zoneId: string;
  type: AnomalyType;
  startedAt: number;
}

/** Pure function: given a forced event and elapsed seconds, returns an L/min offset to add on top of normal flow. */
export function forcedEventOffset(type: AnomalyType, elapsedSec: number, baseline: number): number {
  switch (type) {
    case 'Hidden Leak':
      // steady, modest, persistent leak
      return baseline * 1.8 + Math.sin(elapsedSec / 3) * baseline * 0.1;
    case 'Open Tap':
      // sharp burst that fades after ~25s
      if (elapsedSec > 28) return 0;
      return baseline * 3.2 * Math.max(0, 1 - elapsedSec / 40);
    case 'Toilet Leak':
      // periodic square-wave spikes
      return (Math.floor(elapsedSec / 4) % 2 === 0 ? baseline * 1.6 : baseline * 0.2);
    case 'Pipe Burst':
      // very rapid ramp to extreme, stays high
      return baseline * Math.min(6, 1 + elapsedSec * 0.6);
    case 'Unusual Consumption':
      return baseline * 1.4;
    default:
      return 0;
  }
}

export function naturalFlow(baseline: number, stdDev: number, hour: number, minute: number, category = ''): number {
  const shape = (isDormZone(category) ? dormShapeMultiplier : dayShapeMultiplier)(hour, minute);
  const noise = (Math.random() - 0.5) * stdDev * 0.6;
  return Math.max(0, baseline * shape + noise);
}

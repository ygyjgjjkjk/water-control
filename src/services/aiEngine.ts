import type { AnomalyType, Severity } from '../types';

/**
 * Local statistical "AI" — no external model, no network calls.
 * baseline = rolling historical mean for the current time-of-day bucket
 * threshold = baseline + 2 * stdDev
 * anomaly triggers when actual > threshold, classified by shape of deviation.
 */

export interface DetectionResult {
  isAnomaly: boolean;
  deviationPct: number;
  confidence: number;
  type: AnomalyType;
  severity: Severity;
}

export function detectAnomaly(
  actual: number,
  baseline: number,
  stdDev: number,
  context: { isNight: boolean; spikeSpeed: number; forcedType?: AnomalyType },
): DetectionResult {
  const threshold = baseline + 2 * stdDev;
  const deviationPct = baseline > 0 ? ((actual - baseline) / baseline) * 100 : 0;
  const isAnomaly = actual > threshold && deviationPct > 15;

  if (!isAnomaly) {
    return { isAnomaly: false, deviationPct, confidence: 0, type: 'None', severity: 'LOW' };
  }

  let type: AnomalyType = context.forcedType ?? 'Unusual Consumption';
  if (!context.forcedType) {
    if (context.isNight && deviationPct < 120) {
      type = 'Hidden Leak';
    } else if (context.spikeSpeed > 200 && deviationPct > 250) {
      type = 'Pipe Burst';
    } else if (context.spikeSpeed > 150) {
      type = 'Open Tap';
    } else if (deviationPct < 80) {
      type = 'Toilet Leak';
    } else {
      type = 'Unusual Consumption';
    }
  }

  const sigma = stdDev > 0 ? (actual - baseline) / stdDev : 4;
  const confidence = Math.min(99, 55 + sigma * 6 + Math.random() * 4);

  let severity: Severity = 'LOW';
  if (type === 'Pipe Burst' || deviationPct > 250) severity = 'HIGH';
  else if (deviationPct > 100) severity = 'HIGH';
  else if (deviationPct > 50) severity = 'MEDIUM';
  else severity = 'LOW';

  return { isAnomaly, deviationPct, confidence: Math.round(confidence), type, severity };
}

export function estimateLoss(deviationLPerMin: number, minutesElapsed: number): number {
  return Math.max(0, Math.round(deviationLPerMin * minutesElapsed * 10) / 10);
}

export function estimateCost(liters: number, pricePerLiter = 1.1): number {
  return Math.round(liters * pricePerLiter * 100) / 100;
}

export function riskScoreFor(deviationPct: number, hasActiveAnomaly: boolean): number {
  if (!hasActiveAnomaly) return Math.min(20, Math.max(2, Math.round(deviationPct / 4)));
  return Math.min(99, Math.round(40 + deviationPct / 3));
}

export interface AnomalyExplanation {
  reasons: string[];
  conclusion: string;
}

/** Explainable-AI layer: turns the numbers behind a detection into a short, human-readable rationale. */
export function explainAnomaly(
  a: { type: AnomalyType; actualFlow: number; baselineFlow: number; timestamp: number; severity: Severity },
  isNight: boolean,
): AnomalyExplanation {
  const ratio = a.baselineFlow > 0 ? a.actualFlow / a.baselineFlow : 0;
  const minutesActive = Math.max(1, Math.round((Date.now() - a.timestamp) / 1000));

  const reasons: string[] = [];
  if (ratio > 1) {
    reasons.push(`Потребление выросло в ${ratio.toFixed(1)}× по сравнению с нормой для этой зоны`);
  }
  reasons.push(`Аномальный расход продолжается уже ${minutesActive} мин`);
  if (isNight) {
    reasons.push('Событие произошло вне обычных часов работы школы');
  }

  const patternByType: Record<AnomalyType, string> = {
    'Hidden Leak': 'Постоянный низкий ночной расход ранее был характерен для скрытых утечек',
    'Pipe Burst': 'Резкий и очень сильный скачок расхода типичен для порыва трубы',
    'Toilet Leak': 'Периодические короткие всплески расхода характерны для неисправного сливного клапана',
    'Open Tap': 'Устойчивый высокий расход в течение короткого времени указывает на открытый кран',
    'Unusual Consumption': 'Профиль потребления заметно отличается от исторической нормы для этой зоны',
    None: '',
  };
  if (patternByType[a.type]) reasons.push(patternByType[a.type]);

  const conclusion =
    a.severity === 'HIGH'
      ? `Высокая вероятность: ${ANOMALY_CONCLUSION[a.type]}`
      : a.severity === 'MEDIUM'
        ? `Средняя вероятность: ${ANOMALY_CONCLUSION[a.type]}. Рекомендуется проверка.`
        : `Низкая вероятность отклонения. Рекомендуется наблюдение.`;

  return { reasons, conclusion };
}

const ANOMALY_CONCLUSION: Record<AnomalyType, string> = {
  'Hidden Leak': 'скрытая утечка воды',
  'Pipe Burst': 'порыв трубы, требуется немедленное вмешательство',
  'Toilet Leak': 'неисправность сливного механизма',
  'Open Tap': 'кран оставлен открытым без присмотра',
  'Unusual Consumption': 'нетипичное потребление, требующее внимания',
  None: 'отклонение от нормы',
};

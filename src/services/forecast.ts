export interface ForecastPoint {
  day: number;
  label: string;
  withoutAI: number;
  withAI: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Simulated 30-day forward projection. Not a real trained forecasting model:
 * "with AI" tracks the baseline closely (early leak detection keeps waste near-zero);
 * "without AI" drifts upward over the horizon as undetected minor leaks compound.
 */
export function generateForecast(baselineDailyLiters: number, days: number, seed = 42): ForecastPoint[] {
  const rand = seededRandom(seed);
  const points: ForecastPoint[] = [];
  const now = new Date();

  for (let i = 1; i <= days; i++) {
    const date = new Date(now.getTime() + i * 86_400_000);
    const noise = 0.95 + rand() * 0.1;
    const driftWithoutAI = 1 + Math.min(0.32, i * 0.007) + (rand() - 0.5) * 0.03;
    const withoutAI = Math.round(baselineDailyLiters * driftWithoutAI * noise);
    const withAI = Math.round(baselineDailyLiters * (0.97 + (noise - 1) * 0.25));
    points.push({
      day: i,
      label: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      withoutAI,
      withAI,
    });
  }
  return points;
}

export function summarizeForecast(points: ForecastPoint[]) {
  const totalWithoutAI = points.reduce((s, p) => s + p.withoutAI, 0);
  const totalWithAI = points.reduce((s, p) => s + p.withAI, 0);
  return {
    totalWithoutAI,
    totalWithAI,
    potentialSavingLiters: Math.max(0, totalWithoutAI - totalWithAI),
    wasteWithoutAI: Math.max(0, Math.round(totalWithoutAI - totalWithAI * 0.97)),
    wasteWithAI: Math.round(totalWithAI * 0.03),
  };
}

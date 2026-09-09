/** Returns [number part, unit part] so callers can style them separately without splitting a localized string on spaces. */
export function splitLiters(l: number): [string, string] {
  if (l >= 1_000_000) return [(l / 1_000_000).toFixed(2), 'млн л'];
  if (l >= 1000) return [(l / 1000).toFixed(1), 'тыс. л'];
  return [Math.round(l).toLocaleString('ru-RU'), 'л'];
}

export function formatLiters(l: number): string {
  const [value, unit] = splitLiters(l);
  return `${value} ${unit}`;
}

export function formatFlow(l: number): string {
  return `${l.toFixed(1)} л/мин`;
}

/** Simulation pricing uses an illustrative institutional water+sewerage tariff in KZT. */
export function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)} млн ₸`;
  return `${Math.round(v).toLocaleString('ru-RU')} ₸`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatTimeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} с назад`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  return `${hr} ч назад`;
}

export function formatSimTime(simMinutes: number): string {
  const h = Math.floor(simMinutes / 60) % 24;
  const m = simMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

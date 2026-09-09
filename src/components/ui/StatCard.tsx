import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  accent = 'cyan',
}: {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  accent?: 'cyan' | 'amber' | 'rose' | 'emerald';
}) {
  const accentMap = {
    cyan: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    amber: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
    emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[var(--color-text-dim)] tracking-wide uppercase">{label}</span>
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center border', accentMap[accent])}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-white tabular-nums">{value}</span>
        {unit && <span className="text-xs text-[var(--color-text-dim)]">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={clsx('mt-2 text-xs font-medium flex items-center gap-1', trend <= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          <span>{trend <= 0 ? '↓' : '↑'} {Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className="text-[var(--color-text-dim)] font-normal">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

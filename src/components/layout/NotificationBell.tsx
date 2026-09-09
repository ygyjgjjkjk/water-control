import { useState, useRef, useEffect } from 'react';
import { Bell, Droplet } from 'lucide-react';
import { useSimulationStore } from '../../simulation/store';
import { SeverityBadge } from '../ui/Badge';
import { formatTimeAgo } from '../../utils/format';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const alerts = useSimulationStore((s) => s.alerts);
  const investigateAlert = useSimulationStore((s) => s.investigateAlert);
  const resolveAlert = useSimulationStore((s) => s.resolveAlert);
  const markAllAlertsRead = useSimulationStore((s) => s.markAllAlertsRead);

  const unread = alerts.filter((a) => !a.read).length;
  const recent = alerts.slice(0, 6);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllAlertsRead();
        }}
        className="relative w-9 h-9 rounded-lg glass flex items-center justify-center text-[var(--color-text-dim)] hover:text-white transition-colors"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 glass-strong rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Тревоги ИИ</span>
            <span className="text-[11px] text-[var(--color-text-dim)]">{recent.length} недавних</span>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {recent.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-dim)]">Тревог пока нет. Все системы в норме.</div>
            )}
            {recent.map((a) => (
              <div key={a.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Droplet size={12} className="text-cyan-300" />
                    {a.title}
                  </div>
                  <SeverityBadge severity={a.severity} />
                </div>
                <div className="text-[11px] text-[var(--color-text-dim)] space-y-0.5">
                  <div>Локация: {a.location}</div>
                  <div>Уверенность ИИ: {a.confidence}% · Потери: {a.estimatedLoss.toFixed(1)} л</div>
                  <div>{formatTimeAgo(a.timestamp)}</div>
                </div>
                {a.status !== 'RESOLVED' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => investigateAlert(a.id)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                    >
                      Расследовать
                    </button>
                    <button
                      onClick={() => resolveAlert(a.id)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/5 text-[var(--color-text-dim)] border border-white/10 hover:text-white transition-colors"
                    >
                      Отметить решённым
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

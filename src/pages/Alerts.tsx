import { useState } from 'react';
import clsx from 'clsx';
import { Bell, MapPin, Gauge, BrainCircuit, Droplets } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { SeverityBadge, AlertStatusBadge } from '../components/ui/Badge';
import { formatTimeAgo } from '../utils/format';
import { ANOMALY_TYPE_RU } from '../utils/labels';
import type { AlertStatus } from '../types';

const FILTERS: { id: AlertStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Все' },
  { id: 'OPEN', label: 'Открытые' },
  { id: 'INVESTIGATING', label: 'В работе' },
  { id: 'RESOLVED', label: 'Решённые' },
];

function alertTypeLabel(type: string): string {
  if (type === 'Water Waste') return 'Перерасход воды';
  return ANOMALY_TYPE_RU[type as keyof typeof ANOMALY_TYPE_RU] ?? type;
}

export function Alerts() {
  const alerts = useSimulationStore((s) => s.alerts);
  const investigateAlert = useSimulationStore((s) => s.investigateAlert);
  const resolveAlert = useSimulationStore((s) => s.resolveAlert);
  const [filter, setFilter] = useState<AlertStatus | 'ALL'>('ALL');

  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Bell size={20} className="text-cyan-300" /> Центр тревог
          </h1>
          <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Все события, сгенерированные ИИ по водной инфраструктуре</p>
        </div>
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors',
                filter === f.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-[var(--color-text-dim)] hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Panel>
            <div className="py-14 text-center text-sm text-[var(--color-text-dim)]">В этом фильтре нет тревог.</div>
          </Panel>
        )}
        {filtered.map((a) => (
          <Panel key={a.id}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center border shrink-0',
                    a.severity === 'HIGH' && 'bg-rose-500/10 border-rose-500/25',
                    a.severity === 'MEDIUM' && 'bg-amber-500/10 border-amber-500/25',
                    a.severity === 'LOW' && 'bg-sky-500/10 border-sky-500/25',
                    a.severity === 'RESOLVED' && 'bg-emerald-500/10 border-emerald-500/25',
                  )}
                >
                  <Droplets
                    size={17}
                    className={clsx(
                      a.severity === 'HIGH' && 'text-rose-300',
                      a.severity === 'MEDIUM' && 'text-amber-300',
                      a.severity === 'LOW' && 'text-sky-300',
                      a.severity === 'RESOLVED' && 'text-emerald-300',
                    )}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{a.title}</div>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-dim)] mt-1">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {a.location}</span>
                    <span>{formatTimeAgo(a.timestamp)}</span>
                    <span>{new Date(a.timestamp).toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={a.severity} />
                <AlertStatusBadge status={a.status} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><Gauge size={13} /> Тип: <span className="text-white font-medium">{alertTypeLabel(a.type)}</span></div>
              <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><BrainCircuit size={13} /> Уверенность ИИ: <span className="text-cyan-300 font-medium">{a.confidence}%</span></div>
              <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><Droplets size={13} /> Потери: <span className="text-white font-medium">{a.estimatedLoss.toFixed(1)} л</span></div>
            </div>

            {a.status !== 'RESOLVED' && (
              <div className="flex gap-2 mt-4">
                {a.status === 'OPEN' && (
                  <button
                    onClick={() => investigateAlert(a.id)}
                    className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/20 transition-colors"
                  >
                    Расследовать
                  </button>
                )}
                <button
                  onClick={() => resolveAlert(a.id)}
                  className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white/5 text-[var(--color-text-dim)] border border-white/10 hover:text-white transition-colors"
                >
                  Отметить решённым
                </button>
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}

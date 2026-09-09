import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { StatusBadge } from '../components/ui/Badge';
import { Sparkline } from '../components/charts/Sparkline';
import { formatFlow } from '../utils/format';
import { Gauge, Radio } from 'lucide-react';
import { ANOMALY_TYPE_RU } from '../utils/labels';

const STATUS_COLOR: Record<string, string> = {
  NORMAL: '#34d399',
  HIGH: '#f59e0b',
  CRITICAL: '#f43f5e',
  OFFLINE: '#64748b',
};

export function LiveMonitoring() {
  const zones = useSimulationStore((s) => s.zones);
  const liveHistory = useSimulationStore((s) => s.liveHistory);
  const mainZone = zones.find((z) => z.id === 'main');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white">Мониторинг в реальном времени</h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Расход в реальном времени по каждой контролируемой зоне школы</p>
      </div>

      <Panel title="Главная водная магистраль" subtitle="Суммарный приток воды в здание">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
            <Gauge size={24} className="text-cyan-300" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-white tabular-nums">{mainZone ? formatFlow(mainZone.currentFlow) : '—'}</div>
            <div className="text-xs text-[var(--color-text-dim)] mt-0.5">Датчик {mainZone?.sensorId} · Сумма по {zones.length - 1} зонам</div>
          </div>
          <div className="w-64">
            {mainZone && <Sparkline id="main" data={liveHistory['main'] ?? []} color="#22d3ee" height={56} />}
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {zones.filter((z) => z.id !== 'main').map((zone) => (
          <Panel key={zone.id} className="relative">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wide">{zone.building}</div>
                <div className="text-sm font-semibold text-white mt-0.5">{zone.name}</div>
              </div>
              <StatusBadge status={zone.status} />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums mb-3">{formatFlow(zone.currentFlow)}</div>
            <Sparkline id={zone.id} data={liveHistory[zone.id] ?? []} color={STATUS_COLOR[zone.status]} />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[11px] text-[var(--color-text-dim)]">
              <span className="flex items-center gap-1"><Radio size={11} /> {zone.sensorId}</span>
              <span>Норма {zone.baseline.toFixed(1)} л/мин</span>
            </div>
            {zone.activeAnomaly !== 'None' && (
              <div className="mt-2 text-[11px] font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-md px-2 py-1">
                ИИ обнаружил: {ANOMALY_TYPE_RU[zone.activeAnomaly]}
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Building2, Radio, X, Lock } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { StatusBadge } from '../components/ui/Badge';
import { formatFlow } from '../utils/format';
import { DEMO_TARGET_ZONE } from '../simulation/demoScript';
import { ANOMALY_TYPE_RU } from '../utils/labels';

const FLOORS = [
  { id: 0, label: '1 этаж' },
  { id: 1, label: '2 этаж' },
  { id: 2, label: '3 этаж' },
];

const STATUS_FILL: Record<string, string> = {
  NORMAL: 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20',
  HIGH: 'bg-amber-500/15 border-amber-500/50 hover:bg-amber-500/25',
  CRITICAL: 'bg-rose-500/20 border-rose-500/60 hover:bg-rose-500/30',
  OFFLINE: 'bg-slate-500/10 border-slate-500/40',
};

export function DigitalTwin() {
  const zones = useSimulationStore((s) => s.zones);
  const demoMode = useSimulationStore((s) => s.demoMode);
  const isolatedZoneIds = useSimulationStore((s) => s.isolatedZoneIds);
  const isolateZone = useSimulationStore((s) => s.isolateZone);
  const restoreZone = useSimulationStore((s) => s.restoreZone);
  const location = useLocation();
  const [floor, setFloor] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const floorZones = zones.filter((z) => z.id !== 'main' && z.floor === floor);
  const selected = zones.find((z) => z.id === selectedId);
  const selectedIsolated = selected ? isolatedZoneIds.includes(selected.id) : false;

  useEffect(() => {
    if (demoMode) {
      const target = zones.find((z) => z.id === DEMO_TARGET_ZONE);
      if (target) {
        setFloor(target.floor);
        setSelectedId(target.id);
      }
    }
  }, [demoMode, zones]);

  useEffect(() => {
    const requestedZoneId = (location.state as { zoneId?: string } | null)?.zoneId;
    if (requestedZoneId) {
      const target = zones.find((z) => z.id === requestedZoneId);
      if (target) {
        setFloor(target.floor);
        setSelectedId(target.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Building2 size={20} className="text-cyan-300" /> Цифровой двойник
          </h1>
          <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Интерактивная модель водной инфраструктуры школы</p>
        </div>
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
          {FLOORS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFloor(f.id)}
              className={clsx(
                'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors',
                floor === f.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-[var(--color-text-dim)] hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel className="xl:col-span-2" title={FLOORS.find((f) => f.id === floor)?.label} subtitle="Нажмите на помещение, чтобы посмотреть данные датчика">
          <div className="rounded-xl border border-white/10 grid-fade p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {floorZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedId(zone.id)}
                  className={clsx(
                    'relative rounded-lg border transition-all flex flex-col items-start justify-between p-2.5 text-left min-h-[72px]',
                    STATUS_FILL[zone.status],
                    selectedId === zone.id && 'ring-2 ring-cyan-400 z-10',
                    zone.status === 'CRITICAL' && 'animate-pulse',
                  )}
                >
                  <span className="text-[11px] font-semibold text-white leading-tight flex items-center gap-1">
                    {isolatedZoneIds.includes(zone.id) && <Lock size={10} className="text-cyan-300 shrink-0" />}
                    {zone.name}
                    {zone.units > 1 && <span className="text-[var(--color-text-dim)] font-normal">×{zone.units}</span>}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-dim)] tabular-nums">{formatFlow(zone.currentFlow)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-[11px] text-[var(--color-text-dim)]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/60" /> Норма</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500/60" /> Высокий</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 border border-rose-500/60" /> Критично</span>
          </div>
        </Panel>

        <Panel title="Информация о помещении" subtitle={selected ? selected.name : 'Выберите помещение на плане'}>
          {!selected && (
            <div className="h-64 flex items-center justify-center text-sm text-[var(--color-text-dim)] text-center px-6">
              Нажмите на любое помещение на плане, чтобы увидеть данные датчика в реальном времени.
            </div>
          )}
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{selected.name}</div>
                  <div className="text-xs text-[var(--color-text-dim)]">
                    {selected.building} · {selected.category}
                    {selected.units > 1 && ` · ${selected.units} точки водозабора`}
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-[var(--color-text-dim)] hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                {selectedIsolated && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                    <Lock size={11} /> ИЗОЛИРОВАНО
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                  <div className="text-[10px] text-[var(--color-text-dim)] uppercase mb-1">Расход воды</div>
                  <div className="text-lg font-bold text-white tabular-nums">{formatFlow(selected.currentFlow)}</div>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                  <div className="text-[10px] text-[var(--color-text-dim)] uppercase mb-1">Расход за день</div>
                  <div className="text-lg font-bold text-white tabular-nums">{Math.round(selected.dailyConsumption).toLocaleString('ru-RU')} л</div>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                  <div className="text-[10px] text-[var(--color-text-dim)] uppercase mb-1">Индекс риска ИИ</div>
                  <div className={clsx('text-lg font-bold tabular-nums', selected.riskScore > 60 ? 'text-rose-300' : selected.riskScore > 30 ? 'text-amber-300' : 'text-emerald-300')}>
                    {selected.riskScore}/100
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                  <div className="text-[10px] text-[var(--color-text-dim)] uppercase mb-1">Статус датчика</div>
                  <div className="text-lg font-bold text-emerald-300 flex items-center gap-1.5"><Radio size={14} /> В сети</div>
                </div>
              </div>

              {selected.activeAnomaly !== 'None' && !selectedIsolated && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-300">
                  ИИ обнаружил активную аномалию: <strong>{ANOMALY_TYPE_RU[selected.activeAnomaly]}</strong> в этом помещении.
                </div>
              )}

              {selected.id !== 'main' && (
                <button
                  onClick={() => (selectedIsolated ? restoreZone(selected.id) : isolateZone(selected.id))}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-lg border transition-colors',
                    selectedIsolated
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25 hover:bg-cyan-500/20',
                  )}
                >
                  <Lock size={13} />
                  {selectedIsolated ? 'Восстановить подачу воды' : 'Изолировать участок'}
                </button>
              )}

              <div className="text-[11px] text-[var(--color-text-dim)] pt-2 border-t border-white/5">
                ID датчика: <span className="text-white/80">{selected.sensorId}</span> · Норма {selected.baseline.toFixed(1)} л/мин
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

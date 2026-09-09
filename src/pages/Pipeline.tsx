import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Waypoints, Droplets, Lock, X } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { StatusBadge } from '../components/ui/Badge';
import { formatFlow } from '../utils/format';
import { ANOMALY_TYPE_RU } from '../utils/labels';
import type { Zone, ZoneStatus } from '../types';

const LEAF_SPACING = 108;
const LEAF_Y = 300;
const FLOOR_Y = 150;
const MAIN_Y = 40;
const FLOOR_LABELS = ['1 этаж', '2 этаж', '3 этаж'];

const STATUS_HEX: Record<ZoneStatus, string> = {
  NORMAL: '#34d399',
  HIGH: '#f59e0b',
  CRITICAL: '#f43f5e',
  OFFLINE: '#64748b',
};

const STATUS_RANK: Record<ZoneStatus, number> = { NORMAL: 0, OFFLINE: 0, HIGH: 1, CRITICAL: 2 };

function worstStatus(zones: Zone[]): ZoneStatus {
  return zones.reduce<ZoneStatus>((worst, z) => (STATUS_RANK[z.status] > STATUS_RANK[worst] ? z.status : worst), 'NORMAL');
}

export function Pipeline() {
  const zones = useSimulationStore((s) => s.zones);
  const isolatedZoneIds = useSimulationStore((s) => s.isolatedZoneIds);
  const isolateZone = useSimulationStore((s) => s.isolateZone);
  const restoreZone = useSimulationStore((s) => s.restoreZone);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leaves = zones.filter((z) => z.id !== 'main');
  const selected = zones.find((z) => z.id === selectedId);
  const selectedIsolated = selected ? isolatedZoneIds.includes(selected.id) : false;

  // Lay out leaves left-to-right grouped by floor, then compute each floor node
  // as the centroid of its children and the main line as the centroid of the floors.
  const layout = useMemo(() => {
    const leafX: Record<string, number> = {};
    let cursor = LEAF_SPACING / 2 + 20;
    const floors = [0, 1, 2].map((floorId) => {
      const floorZones = leaves.filter((z) => z.floor === floorId);
      const xs: number[] = [];
      for (const z of floorZones) {
        leafX[z.id] = cursor;
        xs.push(cursor);
        cursor += LEAF_SPACING;
      }
      const x = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
      return { floorId, x, zones: floorZones };
    });
    const totalWidth = cursor + 20;
    const mainX = totalWidth / 2;
    return { leafX, floors, totalWidth, mainX };
  }, [leaves]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Waypoints size={20} className="text-cyan-300" /> Схема трубопровода
        </h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Главная магистраль → этажи → помещения реального здания школы, с анимированным движением воды</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel className="xl:col-span-2" title="Топология сети" subtitle="Нажмите на узел, чтобы увидеть данные датчика · схема прокручивается по горизонтали">
          <div className="overflow-x-auto">
            <svg width={layout.totalWidth} height={380} viewBox={`0 0 ${layout.totalWidth} 380`}>
              {/* main -> floor pipes */}
              {layout.floors.map((f) => {
                if (!f.zones.length) return null;
                const color = STATUS_HEX[worstStatus(f.zones)];
                return (
                  <line
                    key={`main-${f.floorId}`}
                    x1={layout.mainX}
                    y1={MAIN_Y + 14}
                    x2={f.x}
                    y2={FLOOR_Y - 14}
                    stroke={color}
                    strokeWidth={4}
                    className="flow-line"
                    opacity={0.8}
                  />
                );
              })}

              {/* floor -> leaf pipes */}
              {leaves.map((z) => {
                const floor = layout.floors.find((f) => f.floorId === z.floor)!;
                const leafX = layout.leafX[z.id];
                const isolated = isolatedZoneIds.includes(z.id);
                return (
                  <line
                    key={`floor-${z.id}`}
                    x1={floor.x}
                    y1={FLOOR_Y + 14}
                    x2={leafX}
                    y2={LEAF_Y - 20}
                    stroke={isolated ? '#334155' : STATUS_HEX[z.status]}
                    strokeWidth={3}
                    className={isolated ? undefined : 'flow-line'}
                    opacity={isolated ? 0.4 : 0.85}
                  />
                );
              })}

              {/* main node */}
              <g onClick={() => setSelectedId('main')} className="cursor-pointer">
                <circle cx={layout.mainX} cy={MAIN_Y} r={18} fill="#0b0f18" stroke="#22d3ee" strokeWidth={2} />
                <Droplets x={layout.mainX - 8} y={MAIN_Y - 8} width={16} height={16} color="#22d3ee" />
                <text x={layout.mainX} y={MAIN_Y + 34} fill="#e6edf5" fontSize="11" textAnchor="middle" fontWeight={600}>Магистраль</text>
              </g>

              {/* floor nodes */}
              {layout.floors.map((f) => (
                <g key={f.floorId}>
                  <rect x={f.x - 34} y={FLOOR_Y - 14} width={68} height={28} rx={8} fill="#0b0f18" stroke={STATUS_HEX[worstStatus(f.zones)]} strokeWidth={1.5} />
                  <text x={f.x} y={FLOOR_Y + 4} fill="#e6edf5" fontSize="11" textAnchor="middle" fontWeight={600}>{FLOOR_LABELS[f.floorId]}</text>
                </g>
              ))}

              {/* leaf nodes */}
              {leaves.map((z) => {
                const x = layout.leafX[z.id];
                const isolated = isolatedZoneIds.includes(z.id);
                const hasAnomaly = z.activeAnomaly !== 'None';
                const label = z.name.replace(/\s*—\s*\d\s*этаж$/, '');
                return (
                  <g key={z.id} onClick={() => setSelectedId(z.id)} className="cursor-pointer">
                    <rect
                      x={x - 46}
                      y={LEAF_Y - 20}
                      width={92}
                      height={48}
                      rx={9}
                      fill={hasAnomaly ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.03)'}
                      stroke={isolated ? '#334155' : STATUS_HEX[z.status]}
                      strokeWidth={selectedId === z.id ? 2.5 : 1.5}
                      className={hasAnomaly && !isolated ? 'animate-pulse' : undefined}
                    />
                    {isolated && <Lock x={x - 42} y={LEAF_Y - 17} width={11} height={11} color="#67e8f9" />}
                    <text x={x} y={LEAF_Y - 4} fill="#e6edf5" fontSize="9" textAnchor="middle" fontWeight={600}>
                      {label.length > 14 ? label.slice(0, 13) + '…' : label}
                    </text>
                    {z.units > 1 && (
                      <text x={x} y={LEAF_Y + 8} fill="#67e8f9" fontSize="8" textAnchor="middle">×{z.units}</text>
                    )}
                    <text x={x} y={LEAF_Y + 22} fill="#8b98ab" fontSize="9" textAnchor="middle" className="tabular-nums">
                      {formatFlow(z.currentFlow)}
                    </text>
                    {hasAnomaly && !isolated && (
                      <text x={x + 38} y={LEAF_Y - 22} fill="#fb7185" fontSize="13" textAnchor="middle" fontWeight={700}>⚠</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-[var(--color-text-dim)]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" /> Норма</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/60" /> Высокий</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/60" /> Критично</span>
            <span className="flex items-center gap-1.5"><Lock size={11} className="text-cyan-300" /> Изолировано</span>
          </div>
        </Panel>

        <Panel title="Информация об участке" subtitle={selected ? selected.name : 'Выберите узел на схеме'}>
          {!selected && (
            <div className="h-64 flex items-center justify-center text-sm text-[var(--color-text-dim)] text-center px-6">
              Нажмите на магистраль, этаж или помещение на схеме, чтобы увидеть подробности.
            </div>
          )}
          {selected && <LeafDetail zone={selected} isolated={selectedIsolated} onClose={() => setSelectedId(null)} onIsolate={isolateZone} onRestore={restoreZone} />}
        </Panel>
      </div>
    </div>
  );
}

function LeafDetail({
  zone,
  isolated,
  onClose,
  onIsolate,
  onRestore,
}: {
  zone: Zone;
  isolated: boolean;
  onClose: () => void;
  onIsolate: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const anomalies = useSimulationStore((s) => s.anomalies);
  const activeAnomaly = anomalies.find((a) => a.zoneId === zone.id && a.active);
  const flowLoss = activeAnomaly ? Math.max(0, activeAnomaly.actualFlow - activeAnomaly.baselineFlow) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-white">{zone.name}</div>
          <div className="text-xs text-[var(--color-text-dim)]">
            {zone.building} · {zone.category}
            {zone.units > 1 && ` · ${zone.units} точки водозабора`}
          </div>
        </div>
        <button onClick={onClose} className="text-[var(--color-text-dim)] hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={zone.status} />
        {isolated && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
            <Lock size={11} /> ИЗОЛИРОВАНО
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
          <div className="text-[10px] text-[var(--color-text-dim)] uppercase mb-1">Расход</div>
          <div className="text-lg font-bold text-white tabular-nums">{formatFlow(zone.currentFlow)}</div>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
          <div className="text-[10px] text-[var(--color-text-dim)] uppercase mb-1">Норма</div>
          <div className="text-lg font-bold text-white tabular-nums">{zone.baseline.toFixed(1)} л/мин</div>
        </div>
      </div>

      {activeAnomaly && !isolated && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-4 space-y-2">
          <div className="text-xs font-bold text-rose-300 uppercase tracking-wide">{ANOMALY_TYPE_RU[activeAnomaly.type]}</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-rose-200/90">
            <div>Вероятность утечки: <span className="font-bold text-white">{activeAnomaly.confidence}%</span></div>
            <div>Потери: <span className="font-bold text-white">{flowLoss.toFixed(1)} л/мин</span></div>
          </div>
          <div className="text-xs text-rose-200/90">Локация: <span className="font-bold text-white">{zone.building} → {zone.name}</span></div>
        </div>
      )}

      {zone.id !== 'main' && (
        <button
          onClick={() => (isolated ? onRestore(zone.id) : onIsolate(zone.id))}
          className={clsx(
            'w-full flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-lg border transition-colors',
            isolated
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25 hover:bg-cyan-500/20',
          )}
        >
          <Lock size={13} />
          {isolated ? 'Восстановить подачу воды' : 'Изолировать участок'}
        </button>
      )}
    </div>
  );
}

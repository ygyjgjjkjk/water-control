import { useMemo, useState } from 'react';
import { BrainCircuit, Droplet, Timer, Waves, Gauge, TrendingUp, Sparkles } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { SeverityBadge } from '../components/ui/Badge';
import { AnomalyChart } from '../components/charts/AnomalyChart';
import { formatTimeAgo } from '../utils/format';
import { explainAnomaly } from '../services/aiEngine';
import { isNightHour } from '../data/mockData';
import { ANOMALY_TYPE_RU } from '../utils/labels';
import type { AnomalyType } from '../types';

const ANOMALY_INFO: { type: AnomalyType; icon: typeof Droplet; desc: string }[] = [
  { type: 'Hidden Leak', icon: Droplet, desc: 'Постоянный низкий расход, сохраняющийся ночью, когда потребление не ожидается.' },
  { type: 'Open Tap', icon: Waves, desc: 'Резкий, высокий расход в течение короткого времени — забытый открытым кран.' },
  { type: 'Toilet Leak', icon: Timer, desc: 'Периодические небольшие всплески расхода, характерные для неисправного сливного клапана.' },
  { type: 'Pipe Burst', icon: Gauge, desc: 'Крайне резкое и сильное увеличение расхода — признак структурного повреждения.' },
  { type: 'Unusual Consumption', icon: TrendingUp, desc: 'Расход заметно отличается от изученного исторического профиля зоны.' },
];

export function AIDetection() {
  const zones = useSimulationStore((s) => s.zones);
  const liveHistory = useSimulationStore((s) => s.liveHistory);
  const anomalies = useSimulationStore((s) => s.anomalies);
  const resolveAlert = useSimulationStore((s) => s.resolveAlert);
  const alerts = useSimulationStore((s) => s.alerts);
  const historicalData = useSimulationStore((s) => s.historicalData);
  const simMinutes = useSimulationStore((s) => s.simMinutes);
  const [selectedZone, setSelectedZone] = useState('toilet-f3-w');

  const zone = zones.find((z) => z.id === selectedZone) ?? zones[0];
  const chartData = liveHistory[selectedZone] ?? [];
  const recentAnomalies = useMemo(() => [...anomalies].reverse().slice(0, 8), [anomalies]);

  const weekData = useMemo(
    () =>
      historicalData
        .filter((h) => h.location === zone?.name)
        .map((h) => ({ t: new Date(h.timestamp).getTime(), flow: h.waterFlow, baseline: h.baseline, anomaly: h.anomaly })),
    [historicalData, zone?.name],
  );
  const weekAnomalyCount = weekData.filter((d) => d.anomaly).length;

  const threshold = zone ? zone.baseline + 2 * zone.stdDev : 0;

  const activeAnomalyForZone = zone ? anomalies.find((a) => a.zoneId === zone.id && a.active) : undefined;
  const explanation = activeAnomalyForZone
    ? explainAnomaly(activeAnomalyForZone, isNightHour(Math.floor(simMinutes / 60)))
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <BrainCircuit size={20} className="text-cyan-300" /> ИИ-детекция аномалий
          </h1>
          <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Статистическая модель нормы · порог = норма + 2σ</p>
        </div>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 py-2 outline-none focus:border-cyan-500/50"
        >
          {zones.filter((z) => z.id !== 'main').map((z) => (
            <option key={z.id} value={z.id} className="bg-slate-900">{z.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Panel><div className="text-xs text-[var(--color-text-dim)] mb-1">Историческая норма</div><div className="text-xl font-bold text-white tabular-nums">{zone?.baseline.toFixed(1)} л/мин</div></Panel>
        <Panel><div className="text-xs text-[var(--color-text-dim)] mb-1">Текущее потребление</div><div className="text-xl font-bold text-white tabular-nums">{zone?.currentFlow.toFixed(1)} л/мин</div></Panel>
        <Panel><div className="text-xs text-[var(--color-text-dim)] mb-1">Порог тревоги (2σ)</div><div className="text-xl font-bold text-white tabular-nums">{threshold.toFixed(1)} л/мин</div></Panel>
        <Panel>
          <div className="text-xs text-[var(--color-text-dim)] mb-1">Классификация</div>
          <div className={`text-xl font-bold tabular-nums ${zone?.activeAnomaly !== 'None' ? 'text-rose-300' : 'text-emerald-300'}`}>
            {zone?.activeAnomaly !== 'None' ? ANOMALY_TYPE_RU[zone!.activeAnomaly] : 'Норма'}
          </div>
        </Panel>
      </div>

      <Panel title={`${zone?.name} — норма против фактического расхода`} subtitle="Красные точки отмечают показания, отмеченные ИИ как аномальные">
        <AnomalyChart data={chartData} />
      </Panel>

      {explanation && (
        <Panel title="Объяснение ИИ" subtitle="Почему это было обнаружено?">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-cyan-300" />
            </div>
            <ul className="space-y-1.5 text-sm text-[var(--color-text-dim)]">
              {explanation.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-2.5 text-sm text-cyan-200 font-medium">
            Вывод: {explanation.conclusion}
          </div>
        </Panel>
      )}

      <Panel
        title={`${zone?.name} — история за 7 дней`}
        subtitle={`Почасовая история потребления, на основе которой обучена модель нормы · ${weekAnomalyCount} аномальн${weekAnomalyCount === 1 ? 'ый час' : 'ых часа(ов)'} за неделю`}
      >
        <AnomalyChart data={weekData} height={200} dateMode />
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Panel title="Обнаруженные аномалии" subtitle="Сначала самые недавние">
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {recentAnomalies.length === 0 && <div className="text-sm text-[var(--color-text-dim)] text-center py-10">Аномалий не обнаружено. Все зоны в норме.</div>}
            {recentAnomalies.map((a) => {
              const linkedAlert = alerts.find((al) => al.location === a.zoneName && al.type === a.type);
              return (
                <div key={a.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{ANOMALY_TYPE_RU[a.type]}</div>
                      <div className="text-xs text-[var(--color-text-dim)]">{a.zoneName} · {formatTimeAgo(a.timestamp)}</div>
                    </div>
                    <SeverityBadge severity={a.active ? a.severity : 'RESOLVED'} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-dim)] mb-2">
                    <div>Норма: <span className="text-white font-medium">{a.baselineFlow.toFixed(1)} л/мин</span></div>
                    <div>Факт: <span className="text-white font-medium">{a.actualFlow.toFixed(1)} л/мин</span></div>
                    <div>Отклонение: <span className="text-rose-300 font-medium">+{a.deviation}%</span></div>
                    <div>Уверенность ИИ: <span className="text-cyan-300 font-medium">{a.confidence}%</span></div>
                  </div>
                  {a.active && linkedAlert && linkedAlert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveAlert(linkedAlert.id)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/5 text-[var(--color-text-dim)] border border-white/10 hover:text-white transition-colors"
                    >
                      Отметить решённым
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Модель классификации аномалий" subtitle="Локальный статистический классификатор — без обращения к внешнему ИИ">
          <div className="space-y-3">
            {ANOMALY_INFO.map((info) => (
              <div key={info.type} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <info.icon size={16} className="text-cyan-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{ANOMALY_TYPE_RU[info.type]}</div>
                  <div className="text-xs text-[var(--color-text-dim)] mt-0.5">{info.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

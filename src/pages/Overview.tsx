import { Droplets, Gauge, Wallet, Leaf, AlertTriangle, HeartPulse, Zap, Waves, AlertOctagon } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { StatCard } from '../components/ui/StatCard';
import { Panel } from '../components/ui/Panel';
import { StatusBadge } from '../components/ui/Badge';
import { FlowAreaChart } from '../components/charts/FlowAreaChart';
import { formatLiters, formatCurrency, formatFlow, splitLiters } from '../utils/format';
import { expectedConsumptionSoFar } from '../data/mockData';
import { SCHOOL_PROFILE } from '../data/schoolProfile';

export function Overview() {
  const zones = useSimulationStore((s) => s.zones);
  const todayConsumption = useSimulationStore((s) => s.todayConsumption);
  const monthConsumption = useSimulationStore((s) => s.monthConsumption);
  const estimatedCost = useSimulationStore((s) => s.estimatedCost);
  const waterSaved = useSimulationStore((s) => s.waterSaved);
  const alerts = useSimulationStore((s) => s.alerts);
  const aggregateHistory = useSimulationStore((s) => s.aggregateHistory);
  const simulateLeak = useSimulationStore((s) => s.simulateLeak);
  const simulateWaterWaste = useSimulationStore((s) => s.simulateWaterWaste);
  const simMinutes = useSimulationStore((s) => s.simMinutes);

  const mainZone = zones.find((z) => z.id === 'main');
  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const baselineTotal = zones
    .filter((z) => z.id !== 'main')
    .reduce((s, z) => s + expectedConsumptionSoFar(z.baseline, simMinutes || 1, z.category), 0);
  const trend = baselineTotal > 0 ? ((todayConsumption - baselineTotal) / baselineTotal) * 100 : 0;

  const [todayValue, todayUnit] = splitLiters(todayConsumption);
  const [monthValue, monthUnit] = splitLiters(monthConsumption);
  const [savedValue, savedUnit] = splitLiters(waterSaved);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Обзор</h1>
          <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Сводка по водной инфраструктуре в реальном времени</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => simulateLeak()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/25 hover:bg-rose-500/20 transition-colors"
          >
            <Zap size={14} /> Смоделировать утечку
          </button>
          <button
            onClick={() => simulateLeak(undefined, 'Pipe Burst')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600/15 text-rose-200 border border-rose-500/40 hover:bg-rose-600/25 transition-colors"
          >
            <AlertOctagon size={14} /> Смоделировать порыв трубы
          </button>
          <button
            onClick={simulateWaterWaste}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
          >
            <Waves size={14} /> Смоделировать перерасход
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Текущий расход" value={mainZone ? formatFlow(mainZone.currentFlow).split(' ')[0] : '0'} unit="л/мин" icon={Gauge} accent="cyan" />
        <StatCard label="Сегодня" value={todayValue} unit={todayUnit} icon={Droplets} accent="cyan" trend={trend} trendLabel="от нормы" />
        <StatCard label="За месяц" value={monthValue} unit={monthUnit} icon={Droplets} accent="cyan" />
        <StatCard label="Расходы" value={formatCurrency(estimatedCost)} unit="/ мес." icon={Wallet} accent="amber" />
        <StatCard label="Экономия воды" value={savedValue} unit={savedUnit} icon={Leaf} accent="emerald" />
        <StatCard label="Активные тревоги" value={String(activeAlerts.length)} unit={activeAlerts.length === 1 ? 'тревога' : 'тревог'} icon={AlertTriangle} accent={activeAlerts.length > 0 ? 'rose' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel className="xl:col-span-2" title="Потребление воды сегодня" subtitle="Суммарный расход в реальном времени против статистической нормы">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-white text-glow-cyan tabular-nums">{formatLiters(todayConsumption)}</span>
            <span className={trend <= 0 ? 'text-emerald-400 text-sm font-semibold' : 'text-rose-400 text-sm font-semibold'}>
              {trend <= 0 ? '↓' : '↑'} {Math.abs(trend).toFixed(1)}% от нормального уровня
            </span>
          </div>
          <FlowAreaChart data={aggregateHistory} />
        </Panel>

        <Panel title="Статус AI-инфраструктуры" subtitle="Конвейер периферийной обработки">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <HeartPulse size={20} className="text-emerald-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">В СЕТИ</div>
              <div className="text-xs text-[var(--color-text-dim)]">Все подсистемы в норме</div>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            {[
              ['Сеть датчиков', `${SCHOOL_PROFILE.ultrasonicSensorCount + SCHOOL_PROFILE.cameraSensorCount} в сети`],
              ['Движок обнаружения аномалий', 'Работает'],
              ['Модуль компьютерного зрения', 'Работает'],
              ['Периферийная обработка', 'Локально'],
              ['Передача в облако', 'Отключена'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-[var(--color-text-dim)]">{k}</span>
                <span className="text-emerald-300 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Статус зон" subtitle="Расход в реальном времени по контролируемым зонам">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {zones.filter((z) => z.id !== 'main').map((zone) => (
            <div key={zone.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs text-[var(--color-text-dim)] mb-1">{zone.name}</div>
              <div className="text-lg font-semibold text-white tabular-nums mb-2">{formatFlow(zone.currentFlow)}</div>
              <StatusBadge status={zone.status} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Droplets, PiggyBank, Info } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { StatCard } from '../components/ui/StatCard';
import { generateForecast, summarizeForecast } from '../services/forecast';
import { expectedConsumptionSoFar } from '../data/mockData';
import { formatCurrency, splitLiters } from '../utils/format';
import clsx from 'clsx';

type Scenario = 'withAI' | 'withoutAI';

export function AIForecast() {
  const zones = useSimulationStore((s) => s.zones);
  const [scenario, setScenario] = useState<Scenario>('withAI');
  const [horizon, setHorizon] = useState<7 | 30>(30);

  const baselineDailyLiters = useMemo(
    () => zones.filter((z) => z.id !== 'main').reduce((s, z) => s + expectedConsumptionSoFar(z.baseline, 1440, z.category), 0),
    [zones],
  );

  const forecast = useMemo(() => generateForecast(baselineDailyLiters, horizon), [baselineDailyLiters, horizon]);
  const summary = useMemo(() => summarizeForecast(forecast), [forecast]);

  const expectedConsumption = scenario === 'withAI' ? summary.totalWithAI : summary.totalWithoutAI;
  const expectedWaste = scenario === 'withAI' ? summary.wasteWithAI : summary.wasteWithoutAI;
  const [consumptionValue, consumptionUnit] = splitLiters(expectedConsumption);
  const [wasteValue, wasteUnit] = splitLiters(expectedWaste);
  const savingCurrency = formatCurrency(summary.potentialSavingLiters * 1.1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-cyan-300" /> Прогноз ИИ
          </h1>
          <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Прогнозируемое потребление воды на основе текущей модели нормы</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
            {[7, 30].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h as 7 | 30)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors',
                  horizon === h ? 'bg-cyan-500/15 text-cyan-300' : 'text-[var(--color-text-dim)] hover:text-white',
                )}
              >
                {h} дней
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setScenario('withoutAI')}
              className={clsx(
                'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors',
                scenario === 'withoutAI' ? 'bg-slate-500/25 text-white' : 'text-[var(--color-text-dim)] hover:text-white',
              )}
            >
              Без ИИ
            </button>
            <button
              onClick={() => setScenario('withAI')}
              className={clsx(
                'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors',
                scenario === 'withAI' ? 'bg-cyan-500/15 text-cyan-300' : 'text-[var(--color-text-dim)] hover:text-white',
              )}
            >
              С ИИ
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-200">
        <Info size={15} className="mt-0.5 shrink-0" />
        Прогноз построен на статистической экстраполяции текущей модели нормы — не является измеренным будущим потреблением.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={`Ожидаемое потребление (${horizon} дн.)`} value={consumptionValue} unit={consumptionUnit} icon={Droplets} accent="cyan" />
        <StatCard label="Ожидаемые потери" value={wasteValue} unit={wasteUnit} icon={Droplets} accent={scenario === 'withAI' ? 'emerald' : 'amber'} />
        <StatCard label="Потенциальная экономия" value={savingCurrency} unit={`за ${horizon} дн.`} icon={PiggyBank} accent="emerald" />
      </div>

      <Panel title="Прогноз потребления" subtitle="Без ИИ (накопление незамеченных потерь) против с ИИ (раннее обнаружение)">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={forecast} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="withoutAIGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="withAIGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#8b98ab" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#8b98ab" fontSize={11} tickLine={false} axisLine={false} width={50} />
            <Tooltip
              contentStyle={{ background: '#0b0f18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: '#8b98ab' }}
              formatter={(v) => `${Number(v).toLocaleString('ru-RU')} л`}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#8b98ab' }} />
            <Area type="monotone" dataKey="withoutAI" name="Без ИИ" stroke="#f59e0b" strokeWidth={2} fill="url(#withoutAIGrad)" isAnimationActive={false} />
            <Area type="monotone" dataKey="withAI" name="С ИИ" stroke="#22d3ee" strokeWidth={2} fill="url(#withAIGrad)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

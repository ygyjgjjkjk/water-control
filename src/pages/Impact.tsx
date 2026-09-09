import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, Droplets, Wallet, CloudDrizzle, Info } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { StatCard } from '../components/ui/StatCard';
import { formatLiters, formatCurrency, splitLiters } from '../utils/format';

const MONTHLY_COMPARISON = [
  { month: 'Апр', withoutAI: 118, withAI: 96 },
  { month: 'Май', withoutAI: 124, withAI: 94 },
  { month: 'Июн', withoutAI: 131, withAI: 92 },
  { month: 'Июл', withoutAI: 96, withAI: 68 },
  { month: 'Авг', withoutAI: 102, withAI: 71 },
  { month: 'Сен', withoutAI: 128, withAI: 89 },
];

export function Impact() {
  const waterSaved = useSimulationStore((s) => s.waterSaved);

  const annualConsumption = 1_240_000;
  const potentialWaste = 184_000;
  const annualSavings = 620_000; // illustrative KZT/year
  const co2Impact = 0.62; // kg CO2 per m3 treated water, illustrative
  const co2Saved = Math.round((potentialWaste / 1000) * co2Impact);

  const [consumptionValue, consumptionUnit] = splitLiters(annualConsumption);
  const [wasteValue, wasteUnit] = splitLiters(potentialWaste);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Leaf size={20} className="text-emerald-300" /> Экономический и экологический эффект
        </h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Прогнозируемый эффект от предотвращения утечек с помощью ИИ за полный учебный год</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-200">
        <Info size={15} className="mt-0.5 shrink-0" />
        Цифры ниже — оценки на основе симуляции для демонстрации, полученные из модели потребления, а не реальные данные счётчиков.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Годовое потребление" value={consumptionValue} unit={consumptionUnit} icon={Droplets} accent="cyan" />
        <StatCard label="Потенциальные потери" value={wasteValue} unit={wasteUnit} icon={Droplets} accent="amber" />
        <StatCard label="Оценка экономии" value={formatCurrency(annualSavings)} unit="/ год" icon={Wallet} accent="emerald" />
        <StatCard label="Снижение CO₂" value={`${co2Saved}`} unit="кг CO₂e / год" icon={CloudDrizzle} accent="emerald" />
      </div>

      <Panel title="Потребление: без ИИ и с ИИ" subtitle="Смоделированное месячное потребление, тыс. литров">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={MONTHLY_COMPARISON} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="month" stroke="#8b98ab" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8b98ab" fontSize={12} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: '#0b0f18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: '#8b98ab' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#8b98ab' }} />
            <Bar dataKey="withoutAI" name="Без ИИ" fill="#475569" radius={[4, 4, 0, 0]} />
            <Bar dataKey="withAI" name="С ИИ" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Счётчик экономии в реальном времени" subtitle="Накоплено за текущую сессию симуляции">
        <div className="text-3xl font-bold text-emerald-300 tabular-nums">{formatLiters(waterSaved)}</div>
        <div className="text-xs text-[var(--color-text-dim)] mt-1">Потери воды, предотвращённые благодаря раннему обнаружению ИИ и устранению неисправностей</div>
      </Panel>
    </div>
  );
}

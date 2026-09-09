import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Calculator, Wallet, TrendingUp, Timer, PiggyBank } from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { StatCard } from '../components/ui/StatCard';
import { formatCurrency } from '../utils/format';
import { SCHOOL_PROFILE } from '../data/schoolProfile';

function Field({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  step?: number;
  min?: number;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--color-text-dim)] mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 py-2 outline-none focus:border-cyan-500/50 tabular-nums"
        />
        <span className="text-xs text-[var(--color-text-dim)] whitespace-nowrap w-16 shrink-0">{suffix}</span>
      </div>
    </div>
  );
}

export function ROICalculator() {
  const [students, setStudents] = useState<number>(SCHOOL_PROFILE.studentCount);
  const [literPerStudent, setLiterPerStudent] = useState(45); // boarding school: classrooms + dorm showers, not just day-school taps
  const [pricePerLiter, setPricePerLiter] = useState(1.1);
  const [ultrasonicCount, setUltrasonicCount] = useState<number>(SCHOOL_PROFILE.ultrasonicSensorCount);
  const [pricePerUltrasonic, setPricePerUltrasonic] = useState(18_000);
  const [cameraCount, setCameraCount] = useState<number>(SCHOOL_PROFILE.cameraSensorCount);
  const [pricePerCamera, setPricePerCamera] = useState(25_000);
  const [installCost, setInstallCost] = useState(500_000);
  const [reductionPct, setReductionPct] = useState(65);
  const [maintenancePct, setMaintenancePct] = useState(5);

  const result = useMemo(() => {
    const avgDailyConsumption = students * literPerStudent;
    const annualConsumption = avgDailyConsumption * 365;
    const baselineWastePct = 0.15; // illustrative: typical undetected waste share in unmonitored institutional buildings
    const annualWasteLiters = annualConsumption * baselineWastePct;
    const preventedWasteLiters = annualWasteLiters * (reductionPct / 100);
    const annualWaterSavings = preventedWasteLiters * pricePerLiter;
    const hardwareInvestment = ultrasonicCount * pricePerUltrasonic + cameraCount * pricePerCamera + installCost;
    const annualMaintenance = hardwareInvestment * (maintenancePct / 100);
    const netAnnualBenefit = annualWaterSavings - annualMaintenance;
    const roiPct = hardwareInvestment > 0 ? (netAnnualBenefit / hardwareInvestment) * 100 : 0;
    const paybackMonths = netAnnualBenefit > 0 ? (hardwareInvestment / netAnnualBenefit) * 12 : Infinity;

    const timeline = Array.from({ length: 25 }, (_, m) => ({
      month: m,
      invested: hardwareInvestment,
      returned: (netAnnualBenefit / 12) * m,
    }));

    return { annualConsumption, annualWasteLiters, preventedWasteLiters, annualWaterSavings, hardwareInvestment, annualMaintenance, netAnnualBenefit, roiPct, paybackMonths, timeline };
  }, [students, literPerStudent, pricePerLiter, ultrasonicCount, pricePerUltrasonic, cameraCount, pricePerCamera, installCost, reductionPct, maintenancePct]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Calculator size={20} className="text-cyan-300" /> Калькулятор ROI
        </h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Оцените окупаемость внедрения Smart Water AI для вашей школы</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title="Параметры школы и системы" className="xl:col-span-1">
          <div className="space-y-4">
            <Field label="Количество учеников" value={students} onChange={setStudents} suffix="чел." step={10} />
            <Field label="Расход на ученика" value={literPerStudent} onChange={setLiterPerStudent} suffix="л/день" />
            <Field label="Стоимость воды" value={pricePerLiter} onChange={setPricePerLiter} suffix="₸/л" step={0.1} />
            <div className="border-t border-white/5 pt-4">
              <Field label="Ультразвуковых датчиков" value={ultrasonicCount} onChange={setUltrasonicCount} suffix="шт." />
            </div>
            <Field label="Стоимость УЗ-датчика" value={pricePerUltrasonic} onChange={setPricePerUltrasonic} suffix="₸" step={1000} />
            <div className="border-t border-white/5 pt-4">
              <Field label="Количество камер" value={cameraCount} onChange={setCameraCount} suffix="шт." />
            </div>
            <Field label="Стоимость камеры" value={pricePerCamera} onChange={setPricePerCamera} suffix="₸" step={1000} />
            <Field label="Стоимость установки" value={installCost} onChange={setInstallCost} suffix="₸" step={10_000} />
            <div className="border-t border-white/5 pt-4">
              <Field label="Снижение потерь благодаря ИИ" value={reductionPct} onChange={(v) => setReductionPct(Math.min(95, Math.max(0, v)))} suffix="%" />
            </div>
            <Field label="Годовое обслуживание" value={maintenancePct} onChange={(v) => setMaintenancePct(Math.min(50, Math.max(0, v)))} suffix="% от CAPEX" />
          </div>
        </Panel>

        <div className="xl:col-span-2 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Инвестиции в оборудование" value={formatCurrency(result.hardwareInvestment)} icon={Wallet} accent="cyan" />
            <StatCard label="Экономия воды в год" value={formatCurrency(result.annualWaterSavings)} icon={PiggyBank} accent="emerald" />
            <StatCard label="Обслуживание в год" value={formatCurrency(result.annualMaintenance)} icon={Wallet} accent="amber" />
            <StatCard
              label="ROI за год"
              value={`${result.roiPct.toFixed(0)}%`}
              icon={TrendingUp}
              accent={result.roiPct >= 0 ? 'emerald' : 'rose'}
            />
          </div>

          <Panel title="Срок окупаемости" subtitle="Накопленная экономия против первоначальных инвестиций">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                <Timer size={20} className="text-cyan-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white tabular-nums">
                  {Number.isFinite(result.paybackMonths) ? `${result.paybackMonths.toFixed(1)} мес.` : '—'}
                </div>
                <div className="text-xs text-[var(--color-text-dim)]">Срок окупаемости оборудования</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={result.timeline} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="#8b98ab" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'месяцы', position: 'insideBottomRight', offset: -2, fill: '#8b98ab', fontSize: 11 }} />
                <YAxis stroke="#8b98ab" fontSize={11} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: '#0b0f18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#8b98ab' }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <ReferenceLine y={result.hardwareInvestment} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'Инвестиции', fill: '#8b98ab', fontSize: 11, position: 'insideTopLeft' }} />
                <Line type="monotone" dataKey="returned" name="Накопленная экономия" stroke="#34d399" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <div className="text-[11px] text-[var(--color-text-dim)] px-1">
            Расчёт основан на модельном допущении: без мониторинга ~15% потребления теряется на незамеченных утечках — иллюстративная оценка для демонстрации, не аудит реального объекта.
          </div>
        </div>
      </div>
    </div>
  );
}

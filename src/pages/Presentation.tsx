import { useNavigate } from 'react-router-dom';
import { Droplets, X, BrainCircuit, Building2, Camera } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { FlowAreaChart } from '../components/charts/FlowAreaChart';
import { VisionScene } from '../components/vision/VisionScene';
import { EdgePipeline } from '../components/vision/EdgePipeline';
import { formatLiters } from '../utils/format';
import { SCHOOL_PROFILE } from '../data/schoolProfile';

export function Presentation() {
  const navigate = useNavigate();
  const todayConsumption = useSimulationStore((s) => s.todayConsumption);
  const waterSaved = useSimulationStore((s) => s.waterSaved);
  const aggregateHistory = useSimulationStore((s) => s.aggregateHistory);
  const vision = useSimulationStore((s) => s.vision);
  const anomalies = useSimulationStore((s) => s.anomalies);

  const avgConfidence = anomalies.length
    ? Math.round(anomalies.reduce((s, a) => s + a.confidence, 0) / anomalies.length)
    : 94;
  const activeSensors = SCHOOL_PROFILE.ultrasonicSensorCount + SCHOOL_PROFILE.cameraSensorCount;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white grid-fade relative overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 right-6 z-20 w-10 h-10 rounded-full glass flex items-center justify-center hover:text-cyan-300 transition-colors"
      >
        <X size={18} />
      </button>

      <div className="relative max-w-6xl mx-auto px-8 py-20 space-y-16">
        <div className="text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
              <Droplets size={26} className="text-slate-950" strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-bold tracking-tight">SMART WATER AI</span>
          </div>
          <p className="text-lg text-[var(--color-text-dim)]">ИИ-мониторинг водной инфраструктуры для современных школ</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <BigStat value={formatLiters(todayConsumption)} label="Потребление сегодня" />
          <BigStat value={`${avgConfidence}%`} label="Уверенность детекции ИИ" />
          <BigStat value={formatLiters(waterSaved)} label="Предотвращённые потери" />
          <BigStat value={String(activeSensors)} label="Активных датчиков" />
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="text-sm font-semibold text-white mb-4 tracking-wide">ПОТРЕБЛЕНИЕ В РЕАЛЬНОМ ВРЕМЕНИ</div>
          <FlowAreaChart data={aggregateHistory} height={260} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard icon={Building2} title="Цифровой двойник" desc="Живая 3-этажная модель школы в реальном времени указывает, какое именно помещение затронуто." />
          <FeatureCard icon={BrainCircuit} title="ИИ-детекция аномалий" desc="Статистическая модель нормы автоматически классифицирует скрытые утечки, порывы труб и нетипичное потребление." />
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="text-sm font-semibold text-white mb-4 tracking-wide flex items-center gap-2">
            <Camera size={16} className="text-cyan-300" /> УМНОЕ ЗРЕНИЕ
          </div>
          <VisionScene vision={vision} />
        </div>

        <EdgePipeline />

        <div className="text-center text-xs text-[var(--color-text-dim)] pt-6">
          Цифровой прототип · Локальная симуляция · Не требует физического оборудования
        </div>
      </div>
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-glow-cyan tabular-nums">{value}</div>
      <div className="text-xs text-[var(--color-text-dim)] mt-2 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Building2; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-7">
      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mb-4">
        <Icon size={20} className="text-cyan-300" />
      </div>
      <div className="text-base font-semibold text-white mb-2">{title}</div>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{desc}</p>
    </div>
  );
}

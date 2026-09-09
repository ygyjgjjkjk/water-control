import { Camera, Cpu, BrainCircuit, Bell, ChevronRight, ShieldCheck, CloudOff, ServerCog } from 'lucide-react';
import { Panel } from '../ui/Panel';

const STAGES = [
  { label: 'ESP32-CAM', icon: Camera },
  { label: 'Raspberry Pi (Edge)', icon: ServerCog },
  { label: 'Компьютерное зрение', icon: Cpu },
  { label: 'Детекция аномалий', icon: BrainCircuit },
  { label: 'Тревога в дашборде', icon: Bell },
];

export function EdgePipeline() {
  return (
    <Panel title="Периферийная обработка ИИ" subtitle="Камера → периферийное устройство → модель ИИ → событие, полностью локально">
      <div className="flex items-center flex-wrap gap-2 mb-5">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 min-w-[108px]">
              <stage.icon size={18} className="text-cyan-300" />
              <span className="text-[10px] text-center text-[var(--color-text-dim)] leading-tight">{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && <ChevronRight size={16} className="text-[var(--color-text-dim)]" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-center gap-2.5">
          <ServerCog size={15} className="text-emerald-300" />
          <div>
            <div className="text-[10px] text-[var(--color-text-dim)] uppercase">Обработка</div>
            <div className="text-xs font-semibold text-emerald-300">ЛОКАЛЬНО</div>
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-center gap-2.5">
          <CloudOff size={15} className="text-rose-300" />
          <div>
            <div className="text-[10px] text-[var(--color-text-dim)] uppercase">Передача в облако</div>
            <div className="text-xs font-semibold text-rose-300">ОТКЛЮЧЕНА</div>
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-center gap-2.5">
          <ShieldCheck size={15} className="text-cyan-300" />
          <div>
            <div className="text-[10px] text-[var(--color-text-dim)] uppercase">Приватность</div>
            <div className="text-xs font-semibold text-cyan-300">ЗАЩИЩЕНА</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

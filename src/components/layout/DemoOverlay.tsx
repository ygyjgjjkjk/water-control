import { PlayCircle, X } from 'lucide-react';
import { useSimulationStore } from '../../simulation/store';
import { DEMO_STEPS } from '../../simulation/demoScript';

export function DemoOverlay() {
  const demoMode = useSimulationStore((s) => s.demoMode);
  const demoStepIndex = useSimulationStore((s) => s.demoStepIndex);
  const toggleDemoMode = useSimulationStore((s) => s.toggleDemoMode);

  if (!demoMode) return null;
  const step = DEMO_STEPS[demoStepIndex];
  const progress = ((demoStepIndex + 1) / DEMO_STEPS.length) * 100;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[min(560px,92vw)] animate-fade-in">
      <div className="glass-strong rounded-2xl px-5 py-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wide">
            <PlayCircle size={14} className="animate-pulse" /> Демо-режим · Шаг {demoStepIndex + 1}/{DEMO_STEPS.length}
          </div>
          <button onClick={toggleDemoMode} className="text-[var(--color-text-dim)] hover:text-white">
            <X size={15} />
          </button>
        </div>
        <div className="text-sm text-white font-medium mb-3">{step?.label}</div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

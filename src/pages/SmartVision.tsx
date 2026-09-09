import clsx from 'clsx';
import { Camera, User, Hand, Droplets, TimerReset, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { VisionScene } from '../components/vision/VisionScene';
import { EdgePipeline } from '../components/vision/EdgePipeline';
import { formatDuration } from '../utils/format';
import type { VisionScenario } from '../types';

const SCENARIOS: { id: VisionScenario; label: string; desc: string }[] = [
  { id: 'washing', label: 'Человек моет руки', desc: 'Обнаружены человек и руки, вода течёт — ожидаемое поведение.' },
  { id: 'leaving', label: 'Человек уходит', desc: 'Человек покидает кадр, кран за ним закрыт.' },
  { id: 'waste', label: 'Вода продолжает течь', desc: 'Человек не обнаружен, но кран всё ещё открыт.' },
  { id: 'closed', label: 'Кран закрыт', desc: 'Состояние покоя — раковина пуста, воды нет.' },
];

function ReadoutRow({ icon: Icon, label, value, positive }: { icon: typeof User; label: string; value: string; positive: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
        <Icon size={14} />
        {label}
      </div>
      <span className={clsx('text-sm font-bold tabular-nums', positive ? 'text-emerald-300' : 'text-rose-300')}>{value}</span>
    </div>
  );
}

export function SmartVision() {
  const vision = useSimulationStore((s) => s.vision);
  const setVisionScenario = useSimulationStore((s) => s.setVisionScenario);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Camera size={20} className="text-cyan-300" /> Умное зрение
        </h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Компьютерное зрение для мониторинга раковины — симулированный поток</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Panel title="Камера раковины — Столовая" subtitle="Виртуальный поток · режим симуляции">
            <VisionScene vision={vision} />
          </Panel>

          <Panel title="Симуляция" subtitle="Переключение виртуальной камеры между сценариями">
            <div className="grid grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setVisionScenario(s.id)}
                  className={clsx(
                    'text-left rounded-xl p-3.5 border transition-colors',
                    vision.scenario === s.id
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15',
                  )}
                >
                  <div className={clsx('text-sm font-semibold mb-1', vision.scenario === s.id ? 'text-cyan-300' : 'text-white')}>{s.label}</div>
                  <div className="text-[11px] text-[var(--color-text-dim)] leading-snug">{s.desc}</div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Данные ИИ" subtitle="Вывод инференса в реальном времени">
            <ReadoutRow icon={User} label="Человек обнаружен" value={vision.personDetected ? 'ДА' : 'НЕТ'} positive={vision.personDetected} />
            <ReadoutRow icon={Hand} label="Руки обнаружены" value={vision.handsDetected ? 'ДА' : 'НЕТ'} positive={vision.handsDetected} />
            <ReadoutRow icon={Droplets} label="Поток воды" value={vision.waterFlow ? 'ВКЛ' : 'ВЫКЛ'} positive={!vision.waterFlow} />

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)] mb-2">
                <TimerReset size={14} /> Таймер перерасхода воды
              </div>
              <div className={clsx('text-3xl font-bold tabular-nums', vision.wasteTimerSec >= 15 ? 'text-rose-400' : 'text-white')}>
                {vision.scenario === 'waste' ? formatDuration(vision.wasteTimerSec) : '00:00'}
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                <div
                  className={clsx('h-full transition-all', vision.wasteTimerSec >= 15 ? 'bg-rose-400' : 'bg-cyan-400')}
                  style={{ width: `${Math.min(100, (vision.wasteTimerSec / 15) * 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-xs text-[var(--color-text-dim)] mb-2">Статус ИИ</div>
              {vision.wasteDetected ? (
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/25 px-3 py-2.5">
                  <AlertOctagon size={16} className="text-rose-300" />
                  <div>
                    <div className="text-xs font-bold text-rose-300">ОБНАРУЖЕН ПЕРЕРАСХОД ВОДЫ</div>
                    <div className="text-[11px] text-rose-300/80">Потери: {vision.estimatedWasteL.toFixed(1)} л</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5">
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  <div className="text-xs font-bold text-emerald-300">НОРМА</div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <EdgePipeline />
    </div>
  );
}

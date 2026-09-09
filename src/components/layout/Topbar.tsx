import { useNavigate } from 'react-router-dom';
import { PlayCircle, Presentation, Menu } from 'lucide-react';
import clsx from 'clsx';
import { useSimulationStore } from '../../simulation/store';
import { NotificationBell } from './NotificationBell';
import { formatSimTime } from '../../utils/format';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const demoMode = useSimulationStore((s) => s.demoMode);
  const toggleDemoMode = useSimulationStore((s) => s.toggleDemoMode);
  const simMinutes = useSimulationStore((s) => s.simMinutes);
  const systemOnline = useSimulationStore((s) => s.systemOnline);
  const aiActive = useSimulationStore((s) => s.aiActive);

  return (
    <header className="h-16 fixed top-0 left-0 md:left-60 right-0 z-30 flex items-center justify-between px-3 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-[var(--color-text-dim)] hover:text-white shrink-0">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest">Школа</div>
          <div className="text-sm font-semibold text-white truncate">Smart School Demo</div>
        </div>
        <div className="hidden lg:block w-px h-8 bg-[var(--color-border)]" />
        <div className="hidden lg:flex items-center gap-1.5">
          <span className={clsx('w-2 h-2 rounded-full', systemOnline ? 'bg-emerald-400 pulse-dot' : 'bg-slate-500')} />
          <span className="text-xs text-[var(--color-text-dim)]">Система</span>
          <span className="text-xs font-semibold text-emerald-300">В СЕТИ</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          <span className={clsx('w-2 h-2 rounded-full', aiActive ? 'bg-cyan-400 pulse-dot' : 'bg-slate-500')} />
          <span className="text-xs text-[var(--color-text-dim)]">ИИ</span>
          <span className="text-xs font-semibold text-cyan-300">АКТИВЕН</span>
        </div>
        <div className="hidden xl:block text-xs text-[var(--color-text-dim)] tabular-nums">Симв. время {formatSimTime(simMinutes)}</div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={toggleDemoMode}
          className={clsx(
            'flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors',
            demoMode
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
              : 'bg-white/5 text-[var(--color-text-dim)] border-white/10 hover:text-white',
          )}
        >
          <PlayCircle size={15} />
          <span className="hidden sm:inline">{demoMode ? 'Демо идёт…' : 'Демо-режим'}</span>
        </button>
        <button
          onClick={() => navigate('/presentation')}
          className="flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-[var(--color-text-dim)] hover:text-white transition-colors"
        >
          <Presentation size={15} />
          <span className="hidden sm:inline">Презентация</span>
        </button>
        <NotificationBell />
      </div>
    </header>
  );
}

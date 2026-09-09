import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Building2,
  BrainCircuit,
  Camera,
  Radio,
  Bell,
  Leaf,
  Settings,
  Droplets,
  X,
  Waypoints,
  TrendingUp,
  Calculator,
} from 'lucide-react';
import clsx from 'clsx';
import { useSimulationStore } from '../../simulation/store';

const NAV = [
  { to: '/', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/live', label: 'Мониторинг', icon: Activity },
  { to: '/twin', label: 'Цифровой двойник', icon: Building2 },
  { to: '/pipeline', label: 'Схема труб', icon: Waypoints },
  { to: '/ai-detection', label: 'ИИ-детекция', icon: BrainCircuit },
  { to: '/forecast', label: 'Прогноз ИИ', icon: TrendingUp },
  { to: '/vision', label: 'Умное зрение', icon: Camera },
  { to: '/network', label: 'Сеть IoT', icon: Radio },
  { to: '/alerts', label: 'Тревоги', icon: Bell },
  { to: '/impact', label: 'Эффект', icon: Leaf },
  { to: '/roi', label: 'Калькулятор ROI', icon: Calculator },
  { to: '/settings', label: 'Настройки', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const openAlerts = useSimulationStore((s) => s.alerts.filter((a) => a.status !== 'RESOLVED').length);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          'w-60 shrink-0 h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        )}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <Droplets size={17} className="text-slate-950" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white tracking-tight">Smart Water AI</div>
            <div className="text-[10px] text-[var(--color-text-dim)] tracking-widest uppercase">Инфраструктура</div>
          </div>
          <button onClick={onClose} className="ml-auto text-[var(--color-text-dim)] hover:text-white md:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'text-[var(--color-text-dim)] hover:text-white hover:bg-white/5 border border-transparent',
                )
              }
            >
              <item.icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
              {item.to === '/alerts' && openAlerts > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {openAlerts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="glass rounded-xl p-3 text-[11px] text-[var(--color-text-dim)] leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              Периферийный ИИ
            </div>
            Только локальная обработка. Без передачи в облако.
          </div>
        </div>
      </aside>
    </>
  );
}

import { useState } from 'react';
import { Settings as SettingsIcon, School, ShieldCheck, Users, Radio, Camera } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { Toggle } from '../components/ui/Toggle';
import { SCHOOL_PROFILE } from '../data/schoolProfile';

export function Settings() {
  const zones = useSimulationStore((s) => s.zones);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsHighSeverity, setSmsHighSeverity] = useState(true);
  const [autoResolveLow, setAutoResolveLow] = useState(true);
  const [nightMode, setNightMode] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <SettingsIcon size={20} className="text-cyan-300" /> Настройки
        </h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Конфигурация системы и настройки уведомлений</p>
      </div>

      <Panel title="Профиль школы">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <School size={20} className="text-cyan-300" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{SCHOOL_PROFILE.name}</div>
            <div className="text-xs text-[var(--color-text-dim)]">{zones.length - 1} контролируемых помещений · {SCHOOL_PROFILE.floors} этажа</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 flex items-center gap-2.5">
            <Users size={15} className="text-cyan-300" />
            <div>
              <div className="text-[10px] text-[var(--color-text-dim)] uppercase">Учеников</div>
              <div className="text-sm font-bold text-white tabular-nums">{SCHOOL_PROFILE.studentCount.toLocaleString('ru-RU')}</div>
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 flex items-center gap-2.5">
            <Radio size={15} className="text-cyan-300" />
            <div>
              <div className="text-[10px] text-[var(--color-text-dim)] uppercase">УЗ-датчиков</div>
              <div className="text-sm font-bold text-white tabular-nums">{SCHOOL_PROFILE.ultrasonicSensorCount}</div>
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 flex items-center gap-2.5">
            <Camera size={15} className="text-cyan-300" />
            <div>
              <div className="text-[10px] text-[var(--color-text-dim)] uppercase">Камер</div>
              <div className="text-sm font-bold text-white tabular-nums">{SCHOOL_PROFILE.cameraSensorCount}</div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Настройки уведомлений">
        <div className="space-y-4">
          <Row label="Email-уведомления о новых детекциях ИИ" desc="Отправлять письмо при классификации новой аномалии." checked={emailAlerts} onChange={setEmailAlerts} />
          <Row label="SMS для ВЫСОКОЙ критичности" desc="Мгновенное SMS-уведомление при порывах труб и критичных утечках." checked={smsHighSeverity} onChange={setSmsHighSeverity} />
          <Row label="Автоматическое закрытие НИЗКОЙ критичности" desc="Автоматически закрывать мелкие аномалии после возврата расхода к норме." checked={autoResolveLow} onChange={setAutoResolveLow} />
          <Row label="Повышенная ночная чувствительность" desc="Снижать порог обнаружения аномалий с 21:00 до 06:00 для выявления скрытых утечек." checked={nightMode} onChange={setNightMode} />
        </div>
      </Panel>

      <Panel title="Конфиденциальность и данные">
        <div className="flex items-start gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
          <ShieldCheck size={18} className="text-emerald-300 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 leading-relaxed">
            Весь инференс компьютерного зрения выполняется на локальном периферийном устройстве. Видео, изображения и персональные данные никогда не покидают сеть школы.
          </div>
        </div>
      </Panel>

      <div className="text-[11px] text-[var(--color-text-dim)] text-center pt-2">Smart Water AI · Цифровой прототип v0.1.0 · Локальная симуляция, без внешних сервисов</div>
    </div>
  );
}

function Row({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-[var(--color-text-dim)] mt-0.5">{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

import { Radio, Camera, ServerCog, BatteryMedium, Wifi, Thermometer, Droplet, Clock, Info } from 'lucide-react';
import { useSimulationStore } from '../simulation/store';
import { Panel } from '../components/ui/Panel';
import { StatCard } from '../components/ui/StatCard';
import { DeviceStatusBadge } from '../components/ui/Badge';
import { formatTimeAgo } from '../utils/format';
import { SCHOOL_PROFILE } from '../data/schoolProfile';
import type { DeviceType } from '../types';

const TYPE_ICON: Record<DeviceType, typeof Radio> = {
  'flow-sensor': Radio,
  camera: Camera,
  'edge-server': ServerCog,
};

const TYPE_LABEL: Record<DeviceType, string> = {
  'flow-sensor': 'Ультразвуковой датчик расхода',
  camera: 'Модуль ESP32-CAM',
  'edge-server': 'Периферийный ИИ-сервер',
};

export function IoTNetwork() {
  const devices = useSimulationStore((s) => s.devices);
  const online = devices.filter((d) => d.status === 'ONLINE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Wifi size={20} className="text-cyan-300" /> Сеть IoT
          </h1>
          <p className="text-sm text-[var(--color-text-dim)] mt-0.5">Зарегистрированные периферийные устройства и их телеметрия</p>
        </div>
        <div className="text-sm text-[var(--color-text-dim)]">
          <span className="text-emerald-300 font-semibold">{online}</span> / {devices.length} устройств в сети
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="УЗ-датчики расхода" value={String(SCHOOL_PROFILE.ultrasonicSensorCount)} unit="шт. по школе" icon={Radio} accent="cyan" />
        <StatCard label="Камеры" value={String(SCHOOL_PROFILE.cameraSensorCount)} unit="шт. по школе" icon={Camera} accent="cyan" />
        <StatCard label="Периферийные серверы" value="1" unit="Raspberry Pi" icon={ServerCog} accent="emerald" />
        <StatCard label="Всего устройств" value={String(SCHOOL_PROFILE.ultrasonicSensorCount + SCHOOL_PROFILE.cameraSensorCount + 1)} unit="в реестре школы" icon={Wifi} accent="emerald" />
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 text-xs text-cyan-200">
        <Info size={15} className="mt-0.5 shrink-0" />
        Ниже показаны репрезентативные датчики по {devices.filter((d) => d.type === 'flow-sensor').length} симулируемым зонам — полный парк школы насчитывает {SCHOOL_PROFILE.ultrasonicSensorCount} УЗ-датчиков и {SCHOOL_PROFILE.cameraSensorCount} камер на отдельных точках водозабора.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {devices.map((d) => {
          const Icon = TYPE_ICON[d.type];
          return (
            <Panel key={d.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Icon size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{d.name}</div>
                    <div className="text-[11px] text-[var(--color-text-dim)]">{TYPE_LABEL[d.type]}</div>
                  </div>
                </div>
                <DeviceStatusBadge status={d.status} />
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 text-xs pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><BatteryMedium size={13} /> Батарея</div>
                <div className="text-right text-white font-medium tabular-nums">{d.battery}%</div>

                <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><Wifi size={13} /> Сигнал</div>
                <div className="text-right text-white font-medium tabular-nums">{d.signal}%</div>

                {d.flow !== undefined && (
                  <>
                    <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><Droplet size={13} /> Расход</div>
                    <div className="text-right text-white font-medium tabular-nums">{d.flow.toFixed(1)} л/мин</div>
                  </>
                )}

                {d.temperature !== undefined && (
                  <>
                    <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><Thermometer size={13} /> Температура</div>
                    <div className="text-right text-white font-medium tabular-nums">{d.temperature}°C</div>
                  </>
                )}

                <div className="flex items-center gap-1.5 text-[var(--color-text-dim)]"><Clock size={13} /> Обновлено</div>
                <div className="text-right text-white font-medium">{formatTimeAgo(d.lastUpdate)}</div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Lock, PhoneCall, Building2, X } from 'lucide-react';
import { useSimulationStore } from '../../simulation/store';

export function EmergencyOverlay() {
  const navigate = useNavigate();
  const anomalies = useSimulationStore((s) => s.anomalies);
  const alerts = useSimulationStore((s) => s.alerts);
  const zones = useSimulationStore((s) => s.zones);
  const isolatedZoneIds = useSimulationStore((s) => s.isolatedZoneIds);
  const isolateZone = useSimulationStore((s) => s.isolateZone);
  const investigateAlert = useSimulationStore((s) => s.investigateAlert);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const critical = anomalies.find(
    (a) => a.active && a.type === 'Pipe Burst' && a.severity === 'HIGH' && !isolatedZoneIds.includes(a.zoneId) && !dismissedIds.includes(a.id),
  );

  if (!critical) return null;

  const zone = zones.find((z) => z.id === critical.zoneId);
  const linkedAlert = alerts.find((a) => a.location === critical.zoneName && a.type === critical.type && a.status !== 'RESOLVED');
  const flowLoss = Math.max(0, critical.actualFlow - critical.baselineFlow);

  const dismiss = () => setDismissedIds((ids) => [...ids, critical.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-rose-500/50 bg-[#160a0c] shadow-[0_0_60px_rgba(244,63,94,0.35)] overflow-hidden">
        <div className="absolute inset-0 shimmer pointer-events-none" />
        <button onClick={dismiss} className="absolute top-4 right-4 text-rose-300/70 hover:text-white z-10">
          <X size={18} />
        </button>

        <div className="relative px-6 pt-7 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <AlertOctagon size={22} className="text-rose-300 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-rose-300 tracking-widest uppercase">Критическое событие</div>
              <div className="text-lg font-bold text-white">ОБНАРУЖЕН ПОРЫВ ТРУБЫ</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3 col-span-2">
              <div className="text-[10px] text-rose-200/70 uppercase mb-1">Локация</div>
              <div className="text-sm font-semibold text-white">{zone?.building} → {critical.zoneName}</div>
            </div>
            <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3">
              <div className="text-[10px] text-rose-200/70 uppercase mb-1">Расход</div>
              <div className="text-lg font-bold text-white tabular-nums">{critical.actualFlow.toFixed(1)} л/мин</div>
            </div>
            <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3">
              <div className="text-[10px] text-rose-200/70 uppercase mb-1">Оценка потерь</div>
              <div className="text-lg font-bold text-rose-300 tabular-nums">{flowLoss.toFixed(1)} л/мин</div>
            </div>
            <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3 col-span-2">
              <div className="text-[10px] text-rose-200/70 uppercase mb-1">Уверенность ИИ</div>
              <div className="text-lg font-bold text-white tabular-nums">{critical.confidence}%</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <button
              onClick={() => isolateZone(critical.zoneId)}
              className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/25 transition-colors"
            >
              <Lock size={16} />
              <span className="text-[11px] font-bold text-center leading-tight">ИЗОЛИРОВАТЬ УЧАСТОК</span>
            </button>
            <button
              onClick={() => {
                if (linkedAlert) investigateAlert(linkedAlert.id);
                dismiss();
              }}
              className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 hover:bg-amber-500/25 transition-colors"
            >
              <PhoneCall size={16} />
              <span className="text-[11px] font-bold text-center leading-tight">ВЫЗВАТЬ ТЕХСЛУЖБУ</span>
            </button>
            <button
              onClick={() => {
                dismiss();
                navigate('/twin', { state: { zoneId: critical.zoneId } });
              }}
              className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
            >
              <Building2 size={16} />
              <span className="text-[11px] font-bold text-center leading-tight">ЦИФРОВОЙ ДВОЙНИК</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

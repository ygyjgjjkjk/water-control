import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import type { FlowHistoryPoint } from '../../types';

function AnomalyDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload.anomaly) return null;
  return <Dot cx={cx} cy={cy} r={4} fill="#f43f5e" stroke="#0b0f18" strokeWidth={1.5} />;
}

function TooltipContent({ active, payload, label, dateMode }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  const isAnomaly = payload[0]?.payload?.anomaly;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <div className="text-[var(--color-text-dim)] mb-1">
        {dateMode ? d.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value?.toFixed(1)} L/min
        </div>
      ))}
      {isAnomaly && <div className="text-rose-400 font-semibold mt-1">⚠ Anomaly detected</div>}
    </div>
  );
}

export function AnomalyChart({ data, height = 280, dateMode = false }: { data: FlowHistoryPoint[]; height?: number; dateMode?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={(t) => (dateMode ? new Date(t).toLocaleDateString([], { weekday: 'short' }) : new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
          stroke="#8b98ab"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis stroke="#8b98ab" fontSize={11} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<TooltipContent dateMode={dateMode} />} />
        <Area type="monotone" dataKey="flow" name="Actual" stroke="#22d3ee" strokeWidth={2} fill="url(#anomalyGradient)" dot={<AnomalyDot />} isAnimationActive={false} />
        <Line type="monotone" dataKey="baseline" name="Normal Baseline" stroke="#8b98ab" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import type { FlowHistoryPoint } from '../../types';

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <div className="text-[var(--color-text-dim)] mb-1">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value?.toFixed(1)} L/min
        </div>
      ))}
    </div>
  );
}

export function FlowAreaChart({ data, height = 220 }: { data: FlowHistoryPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          stroke="#8b98ab"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis stroke="#8b98ab" fontSize={11} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<TooltipContent />} />
        <Area type="monotone" dataKey="flow" name="Flow" stroke="#22d3ee" strokeWidth={2} fill="url(#flowGradient)" isAnimationActive={false} />
        <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#8b98ab" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

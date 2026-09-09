import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { FlowHistoryPoint } from '../../types';

export function Sparkline({ data, color = '#22d3ee', height = 48, id }: { data: FlowHistoryPoint[]; color?: string; height?: number; id: string }) {
  const gradientId = `spark-${id}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="flow" stroke={color} strokeWidth={1.75} fill={`url(#${gradientId})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

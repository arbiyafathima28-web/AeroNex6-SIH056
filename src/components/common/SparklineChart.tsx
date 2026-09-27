import React, { useId } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

export interface SparklinePoint {
  date: string;
  value: number;
  formattedDate?: string;
  tooltipLabel?: string;
}

interface SparklineChartProps {
  data: SparklinePoint[];
  color?: string;
  height?: number;
  label?: string;
  className?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = '#0284c7',
  height = 34,
  label = '',
  className = '',
}) => {
  const rawId = useId();
  const gradientId = `sparkline-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (!data || data.length < 2) {
    return null;
  }

  return (
    <div className={`w-full min-w-0 overflow-hidden ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 1, left: 1, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.38} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '2 2' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as SparklinePoint;
                return (
                  <div className="bg-slate-900/95 dark:bg-slate-800 text-white px-2 py-1 rounded shadow-xl text-[10px] font-mono whitespace-nowrap border border-slate-700/80 pointer-events-none z-50">
                    <span className="text-slate-400 mr-1.5">{item.formattedDate || item.date}:</span>
                    <span className="font-bold text-white tabular-nums">
                      {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                    </span>
                    {label && <span className="text-slate-300 ml-1">{label}</span>}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.8}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3.5, fill: color, stroke: '#ffffff', strokeWidth: 1.5 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

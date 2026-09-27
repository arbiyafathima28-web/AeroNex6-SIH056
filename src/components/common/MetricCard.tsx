import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { SparklinePoint, SparklineChart } from './SparklineChart';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changePeriod?: string;
  tooltip?: string;
  subtitle?: string;
  isPositiveGood?: boolean; // default true (i.e. green if positive)
  statusIndicator?: React.ReactNode;
  sparklineData?: SparklinePoint[];
  sparklineColor?: string;
  sparklineLabel?: string;
  sparklineBadge?: string;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changePeriod,
  tooltip,
  subtitle,
  isPositiveGood = true,
  statusIndicator,
  sparklineData,
  sparklineColor,
  sparklineLabel,
  sparklineBadge,
  children,
}) => {
  const hasChange = typeof change === 'number';
  const isZero = hasChange && change === 0;
  const isPositive = hasChange && change > 0;
  
  // Decide color
  let changeColor = 'text-slate-500 dark:text-slate-400';
  if (hasChange && !isZero) {
    if (isPositive) {
      changeColor = isPositiveGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
    } else {
      changeColor = isPositiveGood ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase flex items-center gap-1.5 truncate">
          {title}
          {tooltip && <InfoTooltip content={tooltip} />}
        </span>
        {statusIndicator && <div className="shrink-0">{statusIndicator}</div>}
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 font-mono tracking-tight tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="my-1.5 min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-medium">7D Trend</span>
            {sparklineBadge && (
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {sparklineBadge}
              </span>
            )}
          </div>
          <SparklineChart
            data={sparklineData}
            color={sparklineColor || '#0284c7'}
            label={sparklineLabel}
            height={34}
          />
        </div>
      )}

      {children}

      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {hasChange ? (
          <div className={`flex items-center gap-1 font-mono font-medium tabular-nums ${changeColor}`}>
            {isZero ? (
              <Minus className="w-3.5 h-3.5" />
            ) : isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            {changePeriod && (
              <span className="text-slate-400 dark:text-slate-500 ml-1 font-sans font-normal">
                {changePeriod}
              </span>
            )}
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 dark:text-slate-400 text-xs truncate">
            {subtitle}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs">Continuous sample</span>
        )}
      </div>
    </div>
  );
};

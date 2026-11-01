import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700 neon-card-box">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-slate-700">
          <Icon className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold tabular-nums ${
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{subtext}</p>
      )}
    </div>
  );
};

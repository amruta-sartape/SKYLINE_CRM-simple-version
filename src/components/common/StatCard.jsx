import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick
}) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-300'
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300'
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-300'
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-300'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300'
    },
    teal: {
      iconBg: 'bg-teal-50 text-teal-600',
      border: 'hover:border-teal-300'
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-700',
      border: 'hover:border-slate-300'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-card transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-card-hover ' + style.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

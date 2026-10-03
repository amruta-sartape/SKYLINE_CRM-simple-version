import React from 'react';
import { InventorySummary } from '../../types/property.types';
import { Building2, CheckCircle2, Clock, CheckCheck, Coins } from 'lucide-react';

interface InventoryStatsProps {
  summary: InventorySummary | null;
  isLoading?: boolean;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ summary, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-[#242F42]" />
        ))}
      </div>
    );
  }

  const formatCurrencyCr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const cards = [
    {
      title: 'Total Units',
      value: summary?.total_units || 0,
      subtext: 'Catalog Master',
      icon: <Building2 className="w-4 h-4 text-brand-600 dark:text-amber-400" />,
      bg: 'bg-brand-50/50 dark:bg-amber-950/20',
      border: 'border-brand-200/80 dark:border-amber-900/40',
    },
    {
      title: 'Available',
      value: summary?.available_units || 0,
      subtext: formatCurrencyCr(summary?.available_valuation || 0),
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      border: 'border-emerald-200/80 dark:border-emerald-900/40',
    },
    {
      title: 'Reserved',
      value: summary?.reserved_units || 0,
      subtext: 'Client Tokens Hold',
      icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      border: 'border-amber-200/80 dark:border-amber-900/40',
    },
    {
      title: 'Sold Out',
      value: summary?.sold_units || 0,
      subtext: 'Finalized Deals',
      icon: <CheckCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      bg: 'bg-slate-50 dark:bg-[#101622]',
      border: 'border-slate-200 dark:border-[#242F42]',
    },
    {
      title: 'Total Valuation',
      value: formatCurrencyCr(summary?.total_valuation || 0),
      subtext: `Avg ₹${summary?.avg_sqft_price || 0}/sqft`,
      icon: <Coins className="w-4 h-4 text-gold-600 dark:text-amber-400" />,
      bg: 'bg-amber-50/30 dark:bg-amber-950/20',
      border: 'border-gold-300/60 dark:border-amber-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`p-3.5 rounded-xl border ${c.border} ${c.bg} shadow-subtle flex flex-col justify-between transition-all hover:shadow-card`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {c.title}
            </span>
            <div className="p-1 rounded-lg bg-white dark:bg-[#141A24] shadow-xs border border-slate-100 dark:border-[#242F42]">
              {c.icon}
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
              {c.value}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{c.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

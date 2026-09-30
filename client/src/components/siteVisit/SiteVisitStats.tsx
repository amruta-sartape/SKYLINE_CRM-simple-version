import React from 'react';
import { SiteVisitSummary } from '../../types/siteVisit.types';
import { CalendarCheck2, Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface SiteVisitStatsProps {
  summary: SiteVisitSummary | null;
  isLoading?: boolean;
}

export const SiteVisitStats: React.FC<SiteVisitStatsProps> = ({ summary, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Site Visits',
      value: summary?.total_visits || 0,
      subtext: 'All Historical & Scheduled',
      icon: <Users className="w-4 h-4 text-brand-600" />,
      bg: 'bg-brand-50/50',
      border: 'border-brand-200/80',
    },
    {
      title: 'Today Visits',
      value: summary?.today_visits || 0,
      subtext: 'Scheduled for Today',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50/50',
      border: 'border-amber-200/80',
    },
    {
      title: 'Upcoming',
      value: summary?.upcoming_visits || 0,
      subtext: 'Next 7 Days Pipeline',
      icon: <CalendarCheck2 className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-50/50',
      border: 'border-blue-200/80',
    },
    {
      title: 'Completed',
      value: summary?.completed_visits || 0,
      subtext: 'Conducted Successfully',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200/80',
    },
    {
      title: 'Rescheduled / Cancelled',
      value: (summary?.rescheduled_visits || 0) + (summary?.cancelled_visits || 0) + (summary?.no_show_visits || 0),
      subtext: `${summary?.no_show_visits || 0} No Shows recorded`,
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50/40',
      border: 'border-rose-200/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`p-3.5 rounded-xl border ${c.border} ${c.bg} shadow-subtle flex flex-col justify-between transition-all hover:shadow-card`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {c.title}
            </span>
            <div className="p-1 rounded-lg bg-white shadow-xs border border-slate-100">
              {c.icon}
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
              {c.value}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{c.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

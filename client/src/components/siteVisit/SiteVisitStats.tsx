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
          <div key={i} className="h-20 bg-slate-100 dark:bg-[#1A2230] rounded-xl border border-slate-200/80 dark:border-[#242F42]" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Visits',
      value: summary?.total_visits || 0,
      subtext: 'All Historical & Scheduled',
      icon: <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />,
      accentBg: 'bg-slate-100 dark:bg-[#1A2230]',
    },
    {
      title: "Today's Visits",
      value: summary?.today_visits || 0,
      subtext: 'Scheduled for Today',
      icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      accentBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    },
    {
      title: 'Upcoming',
      value: summary?.upcoming_visits || 0,
      subtext: 'Next 7 Days Pipeline',
      icon: <CalendarCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      accentBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    },
    {
      title: 'Completed',
      value: summary?.completed_visits || 0,
      subtext: 'Conducted Successfully',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
    },
    {
      title: 'Rescheduled / Cancelled',
      value:
        (summary?.rescheduled_visits || 0) +
        (summary?.cancelled_visits || 0) +
        (summary?.no_show_visits || 0),
      subtext: `${summary?.no_show_visits || 0} No Shows recorded`,
      icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      accentBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-[#242F42] bg-white dark:bg-[#141A24] shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-[#3B4B66] hover:shadow-xs min-h-[90px]"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {c.title}
            </span>
            <div className={`p-1.5 rounded-lg ${c.accentBg} shrink-0`}>
              {c.icon}
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block font-sans">
              {c.value}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate block">
              {c.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

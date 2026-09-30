import React from 'react';
import { FollowUpSummary } from '../../types/followUp.types';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

interface FollowUpStatsProps {
  summary: FollowUpSummary | null;
  activeView: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';
  onViewChange: (view: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all') => void;
  isLoading?: boolean;
}

export const FollowUpStats: React.FC<FollowUpStatsProps> = ({
  summary,
  activeView,
  onViewChange,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    );
  }

  const tabs: {
    id: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';
    label: string;
    value: number;
    subtext: string;
    icon: React.ReactNode;
    activeClass: string;
    badgeClass: string;
  }[] = [
    {
      id: 'today',
      label: 'Due Today',
      value: summary?.today || 0,
      subtext: "Today's Call / Task List",
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      activeClass: 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500 text-amber-950',
      badgeClass: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      value: summary?.upcoming || 0,
      subtext: 'Next 7 Days Pipeline',
      icon: <Calendar className="w-4 h-4 text-blue-600" />,
      activeClass: 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500 text-blue-950',
      badgeClass: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'overdue',
      label: 'Overdue Pending',
      value: summary?.overdue || 0,
      subtext: 'Missed Action Items',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
      activeClass: 'border-rose-500 bg-rose-50/70 ring-1 ring-rose-500 text-rose-950',
      badgeClass: 'bg-rose-100 text-rose-800 font-bold',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: summary?.completed || 0,
      subtext: 'Resolved Engagements',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      activeClass: 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500 text-emerald-950',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'all',
      label: 'Total Follow-ups',
      value: summary?.total || 0,
      subtext: 'All Engagement Records',
      icon: <Layers className="w-4 h-4 text-brand-600" />,
      activeClass: 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500 text-brand-950',
      badgeClass: 'bg-brand-100 text-brand-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onViewChange(tab.id)}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              isActive
                ? tab.activeClass + ' shadow-md scale-[1.01]'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-subtle'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {tab.label}
              </span>
              <div className="p-1 rounded-lg bg-white shadow-xs border border-slate-100">
                {tab.icon}
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {tab.value}
                </span>
                {tab.id === 'overdue' && tab.value > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                    Urgent
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                {tab.subtext}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

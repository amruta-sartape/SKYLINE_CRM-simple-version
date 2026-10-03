import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { UserRole } from '../../types/auth.types';
import {
  PipelineStage,
  QualificationStatus,
  LeadPriority,
  EnquiryStatus,
} from '../../types/crm.types';
import { UnitAvailability, ProjectStatus } from '../../types/property.types';
import { SiteVisitStatus, SiteVisitOutcome } from '../../types/siteVisit.types';
import { FollowUpStatus, FollowUpType } from '../../types/followUp.types';

export interface BadgeProps {
  role?: UserRole | string;
  stage?: PipelineStage | string;
  qualification?: QualificationStatus | string;
  priority?: LeadPriority | string;
  enquiryStatus?: EnquiryStatus | string;
  availability?: UnitAvailability | string;
  projectStatus?: ProjectStatus | string;
  siteVisitStatus?: SiteVisitStatus | string;
  siteVisitOutcome?: SiteVisitOutcome | string;
  followUpStatus?: FollowUpStatus | string;
  followUpType?: FollowUpType | string;
  variant?: 'admin' | 'employee' | 'agent' | 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'purple';
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  role,
  stage,
  qualification,
  priority,
  enquiryStatus,
  availability,
  projectStatus,
  siteVisitStatus,
  siteVisitOutcome,
  followUpStatus,
  followUpType,
  variant,
  size = 'md',
  showIcon = true,
  className,
  children,
}) => {
  let customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
  let icon: React.ReactNode = null;
  let labelText = children;

  if (role) {
    if (role === 'ADMIN') {
      customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-700/60 text-amber-900 dark:text-amber-300';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
      labelText = labelText || 'Administrator';
    } else if (role === 'EMPLOYEE') {
      customClasses = 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-700/60 text-blue-900 dark:text-blue-300';
      icon = <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
      labelText = labelText || 'Operations';
    } else if (role === 'AGENT') {
      customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300';
      icon = <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      labelText = labelText || 'Agent';
    } else if (role === 'CUSTOMER') {
      customClasses = 'bg-stone-100 dark:bg-[#1A2230] border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200';
      icon = <UserCheck className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 shrink-0" />;
      labelText = labelText || 'Customer';
    }
  } else if (stage) {
    switch (stage) {
      case 'New':
        customClasses = 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-700/60 text-sky-800 dark:text-sky-300';
        break;
      case 'Contacted':
        customClasses = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-700/60 text-indigo-800 dark:text-indigo-300';
        break;
      case 'Follow-up':
        customClasses = 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-700/60 text-purple-800 dark:text-purple-300';
        break;
      case 'Site Visit':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/60 text-amber-900 dark:text-amber-300';
        break;
      case 'Negotiation':
        customClasses = 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-700/60 text-orange-900 dark:text-orange-300';
        break;
      case 'Converted':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300';
        break;
      case 'Lost':
        customClasses = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-700/60 text-rose-800 dark:text-rose-300';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || stage;
  } else if (qualification) {
    switch (qualification) {
      case 'Qualified':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300';
        break;
      case 'Not Interested':
        customClasses = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-700/60 text-rose-800 dark:text-rose-300';
        break;
      case 'Future Prospect':
        customClasses = 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-700/60 text-blue-800 dark:text-blue-300';
        break;
      case 'Wrong Number':
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
        break;
      case 'Duplicate':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/60 text-amber-800 dark:text-amber-300';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || qualification;
  } else if (priority) {
    switch (priority) {
      case 'Urgent':
        customClasses = 'bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700/70 text-rose-900 dark:text-rose-200 font-bold';
        break;
      case 'High':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/60 text-amber-900 dark:text-amber-300';
        break;
      case 'Medium':
        customClasses = 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-700/60 text-blue-800 dark:text-blue-300';
        break;
      case 'Low':
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-600 dark:text-slate-400';
        break;
    }
    labelText = labelText || priority;
  } else if (enquiryStatus) {
    switch (enquiryStatus) {
      case 'New Lead':
        customClasses = 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-700/60 text-sky-800 dark:text-sky-300';
        break;
      case 'In Progress':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/60 text-amber-900 dark:text-amber-300';
        break;
      case 'Converted':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300';
        break;
      case 'Dropped':
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-600 dark:text-slate-400';
        break;
    }
  } else if (availability) {
    switch (availability) {
      case 'Available':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 font-semibold';
        break;
      case 'Reserved':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 font-semibold';
        break;
      case 'Sold':
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-300 dark:border-[#2A364C] text-slate-700 dark:text-slate-300 font-medium';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || availability;
  } else if (projectStatus) {
    switch (projectStatus) {
      case 'Active':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300';
        break;
      case 'Upcoming':
        customClasses = 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700/60 text-sky-800 dark:text-sky-300';
        break;
      case 'Completed':
        customClasses = 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700/60 text-purple-800 dark:text-purple-300';
        break;
      case 'On Hold':
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-300 dark:border-[#2A364C] text-slate-600 dark:text-slate-400';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || projectStatus;
  } else if (siteVisitStatus) {
    switch (siteVisitStatus) {
      case 'Scheduled':
        customClasses = 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700/60 text-sky-900 dark:text-sky-300 font-medium';
        break;
      case 'Completed':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300 font-semibold';
        break;
      case 'Rescheduled':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 font-medium';
        break;
      case 'Cancelled':
        customClasses = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-700/60 text-rose-800 dark:text-rose-300';
        break;
      case 'No Show':
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-300 dark:border-[#2A364C] text-slate-600 dark:text-slate-400 font-medium';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || siteVisitStatus;
  } else if (siteVisitOutcome) {
    switch (siteVisitOutcome) {
      case 'Interested':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 font-semibold';
        break;
      case 'Follow-up Required':
        customClasses = 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 text-blue-800 dark:text-blue-300';
        break;
      case 'Needs More Time':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300';
        break;
      case 'Not Interested':
        customClasses = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-300';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || siteVisitOutcome;
  } else if (followUpStatus) {
    switch (followUpStatus) {
      case 'Scheduled':
        customClasses = 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700/60 text-sky-800 dark:text-sky-300';
        break;
      case 'Completed':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 font-semibold';
        break;
      case 'Rescheduled':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300';
        break;
      case 'Cancelled':
        customClasses = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-700/60 text-rose-800 dark:text-rose-300';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || followUpStatus;
  } else if (followUpType) {
    switch (followUpType) {
      case 'Phone Call':
        customClasses = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-700/60 text-indigo-800 dark:text-indigo-300';
        break;
      case 'WhatsApp':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 font-medium';
        break;
      case 'Email':
        customClasses = 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-700/60 text-sky-800 dark:text-sky-300';
        break;
      case 'Meeting':
        customClasses = 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-700/60 text-purple-800 dark:text-purple-300 font-medium';
        break;
      case 'Video Call':
        customClasses = 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-700/60 text-pink-800 dark:text-pink-300';
        break;
      case 'SMS':
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-300 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
    labelText = labelText || followUpType;
  } else if (variant) {
    switch (variant) {
      case 'success':
        customClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300';
        break;
      case 'warning':
        customClasses = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/60 text-amber-800 dark:text-amber-300';
        break;
      case 'error':
        customClasses = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-700/60 text-rose-800 dark:text-rose-300';
        break;
      case 'info':
        customClasses = 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-700/60 text-sky-800 dark:text-sky-300';
        break;
      case 'purple':
        customClasses = 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-700/60 text-purple-800 dark:text-purple-300';
        break;
      default:
        customClasses = 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#2A364C] text-slate-700 dark:text-slate-300';
    }
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.2 text-[9px] font-semibold',
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md border tracking-wide uppercase select-none shrink-0',
        sizeClasses[size],
        customClasses,
        className
      )}
    >
      {showIcon && icon}
      <span>{labelText}</span>
    </span>
  );
};

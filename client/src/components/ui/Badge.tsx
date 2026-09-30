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

export interface BadgeProps {
  role?: UserRole | string;
  stage?: PipelineStage | string;
  qualification?: QualificationStatus | string;
  priority?: LeadPriority | string;
  enquiryStatus?: EnquiryStatus | string;
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
  variant,
  size = 'md',
  showIcon = true,
  className,
  children,
}) => {
  let customClasses = 'bg-slate-100 border-slate-200 text-slate-700';
  let icon: React.ReactNode = null;
  let labelText = children;

  if (role) {
    if (role === 'ADMIN') {
      customClasses = 'bg-amber-50 border-amber-300/80 text-amber-900';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      labelText = labelText || 'Administrator';
    } else if (role === 'EMPLOYEE') {
      customClasses = 'bg-blue-50 border-blue-200 text-blue-900';
      icon = <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      labelText = labelText || 'Operations';
    } else if (role === 'AGENT') {
      customClasses = 'bg-emerald-50 border-emerald-200 text-emerald-900';
      icon = <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      labelText = labelText || 'Agent';
    }
  } else if (stage) {
    switch (stage) {
      case 'New':
        customClasses = 'bg-sky-50 border-sky-200 text-sky-800';
        break;
      case 'Contacted':
        customClasses = 'bg-indigo-50 border-indigo-200 text-indigo-800';
        break;
      case 'Follow-up':
        customClasses = 'bg-purple-50 border-purple-200 text-purple-800';
        break;
      case 'Site Visit':
        customClasses = 'bg-amber-50 border-amber-200 text-amber-900';
        break;
      case 'Negotiation':
        customClasses = 'bg-orange-50 border-orange-200 text-orange-900';
        break;
      case 'Converted':
        customClasses = 'bg-emerald-50 border-emerald-300 text-emerald-900';
        break;
      case 'Lost':
        customClasses = 'bg-rose-50 border-rose-200 text-rose-800';
        break;
      default:
        customClasses = 'bg-slate-100 border-slate-200 text-slate-700';
    }
    labelText = labelText || stage;
  } else if (qualification) {
    switch (qualification) {
      case 'Qualified':
        customClasses = 'bg-emerald-50 border-emerald-300 text-emerald-800';
        break;
      case 'Not Interested':
        customClasses = 'bg-rose-50 border-rose-200 text-rose-800';
        break;
      case 'Future Prospect':
        customClasses = 'bg-blue-50 border-blue-200 text-blue-800';
        break;
      case 'Wrong Number':
        customClasses = 'bg-slate-100 border-slate-200 text-slate-700';
        break;
      case 'Duplicate':
        customClasses = 'bg-amber-50 border-amber-200 text-amber-800';
        break;
      default:
        customClasses = 'bg-slate-100 border-slate-200 text-slate-700';
    }
    labelText = labelText || qualification;
  } else if (priority) {
    switch (priority) {
      case 'Urgent':
        customClasses = 'bg-rose-100 border-rose-300 text-rose-900 font-bold';
        break;
      case 'High':
        customClasses = 'bg-amber-50 border-amber-200 text-amber-900';
        break;
      case 'Medium':
        customClasses = 'bg-blue-50 border-blue-200 text-blue-800';
        break;
      case 'Low':
        customClasses = 'bg-slate-100 border-slate-200 text-slate-600';
        break;
    }
    labelText = labelText || priority;
  } else if (enquiryStatus) {
    switch (enquiryStatus) {
      case 'New Lead':
        customClasses = 'bg-sky-50 border-sky-200 text-sky-800';
        break;
      case 'In Progress':
        customClasses = 'bg-amber-50 border-amber-200 text-amber-900';
        break;
      case 'Converted':
        customClasses = 'bg-emerald-50 border-emerald-300 text-emerald-900';
        break;
      case 'Dropped':
        customClasses = 'bg-slate-100 border-slate-200 text-slate-600';
        break;
    }
    labelText = labelText || enquiryStatus;
  } else if (variant) {
    switch (variant) {
      case 'success':
        customClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800';
        break;
      case 'warning':
        customClasses = 'bg-amber-50 border-amber-200 text-amber-800';
        break;
      case 'error':
        customClasses = 'bg-rose-50 border-rose-200 text-rose-800';
        break;
      case 'info':
        customClasses = 'bg-sky-50 border-sky-200 text-sky-800';
        break;
      case 'purple':
        customClasses = 'bg-purple-50 border-purple-200 text-purple-800';
        break;
      default:
        customClasses = 'bg-slate-100 border-slate-200 text-slate-700';
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

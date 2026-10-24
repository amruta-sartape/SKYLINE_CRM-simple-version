import React from 'react';

const colorMap = {
  // Generic status
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Settled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cleared: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  New: 'bg-sky-50 text-sky-700 border-sky-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Partially Paid': 'bg-amber-50 text-amber-700 border-amber-200',
  'Site Visit Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
  'Converted to Lead': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending KYC': 'bg-rose-50 text-rose-700 border-rose-200',
  'Token Paid': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Process': 'bg-amber-50 text-amber-700 border-amber-200',
  'Draft Generated': 'bg-slate-100 text-slate-700 border-slate-200',
  'Signed & Stamped': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  
  // Roles
  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  Employee: 'bg-blue-50 text-blue-700 border-blue-200',
  Agent: 'bg-teal-50 text-teal-700 border-teal-200',

  // Standard semantic variants
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',

  // Priorities
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const Badge = ({ children, variant, className = '' }) => {
  const badgeClass =
    colorMap[children] ||
    colorMap[variant] ||
    'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass} ${className}`}
    >
      {children}
    </span>
  );
};

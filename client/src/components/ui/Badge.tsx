import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { UserRole } from '../../types/auth.types';

export interface BadgeProps {
  role?: UserRole | string;
  variant?: 'admin' | 'employee' | 'agent' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  role,
  variant,
  size = 'md',
  showIcon = true,
  className,
  children,
}) => {
  let resolvedVariant = variant;
  if (!resolvedVariant && role) {
    if (role === 'ADMIN') resolvedVariant = 'admin';
    else if (role === 'EMPLOYEE') resolvedVariant = 'employee';
    else if (role === 'AGENT') resolvedVariant = 'agent';
    else resolvedVariant = 'neutral';
  }

  const styles = {
    admin: {
      bg: 'bg-amber-50 border-amber-300/80 text-amber-900',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />,
      label: 'Administrator',
    },
    employee: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Briefcase className="w-3.5 h-3.5 text-blue-600" />,
      label: 'Operations / Staff',
    },
    agent: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'Real Estate Agent',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: null,
      label: 'Active',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: null,
      label: 'Pending',
    },
    neutral: {
      bg: 'bg-slate-100 border-slate-200 text-slate-700',
      icon: null,
      label: 'Standard',
    },
  };

  const current = styles[resolvedVariant || 'neutral'];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold rounded-md border tracking-wide uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        current.bg,
        className
      )}
    >
      {showIcon && current.icon}
      <span>{children || current.label}</span>
    </span>
  );
};

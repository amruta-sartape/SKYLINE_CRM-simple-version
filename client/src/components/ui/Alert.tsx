import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  children,
  onClose,
  className,
  action,
}) => {
  const variantStyles = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
      titleColor: 'text-rose-900',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      titleColor: 'text-emerald-900',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-900',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
      titleColor: 'text-blue-900',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      role="alert"
      className={clsx(
        'relative flex items-start gap-3 p-3.5 rounded-lg border text-sm animate-fade-in shadow-xs',
        current.container,
        className
      )}
    >
      {current.icon}

      <div className="flex-1 min-w-0 pr-2 text-left">
        {title && <h5 className={clsx('font-semibold text-sm mb-0.5', current.titleColor)}>{title}</h5>}
        {message && <div className="text-xs leading-relaxed opacity-90">{message}</div>}
        {children && <div className="text-xs leading-relaxed opacity-90">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

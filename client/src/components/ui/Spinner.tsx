import React from 'react';
import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'white' | 'gold' | 'slate';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  variant = 'primary',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-7 h-7 border-3',
    xl: 'w-10 h-10 border-4',
  };

  const variantClasses = {
    primary: 'border-brand-500/20 border-t-brand-600',
    white: 'border-white/30 border-t-white',
    gold: 'border-amber-400/20 border-t-amber-500',
    slate: 'border-slate-300 border-t-slate-700',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'rounded-full animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

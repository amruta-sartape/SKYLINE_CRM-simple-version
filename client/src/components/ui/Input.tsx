import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, id, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="relative w-full rounded-lg">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError && id ? `${id}-error` : undefined}
          className={clsx(
            'w-full block text-sm rounded-lg transition-colors duration-150',
            'bg-white dark:bg-[#101622] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'border shadow-xs',
            leftIcon ? 'pl-10' : 'pl-3.5',
            rightIcon ? 'pr-10' : 'pr-3.5',
            'py-2.5',
            hasError
              ? 'border-rose-300 dark:border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-300 dark:border-[#2A364C] hover:border-slate-400 dark:hover:border-[#3B4B66] focus:border-slate-900 dark:focus:border-amber-500 focus:ring-2 focus:ring-slate-900/15 dark:focus:ring-amber-500/20',
            disabled && 'bg-slate-100 dark:bg-[#1A2230] text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-75',
            'focus:outline-none',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

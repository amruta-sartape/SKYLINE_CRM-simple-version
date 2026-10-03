import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string | boolean;
  helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, error, helperText, className, disabled, checked, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={clsx('relative flex items-start gap-2.5 select-none', className)}>
        <div className="flex items-center h-5">
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={clsx(
                'w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center cursor-pointer',
                'peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-slate-900/30 dark:peer-focus:ring-amber-500/30',
                checked
                  ? 'bg-slate-900 dark:bg-amber-600 border-slate-900 dark:border-amber-600 text-white'
                  : 'bg-white dark:bg-[#101622] border-slate-300 dark:border-[#2A364C] hover:border-slate-400 dark:hover:border-[#3B4B66]',
                error && !checked ? 'border-rose-400 ring-1 ring-rose-400/30' : '',
                disabled && 'bg-slate-100 dark:bg-[#1A2230] border-slate-200 dark:border-[#242F42] cursor-not-allowed opacity-60'
              )}
              onClick={() => {
                const el = document.getElementById(inputId) as HTMLInputElement;
                if (el && !disabled) el.click();
              }}
            >
              {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
            </div>
          </div>
        </div>

        {(label || helperText) && (
          <div className="text-xs leading-5">
            {label && (
              <label
                htmlFor={inputId}
                className={clsx(
                  'cursor-pointer text-slate-700 dark:text-slate-200 font-normal',
                  disabled && 'cursor-not-allowed opacity-60'
                )}
              >
                {label}
              </label>
            )}
            {helperText && <p className="text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>}
            {error && typeof error === 'string' && (
              <p className="text-rose-600 dark:text-rose-400 font-medium mt-0.5">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  helperText,
  required = false,
  className,
  children,
}) => {
  return (
    <div className={clsx('space-y-1.5 w-full text-left', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={htmlFor}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide uppercase"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        </div>
      )}

      <div>{children}</div>

      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-1 animate-fade-in"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p
          id={htmlFor ? `${htmlFor}-helper` : undefined}
          className="text-xs text-slate-400 mt-1"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

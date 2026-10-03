import React from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'luxury';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-5 py-3 text-base gap-2.5 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 text-white shadow-sm hover:shadow focus:ring-slate-900 dark:focus:ring-amber-500 border border-slate-900 dark:border-amber-600',
      secondary:
        'bg-slate-100 dark:bg-[#1A2230] hover:bg-slate-200 dark:hover:bg-[#222D40] text-slate-800 dark:text-slate-200 focus:ring-slate-400 dark:focus:ring-slate-600 border border-slate-200/80 dark:border-[#242F42]',
      outline:
        'bg-transparent hover:bg-slate-50 dark:hover:bg-[#1A2230] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#2A364C] focus:ring-slate-400 shadow-sm',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-[#1A2230] text-slate-700 dark:text-slate-300 focus:ring-slate-300',
      danger:
        'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white focus:ring-rose-500 shadow-sm',
      luxury:
        'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-[#141A24] dark:via-[#1E2738] dark:to-[#141A24] hover:from-slate-800 hover:to-slate-700 text-white border border-amber-500/30 shadow-md hover:shadow-lg focus:ring-amber-500',
    };

    const spinnerVariant = variant === 'secondary' || variant === 'outline' || variant === 'ghost' ? 'slate' : 'white';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'sm' ? 'sm' : 'md'} variant={spinnerVariant} />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

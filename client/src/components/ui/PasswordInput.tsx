import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showLockIcon?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showLockIcon = true, leftIcon, id = 'password', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <Input
        ref={ref}
        id={id}
        type={showPassword ? 'text' : 'password'}
        leftIcon={leftIcon || (showLockIcon ? <Lock className="w-4 h-4" /> : undefined)}
        rightIcon={
          <button
            type="button"
            onClick={toggleVisibility}
            className="text-slate-400 hover:text-slate-700 focus:outline-none focus:text-slate-900 transition-colors p-1 rounded hover:bg-slate-100"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-slate-600" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

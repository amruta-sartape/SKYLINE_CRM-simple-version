import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { validateLoginForm } from '../utils/validation';
import { LoginCredentials } from '../types/auth.types';
import { Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target path after login (if redirected by ProtectedRoute)
  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific error upon user typing
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Frontend validation
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData);
      showToast({
        variant: 'success',
        title: 'Authentication Successful',
        message: 'Welcome back to SKYLINE CRM.',
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please verify your credentials.';
      setServerError(msg);
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Account Auto-fill helper
  const handleQuickFill = (role: 'ADMIN' | 'EMPLOYEE' | 'AGENT') => {
    if (role === 'ADMIN') {
      setFormData({
        email: 'admin@skylinecrm.com',
        password: 'SkylineAdmin2026!',
        rememberMe: true,
      });
    } else if (role === 'EMPLOYEE') {
      setFormData({
        email: 'employee@skylinecrm.com',
        password: 'SkylineEmployee2026!',
        rememberMe: true,
      });
    } else if (role === 'AGENT') {
      setFormData({
        email: 'agent@skylinecrm.com',
        password: 'SkylineAgent2026!',
        rememberMe: true,
      });
    }
    setErrors({});
    setServerError(null);
  };

  return (
    <AuthLayout
      title="Sign In to Skyline CRM"
      subtitle="Enter your real estate corporate credentials to access the portal."
      badgeText="Secure Portal Access"
    >
      <div className="space-y-5">
        {/* Server Error Alert */}
        {serverError && (
          <Alert
            variant="error"
            title="Authentication Failed"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Demo Fast Fill Pill Switcher */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-left">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Quick Test Credentials:</span>
            <span className="text-[10px] text-amber-400 font-medium">Click to populate</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-400/60 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('EMPLOYEE')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-400/60 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Operations</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('AGENT')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-400/60 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agent</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Corporate Email <span className="text-rose-400">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="e.g. name@skylinecrm.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Password <span className="text-rose-400">*</span>
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your secure password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-brand-600 focus:ring-brand-500"
              />
              <span>Remember this device</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-300 hover:text-brand-200 transition-colors hover:underline focus:outline-none focus:ring-1 focus:ring-brand-400 rounded"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-brand-600 via-blue-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white shadow-lg border-0"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Skyline CRM
            </Button>
          </div>
        </form>

        {/* Link to Register */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-300">
            Need an agent account?{' '}
            <Link
              to="/register"
              className="font-bold text-amber-400 hover:text-amber-300 transition-colors hover:underline"
            >
              Register as Real Estate Agent
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

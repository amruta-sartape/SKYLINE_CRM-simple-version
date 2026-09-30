import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Checkbox } from '../components/ui/Checkbox';
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
      title="Sign in to your account"
      subtitle="Enter your real estate corporate credentials to access the CRM."
      badgeText="Secure Portal Access"
    >
      <div className="space-y-6">
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
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-left">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Quick Test Credentials:</span>
            <span className="text-[10px] text-brand-600 font-medium">Click to populate</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 rounded text-xs font-semibold transition-all shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('EMPLOYEE')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 rounded text-xs font-semibold transition-all shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Operations</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('AGENT')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded text-xs font-semibold transition-all shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Agent</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <FormField
            label="Corporate Email Address"
            htmlFor="email"
            required
            error={errors.email}
          >
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
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Password */}
          <FormField
            label="Password"
            htmlFor="password"
            required
            error={errors.password}
          >
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
          </FormField>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              label="Remember this device"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors hover:underline focus:outline-none focus:ring-1 focus:ring-brand-500 rounded"
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
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Skyline CRM
            </Button>
          </div>
        </form>

        {/* Link to Register */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Need an agent account?{' '}
            <Link
              to="/register"
              className="font-bold text-slate-900 hover:text-brand-600 transition-colors hover:underline"
            >
              Register as Real Estate Agent
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

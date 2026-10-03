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
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target path after login (if redirected by ProtectedRoute or Auth Gate)
  const rawFrom = (location.state as any)?.from;
  const targetPath = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname || '/customer';

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
      const authedUser = await login(formData);
      showToast({
        variant: 'success',
        title: 'Welcome Back',
        message: `Welcome back, ${authedUser?.name || 'Customer'}!`,
      });

      // Check for pending intent in sessionStorage
      let returnPath = targetPath;
      try {
        const pendingIntentStr = sessionStorage.getItem('skyline_pending_intent');
        if (pendingIntentStr) {
          const pendingIntent = JSON.parse(pendingIntentStr);
          if (pendingIntent.returnTo && pendingIntent.returnTo !== '/customer/login' && pendingIntent.returnTo !== '/login') {
            returnPath = pendingIntent.returnTo;
          }
          sessionStorage.removeItem('skyline_pending_intent');
        }
      } catch (e) {
        console.error('Failed to parse pending intent:', e);
      }

      const isCustomer = Boolean(
        authedUser?.roles?.some((r: string) => String(r).toUpperCase().trim() === 'CUSTOMER') ||
        String((authedUser as any)?.role || '').toUpperCase().trim() === 'CUSTOMER'
      );

      if (returnPath && returnPath !== '/' && returnPath !== '/login' && returnPath !== '/customer/login') {
        navigate(returnPath, { replace: true });
      } else if (isCustomer) {
        navigate('/customer', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
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

  return (
    <AuthLayout
      title="Customer Portal Sign In"
      subtitle="Access your saved properties, enquiries, and site visit schedules."
      badgeText="Customer Access"
    >
      <div className="space-y-5">
        {/* Server Error Alert */}
        {serverError && (
          <Alert
            variant="error"
            title="Sign In Failed"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <Input
              id="customer-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="e.g. customer@skylinecrm.com"
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
              id="customer-password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your customer password"
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
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-400"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors hover:underline focus:outline-none"
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
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg border-0"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Customer Portal
            </Button>
          </div>
        </form>

        {/* Footer Navigation: Register & Discovery & Staff Sign In */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-300">
            Don't have a customer account?{' '}
            <Link
              to="/customer/register"
              className="font-bold text-amber-400 hover:text-amber-300 transition-colors hover:underline"
            >
              Create Free Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-3 text-xs pt-1 text-slate-400">
            <Link
              to="/discovery"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors hover:underline"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Browse Properties</span>
            </Link>
            <span>•</span>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

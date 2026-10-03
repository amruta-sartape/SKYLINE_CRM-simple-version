import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { validateLoginForm } from '../utils/validation';
import { LoginCredentials } from '../types/auth.types';
import { Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase, ExternalLink, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine initial role from query parameter or default to ADMIN
  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialRole: 'ADMIN' | 'EMPLOYEE' | 'AGENT' =
    roleParam === 'AGENT' ? 'AGENT' : roleParam === 'EMPLOYEE' || roleParam === 'OPERATIONS' ? 'EMPLOYEE' : 'ADMIN';

  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EMPLOYEE' | 'AGENT'>(initialRole);

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync role if query param changes
  useEffect(() => {
    if (roleParam === 'AGENT') setSelectedRole('AGENT');
    else if (roleParam === 'EMPLOYEE' || roleParam === 'OPERATIONS') setSelectedRole('EMPLOYEE');
    else if (roleParam === 'ADMIN') setSelectedRole('ADMIN');
  }, [roleParam]);

  // Target path after login (if redirected by ProtectedRoute)
  const rawFrom = (location.state as any)?.from;
  const targetPath = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname || '/';

  const handleRoleSelect = (role: 'ADMIN' | 'EMPLOYEE' | 'AGENT') => {
    setSelectedRole(role);
    setErrors({});
    setServerError(null);
  };

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
        title: 'Authentication Successful',
        message: 'Welcome back to SKYLINE CRM.',
      });

      const isCustomer = Boolean(
        authedUser?.roles?.some((r: string) => String(r).toUpperCase().trim() === 'CUSTOMER') ||
        String((authedUser as any)?.role || '').toUpperCase().trim() === 'CUSTOMER'
      );

      if (rawFrom && targetPath !== '/' && targetPath !== '/login' && targetPath !== '/discovery') {
        navigate(targetPath, { replace: true });
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
      title="Sign In to Skyline CRM"
      subtitle="Select your staff role and enter your real estate corporate credentials."
      badgeText="Staff Portal Access"
    >
      <div className="space-y-5">
        {/* Server Error Alert */}
        {serverError && (
          <Alert
            variant="error"
            title="Authentication Failed"
            message={
              <div>
                <p>{serverError}</p>
                {serverError.toLowerCase().includes('verify') && (
                  <div className="mt-2 pt-2 border-t border-rose-500/20">
                    <Link
                      to="/verify-email"
                      className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline"
                    >
                      Need a new verification email? Click here to resend.
                    </Link>
                  </div>
                )}
              </div>
            }
            onClose={() => setServerError(null)}
          />
        )}

        {/* ========================================================================= */}
        {/* THREE MAIN STAFF SECTIONS: 1. ADMIN | 2. EMPLOYEE / OPERATIONS | 3. AGENT */}
        {/* ========================================================================= */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-left">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Staff Portal Entry:</span>
            <span className="text-[10px] text-amber-400 font-medium">Select Staff Role</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {/* 1. ADMIN */}
            <button
              type="button"
              onClick={() => handleRoleSelect('ADMIN')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all shadow-sm border cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-amber-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Admin</span>
            </button>

            {/* 2. EMPLOYEE / OPERATIONS */}
            <button
              type="button"
              onClick={() => handleRoleSelect('EMPLOYEE')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all shadow-sm border cursor-pointer ${
                selectedRole === 'EMPLOYEE'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-200 shadow-blue-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Operations</span>
            </button>

            {/* 3. AGENT */}
            <button
              type="button"
              onClick={() => handleRoleSelect('AGENT')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all shadow-sm border cursor-pointer ${
                selectedRole === 'AGENT'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-emerald-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Agent</span>
            </button>
          </div>
        </div>

        {/* Role Context & Security Notice */}
        <div
          className={`p-2.5 rounded-lg border text-left text-xs ${
            selectedRole === 'ADMIN'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : selectedRole === 'EMPLOYEE'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          {selectedRole === 'ADMIN' && (
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-amber-300">Administrator Access:</span> Private credentials required. Public self-registration is disabled for Admin accounts.
              </div>
            </div>
          )}
          {selectedRole === 'EMPLOYEE' && (
            <div className="flex items-start gap-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-blue-300">Operations & Management:</span> Access unit catalog, pipelines, and logistics. Corporate email verification required.
              </div>
            </div>
          )}
          {selectedRole === 'AGENT' && (
            <div className="flex items-start gap-2">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-emerald-300">Sales Agent Access:</span> Manage buyer enquiries, site visits, and client relationships. Email verification required.
              </div>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              {selectedRole === 'ADMIN'
                ? 'Administrator Email'
                : selectedRole === 'EMPLOYEE'
                ? 'Operations Email'
                : 'Agent Email'}{' '}
              <span className="text-rose-400">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={
                selectedRole === 'ADMIN'
                  ? 'admin@skylinecrm.com'
                  : selectedRole === 'EMPLOYEE'
                  ? 'operations@skylinecrm.com'
                  : 'agent@skylinecrm.com'
              }
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
              {selectedRole === 'ADMIN'
                ? 'Sign In as Administrator'
                : selectedRole === 'EMPLOYEE'
                ? 'Sign In as Operations Staff'
                : 'Sign In as Sales Agent'}
            </Button>
          </div>
        </form>

        {/* Registration Links based on Selected Role */}
        <div className="pt-3 border-t border-slate-800 text-center space-y-1.5">
          {selectedRole === 'ADMIN' ? (
            <p className="text-xs text-slate-400">
              Admin accounts are securely provisioned by system administration.
            </p>
          ) : selectedRole === 'EMPLOYEE' ? (
            <p className="text-xs text-slate-300">
              Need an operations account?{' '}
              <Link
                to="/register?role=operations"
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors hover:underline"
              >
                Register as Operations / Staff
              </Link>
            </p>
          ) : (
            <p className="text-xs text-slate-300">
              Need an agent account?{' '}
              <Link
                to="/register?role=agent"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors hover:underline"
              >
                Register as Real Estate Agent
              </Link>
            </p>
          )}

          {/* Separate Dedicated Customer Portal Link */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400 border-t border-slate-800/60 mt-2">
            <span>Looking for property discovery?</span>
            <Link
              to="/discovery"
              className="font-semibold text-amber-400 hover:text-amber-300 transition-colors hover:underline inline-flex items-center gap-1"
            >
              <span>Customer Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

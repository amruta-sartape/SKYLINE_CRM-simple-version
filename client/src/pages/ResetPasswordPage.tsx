import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useToast } from '../context/ToastContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { validateResetPasswordForm, checkPasswordStrength } from '../utils/validation';
import { ResetPasswordFormData } from '../types/auth.types';
import { KeyRound, ArrowRight, CheckCircle2, Check, X as XIcon } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const tokenParam = searchParams.get('token') || '';

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    token: tokenParam,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      setFormData((prev) => ({ ...prev, token: tokenParam }));
    }
  }, [tokenParam]);

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

    const validationErrors = validateResetPasswordForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(formData);
      setIsSuccess(true);
      showToast({
        variant: 'success',
        title: 'Password Updated',
        message: 'Your new password has been saved. Please sign in.',
      });
    } catch (err: any) {
      setServerError(err.message || 'Password reset failed. The token may be expired or invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Set a secure new password for your SKYLINE CRM corporate account."
      badgeText="Credential Recovery"
    >
      <div className="space-y-6">
        {serverError && (
          <Alert
            variant="error"
            title="Reset Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {isSuccess ? (
          <div className="space-y-5 text-left animate-fade-in">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-sm text-emerald-900 mb-1">
                  Password Successfully Changed
                </p>
                <p>
                  Your corporate account password has been updated in the database. You may now log in with your updated credentials.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Token field */}
            <FormField
              label="Reset Verification Token"
              htmlFor="token"
              required
              error={errors.token}
              helperText="Auto-populated from reset link, or paste the 64-character token"
            >
              <Input
                id="token"
                name="token"
                type="text"
                placeholder="Paste reset token here"
                value={formData.token}
                onChange={handleChange}
                error={errors.token}
                leftIcon={<KeyRound className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            {/* New Password */}
            <FormField
              label="New Password"
              htmlFor="password"
              required
              error={errors.password}
            >
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Enter new strong password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={isSubmitting}
              />
            </FormField>

            {/* Strength Meter */}
            {formData.password.length > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2 text-left">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Strength:</span>
                  <span className="font-bold text-slate-800">{passwordStrength.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                  <div className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordStrength.hasMinLength ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <XIcon className="w-3 h-3 text-slate-400 shrink-0" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordStrength.hasUppercase ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <XIcon className="w-3 h-3 text-slate-400 shrink-0" />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordStrength.hasNumber ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <XIcon className="w-3 h-3 text-slate-400 shrink-0" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordStrength.hasSpecial ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <XIcon className="w-3 h-3 text-slate-400 shrink-0" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <FormField
              label="Confirm New Password"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                disabled={isSubmitting}
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Save New Password
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel and return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

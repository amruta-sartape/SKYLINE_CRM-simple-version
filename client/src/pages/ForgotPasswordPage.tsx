import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { validateForgotPasswordForm } from '../utils/validation';
import { ForgotPasswordFormData } from '../types/auth.types';
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    if (errors.email) {
      setErrors({});
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateForgotPasswordForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword(formData);
      setIsSubmitted(true);
      if (result.previewToken) {
        setPreviewToken(result.previewToken);
      }
    } catch (err: any) {
      setServerError(err.message || 'Unable to process password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your verified corporate email to receive a secure password reset token."
      badgeText="Account Recovery"
    >
      <div className="space-y-6">
        {serverError && (
          <Alert
            variant="error"
            title="Request Failed"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {isSubmitted ? (
          <div className="space-y-5 text-left animate-fade-in">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-sm text-emerald-900 mb-1">
                  Recovery Instructions Dispatched
                </p>
                <p>
                  If an account exists for <strong className="font-semibold">{formData.email}</strong>, a secure password reset token has been registered in the database.
                </p>
              </div>
            </div>

            {/* Development token helper */}
            {previewToken && (
              <div className="p-3.5 bg-slate-900 text-white rounded-lg border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Dev Mode Active Reset Token</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Valid for 60 min</span>
                </div>
                <p className="font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800 break-all text-slate-300 select-all">
                  {previewToken}
                </p>
                <Button
                  variant="luxury"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/reset-password?token=${previewToken}`)}
                >
                  Proceed Directly to Reset Password Screen →
                </Button>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  setPreviewToken(null);
                }}
              >
                Send to a different email address
              </Button>

              <Link to="/login" className="w-full">
                <Button variant="ghost" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Corporate Email Address"
              htmlFor="email"
              required
              error={errors.email}
              helperText="We will send a one-time verification token to this address."
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="e.g. yourname@skylinecrm.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
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
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Password Reset Instructions
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

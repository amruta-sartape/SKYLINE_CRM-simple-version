import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { validateRegistrationForm, checkPasswordStrength } from '../utils/validation';
import { RegisterFormData } from '../types/auth.types';
import {
  User as UserIcon,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  X as XIcon,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-level error
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

    // Validate
    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      showToast({
        variant: 'success',
        title: 'Account Created',
        message: 'Welcome to SKYLINE CRM! Your Agent account is active.',
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your information.';
      setServerError(msg);
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthLayout
        title="Create your Agent Account"
        subtitle="Join your agency team on the SKYLINE real estate CRM platform."
        badgeText="Real Estate Agent Onboarding"
      >
        <div className="space-y-5">
          {/* Server Error Alert */}
          {serverError && (
            <Alert
              variant="error"
              title="Registration Error"
              message={serverError}
              onClose={() => setServerError(null)}
            />
          )}

          {/* Role Security Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-left text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Role Provisioning:</span> Public signups are automatically provisioned with{' '}
              <strong className="text-amber-950 font-semibold">Real Estate Agent</strong> permissions. Administrative access is strictly provisioned by your system administrator.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <FormField
              label="Full Name"
              htmlFor="name"
              required
              error={errors.name}
            >
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Jordan Mitchell"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                leftIcon={<UserIcon className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email Address"
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
                placeholder="jordan.mitchell@brokerage.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            {/* Phone Number */}
            <FormField
              label="Contact Phone Number"
              htmlFor="phone"
              required
              error={errors.phone}
              helperText="For client dispatch and site visit alerts"
            >
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                leftIcon={<Phone className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            {/* Password */}
            <div className="space-y-1.5">
              <FormField
                label="Password"
                htmlFor="password"
                required
                error={errors.password}
              >
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={isSubmitting}
                />
              </FormField>

              {/* Password Strength Indicator (Appears when user starts typing) */}
              {formData.password.length > 0 && (
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2 text-left animate-fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Strength:</span>
                    <span
                      className={`font-bold ${
                        passwordStrength.score <= 1
                          ? 'text-rose-600'
                          : passwordStrength.score === 2
                          ? 'text-amber-600'
                          : passwordStrength.score === 3
                          ? 'text-blue-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 1
                          ? passwordStrength.score === 1
                            ? 'bg-rose-500'
                            : passwordStrength.score === 2
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 2
                          ? passwordStrength.score === 2
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 4 ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Criteria Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {passwordStrength.hasMinLength ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span>8+ characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {passwordStrength.hasUppercase ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span>Uppercase letter (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {passwordStrength.hasNumber ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span>Number (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {passwordStrength.hasSpecial ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span>Special symbol (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <FormField
              label="Confirm Password"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                disabled={isSubmitting}
              />
            </FormField>

            {/* Terms of Service Checkbox */}
            <div className="pt-1 text-left">
              <Checkbox
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                error={errors.termsAccepted}
                disabled={isSubmitting}
                label={
                  <span>
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="font-semibold text-brand-600 hover:text-brand-800 underline focus:outline-none"
                    >
                      Terms of Service
                    </button>{' '}
                    and agree to adhere to brokerage data protection guidelines.
                  </span>
                }
              />
            </div>

            {/* Create Account Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Agent Account
              </Button>
            </div>
          </form>

          {/* Link back to Login */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-slate-900 hover:text-brand-600 transition-colors hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="SKYLINE CRM Terms of Service"
        description="Enterprise Real Estate Platform Use Agreement"
        maxWidth="lg"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData((prev) => ({ ...prev, termsAccepted: true }));
              setIsTermsModalOpen(false);
            }}
          >
            Agree & Accept
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-96 overflow-y-auto pr-2 text-left">
          <p>
            <strong>1. Scope of Use:</strong> SKYLINE CRM is an enterprise software platform engineered exclusively for authorized real estate professionals, employees, and agency representatives.
          </p>
          <p>
            <strong>2. Data Protection:</strong> All customer inquiries, lead records, site visit notes, and transaction financials stored within SKYLINE CRM are confidential corporate records. Unauthorized export, sharing, or copying is strictly forbidden.
          </p>
          <p>
            <strong>3. Role Governance:</strong> Role assignments are governed by the database. Any unauthorized attempts to elevate permissions or manipulate session claims will result in immediate session revocation and audit logging.
          </p>
          <p>
            <strong>4. Security Obligations:</strong> Users are responsible for safeguarding their login credentials and adhering to enterprise password complexity standards.
          </p>
        </div>
      </Modal>
    </>
  );
};

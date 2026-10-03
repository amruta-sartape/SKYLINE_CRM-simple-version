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
  Compass,
  Sparkles,
} from 'lucide-react';

export const CustomerRegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: true,
    role: 'CUSTOMER',
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
      await register({
        ...formData,
        role: 'CUSTOMER',
      });
      showToast({
        variant: 'success',
        title: 'Account Created Successfully! 🎉',
        message: 'Welcome to SKYLINE! Your Customer Portal is ready.',
      });

      // Target path after registration (from location state or pending intent)
      const rawFrom = (location.state as any)?.from;
      const stateTarget = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname;
      let returnPath = stateTarget && stateTarget !== '/customer/register' && stateTarget !== '/customer/login' ? stateTarget : '/customer';

      try {
        const pendingIntentStr = sessionStorage.getItem('skyline_pending_intent');
        if (pendingIntentStr) {
          const pendingIntent = JSON.parse(pendingIntentStr);
          if (pendingIntent.returnTo && pendingIntent.returnTo !== '/customer/register' && pendingIntent.returnTo !== '/customer/login') {
            returnPath = pendingIntent.returnTo;
          }
          sessionStorage.removeItem('skyline_pending_intent');
        }
      } catch (e) {
        console.error('Failed to parse pending intent:', e);
      }

      navigate(returnPath, { replace: true });
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
        title="Create Customer Account"
        subtitle="Discover, wishlist, and tour premier properties with personalized advisor care."
        badgeText="Customer Registration"
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

          {/* Customer Welcome Info Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left text-xs text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300">Free Customer Membership:</span> Save luxury properties to your wishlist, request private on-site viewings, and connect directly with verified developers.
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
                placeholder="e.g. Aarav Mehta"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
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
                placeholder="e.g. aarav.mehta@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                disabled={isSubmitting}
              />
            </FormField>

            {/* Phone Number */}
            <FormField
              label="Contact Phone Number"
              htmlFor="phone"
              required
              error={errors.phone}
              helperText="For site visit notifications & advisor coordination"
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
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
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
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={isSubmitting}
                />
              </FormField>

              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2 text-left animate-fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Strength:</span>
                    <span
                      className={`font-bold ${
                        passwordStrength.score <= 1
                          ? 'text-rose-400'
                          : passwordStrength.score === 2
                          ? 'text-amber-400'
                          : passwordStrength.score === 3
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
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
                        passwordStrength.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {passwordStrength.hasMinLength ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                      <span>8+ characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.hasUppercase ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {passwordStrength.hasUppercase ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                      <span>Uppercase (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {passwordStrength.hasNumber ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                      <span>Number (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {passwordStrength.hasSpecial ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <XIcon className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                      <span>Special symbol</span>
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
                  <span className="text-xs text-slate-300">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="font-semibold text-amber-400 hover:text-amber-300 underline focus:outline-none"
                    >
                      Customer Terms & Privacy Policy
                    </button>
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
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg border-0"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Free Customer Account
              </Button>
            </div>
          </form>

          {/* Links back to Customer Login and Staff Login */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-300">
              Already have a customer account?{' '}
              <Link
                to="/customer/login"
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors hover:underline"
              >
                Sign In
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
                <span>Staff Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>

      {/* Customer Terms Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="Skyline Real Estate Customer Terms"
        description="Client Discovery and Property Touring Policy"
        maxWidth="lg"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData((prev) => ({ ...prev, termsAccepted: true }));
              setIsTermsModalOpen(false);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            Agree & Continue
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-stone-600 dark:text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-2 text-left">
          <p>
            <strong>1. Customer Services:</strong> Registered Skyline customers receive access to verified property listings, saved wishlists across devices, direct real estate advisor inquiries, and on-site visit scheduling.
          </p>
          <p>
            <strong>2. Privacy & Data Safety:</strong> Your contact information is used strictly to coordinate requested property tours and verified advisory support. We never sell your personal contact information to third parties.
          </p>
          <p>
            <strong>3. Site Visit Etiquette:</strong> Please arrive on time for scheduled property tours. In case of cancellation or rescheduling, please notify your assigned advisor at least 2 hours in advance.
          </p>
        </div>
      </Modal>
    </>
  );
};

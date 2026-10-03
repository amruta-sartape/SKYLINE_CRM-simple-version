import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Briefcase,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isCustomerParam = searchParams.get('role')?.toLowerCase() === 'customer';
  const isEmployeeParam = searchParams.get('role')?.toLowerCase() === 'employee' || searchParams.get('role')?.toLowerCase() === 'operations';

  // If role=customer is requested, redirect to dedicated Customer Register page
  React.useEffect(() => {
    if (isCustomerParam) {
      navigate('/customer/register', { replace: true });
    }
  }, [isCustomerParam, navigate]);

  const [selectedRole, setSelectedRole] = useState<'AGENT' | 'EMPLOYEE'>(
    isEmployeeParam ? 'EMPLOYEE' : 'AGENT'
  );

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    role: selectedRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
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

  const handleRoleChange = (role: 'AGENT' | 'EMPLOYEE') => {
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, role }));
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
        role: selectedRole,
      });

      setRegisteredEmail(formData.email);
      setIsRegistrationSuccess(true);
      showToast({
        variant: 'success',
        title: 'Registration Submitted',
        message: 'Please check your email to verify your account before logging in.',
      });
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

  if (isRegistrationSuccess) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Verification required before portal access."
        badgeText="Registration Submitted"
      >
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Registration Successful!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              We have sent a verification link to <strong className="text-brand-300 font-semibold">{registeredEmail}</strong>.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-left mt-3">
              <p className="font-semibold text-amber-300">Important:</p>
              <p className="mt-0.5 text-[11px] text-slate-300">
                Please check your email and click the verification link to activate your account before logging in.
              </p>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-brand-600 to-blue-600 text-white font-bold shadow-lg"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Sign In
            </Button>
            <p className="text-xs text-slate-400">
              Didn't receive the email?{' '}
              <Link to="/verify-email" className="font-semibold text-brand-400 hover:underline">
                Resend verification email
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <>
      <AuthLayout
        title={selectedRole === 'EMPLOYEE' ? 'Create Operations Account' : 'Create Agent Account'}
        subtitle="Join the SKYLINE real estate CRM corporate platform."
        badgeText="Staff Onboarding"
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

          {/* Role Selection Tabs */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Staff Role <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('AGENT')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'AGENT'
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sales Agent</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('EMPLOYEE')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'EMPLOYEE'
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Operations / Staff</span>
              </button>
            </div>
          </div>

          {/* Role Security Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-left text-xs text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300">Security Verification:</span> All staff accounts require mandatory corporate email verification prior to first login. Administrator credentials cannot be registered publicly.
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
              label="Corporate Email Address"
              htmlFor="email"
              required
              error={errors.email}
              helperText="A verification link will be sent to this email address"
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="jordan.mitchell@skylinecrm.com"
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
                      className="font-semibold text-brand-400 hover:text-brand-300 underline focus:outline-none"
                    >
                      Terms of Service
                    </button>{' '}
                    and agree to adhere to corporate brokerage data protection policies.
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
                className="w-full bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-brand-600 text-white font-bold shadow-lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {selectedRole === 'EMPLOYEE' ? 'Create Operations Account' : 'Create Agent Account'}
              </Button>
            </div>
          </form>

          {/* Link back to Login */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-1.5">
            <p className="text-xs text-slate-300">
              Already have a staff account?{' '}
              <Link
                to="/login"
                className="font-bold text-brand-400 hover:text-brand-300 transition-colors hover:underline"
              >
                Sign In
              </Link>
            </p>
            <div className="text-[11px] text-slate-400">
              <span>Looking to explore properties? </span>
              <Link to="/customer/register" className="font-semibold text-amber-400 hover:underline">
                Register as Customer
              </Link>
            </div>
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
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-2 text-left">
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

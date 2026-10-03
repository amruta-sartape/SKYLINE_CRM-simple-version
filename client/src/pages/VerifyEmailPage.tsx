import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { CheckCircle2, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState<string>('');
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setResendEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      return;
    }

    let isMounted = true;
    const executeVerification = async () => {
      try {
        const msg = await authService.verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          setMessage(msg || 'Email verified successfully. Your account is now active.');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'Verification link is invalid or has expired.');
        }
      }
    };

    executeVerification();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendMessage(null);

    if (!resendEmail || !resendEmail.includes('@')) {
      setResendError('Please enter a valid corporate email address.');
      return;
    }

    setIsResending(true);
    try {
      const msg = await authService.resendVerification(resendEmail);
      setResendMessage(msg || 'A verification link has been sent if an unverified account exists.');
    } catch (err: any) {
      setResendError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Corporate staff account authentication and activation."
      badgeText="Security Gateway"
    >
      <div className="space-y-5 text-left">
        {/* State: Verifying Token */}
        {status === 'verifying' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">Verifying Security Token</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please wait while we validate your activation link with the server...
              </p>
            </div>
          </div>
        )}

        {/* State: Verification Success */}
        {status === 'success' && (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Account Successfully Verified!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                {message || 'Your corporate email address has been verified. You can now sign in to your dashboard.'}
              </p>
            </div>
            <div className="pt-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-brand-600 text-white font-bold shadow-lg"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Sign In
              </Button>
            </div>
          </div>
        )}

        {/* State: Verification Error or Idle Request Resend */}
        {(status === 'error' || status === 'idle') && (
          <div className="space-y-4">
            {status === 'error' && (
              <Alert
                variant="error"
                title="Verification Link Expired or Invalid"
                message={message || 'The verification link has expired or has already been used.'}
              />
            )}

            {resendMessage && (
              <Alert
                variant="success"
                title="Verification Email Dispatched"
                message={resendMessage}
              />
            )}

            {resendError && (
              <Alert
                variant="error"
                title="Error"
                message={resendError}
                onClose={() => setResendError(null)}
              />
            )}

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Request New Verification Link
                </h4>
                <p className="text-xs text-slate-400">
                  Enter your registered corporate email to receive a new activation link:
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-3" noValidate>
                <FormField label="Corporate Email" htmlFor="resendEmail" required>
                  <Input
                    id="resendEmail"
                    name="resendEmail"
                    type="email"
                    placeholder="name@skylinecrm.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                    disabled={isResending}
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isResending}
                  rightIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Send Verification Link
                </Button>
              </form>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

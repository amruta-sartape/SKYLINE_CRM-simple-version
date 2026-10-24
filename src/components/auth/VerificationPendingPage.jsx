import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Send, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const VerificationPendingPage = ({ onNavigateToLogin, onVerificationSuccess }) => {
  const {
    verificationPendingUser,
    resendVerification,
    checkVerificationStatus
  } = useAuth();
  const { addToast } = useToast();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const targetEmail =
    verificationPendingUser?.email ||
    verificationPendingUser?.profile?.email ||
    verificationPendingUser?.user?.email ||
    'your registered email';

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    try {
      const res = await resendVerification();
      addToast(res.message || 'Verification email resent. Please check your inbox.', 'success');
      setCooldown(60); // 60s cooldown
    } catch (err) {
      addToast(err.message || 'Failed to resend verification email.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const verified = await checkVerificationStatus();
      if (verified) {
        setIsVerified(true);
        addToast('Email verified successfully! You can now log into Skyline CRM.', 'success');
        if (onVerificationSuccess) {
          setTimeout(() => onVerificationSuccess(), 1500);
        }
      } else {
        addToast('Email is not verified yet. Please check your inbox and click the verification link.', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Could not verify status. Please try again.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10 text-center">
          
          {isVerified ? (
            <div className="py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Email Verified Successfully!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Your Skyline CRM account has been verified. You now have full access to your assigned portal.
              </p>
              <div className="pt-4">
                <button
                  onClick={onNavigateToLogin}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-bold shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 bg-brand-500/20 border border-brand-500/40 text-brand-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Verify Your Email Address
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We've sent a verification link to:
                </p>
                <div className="mt-2 py-1.5 px-3 bg-slate-900/90 border border-slate-700 rounded-lg text-brand-300 font-mono text-xs font-semibold break-all">
                  {targetEmail}
                </div>
              </div>

              <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-left flex items-start gap-2.5 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  To protect enterprise CRM data, you must click the verification link in your email before logging in.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-bold shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking Status...' : 'I Have Verified My Email'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isResending
                      ? 'Dispatching...'
                      : cooldown > 0
                      ? `Resend available in ${cooldown}s`
                      : 'Resend Verification Email'}
                  </span>
                </button>
              </div>

              {/* Return to Login */}
              <div className="pt-3 text-center border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

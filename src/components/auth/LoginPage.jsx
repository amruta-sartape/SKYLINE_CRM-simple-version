import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

const CREDENTIALS_BY_ROLE = {
  Admin: { username: 'admin', password: 'password123' },
  Employee: { username: 'employee', password: 'employee123' },
  Agent: { username: 'agent', password: 'agent123' }
};

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [userRole, setUserRole] = useState('Admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isAdminInfoModalOpen, setIsAdminInfoModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    setErrorMsg('');
    if (CREDENTIALS_BY_ROLE[newRole]) {
      setUsername(CREDENTIALS_BY_ROLE[newRole].username);
      setPassword(CREDENTIALS_BY_ROLE[newRole].password);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(username, password, userRole);
      setIsLoading(false);

      if (res.success && res.user) {
        addToast(`Welcome, ${res.user.firstName}! Accessing ${res.user.role} Dashboard.`, 'success');
      } else {
        setErrorMsg(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
    }
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setUserRole('Admin');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/30 mb-4 ring-1 ring-white/20">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Skyline CRM
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Real Estate Enterprise Management Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          
          {/* Validation / Error Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-700/80 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Select User (Role) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select User <span className="text-brand-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAdminInfoModalOpen(true)}
                  className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3 h-3" />
                  <span>Role Security</span>
                </button>
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={userRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter username or email"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password <span className="text-brand-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons: Login & Reset */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full py-2.5 px-4 border border-slate-600 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700 hover:text-white transition-all shadow-xs cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-bold shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* System Enterprise Portal Badge */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Enterprise Authentication Portal
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />

      {/* Role Security Info Modal */}
      {isAdminInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-brand-500/20 text-brand-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Role-Based Security Protocol</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              <span>
                In Skyline CRM, each account role (<strong>Admin</strong>, <strong>Employee</strong>, and <strong>Agent</strong>) has dedicated, role-authorized dashboards and operational permissions.
              </span>
              <span className="block mt-2">
                Users must select their authorized role from the dropdown when logging in. Role mismatch will be automatically rejected.
              </span>
            </p>
            <div className="mt-5 pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setIsAdminInfoModalOpen(false)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

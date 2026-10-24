import React, { useState } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterPage = ({ onNavigateToLogin, onRegistrationSuccess }) => {
  const { register } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    role: 'Employee' // Type of User: Employee or Agent
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid corporate email is required';
    if (!formData.username.trim() || formData.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!formData.role) errs.role = 'Please select user type';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await register(formData);
      setIsLoading(false);

      if (res.success) {
        addToast('Verification email sent. Please verify your email before logging in.', 'success');
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        }
      } else {
        setErrors({ global: res.message });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ global: err.message || 'Registration failed. Please check your network and inputs.' });
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      role: 'Employee'
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/30 mb-3 ring-1 ring-white/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create User Registration
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Join the Skyline CRM Real Estate Management Network
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.global && (
              <div className="p-3 bg-rose-950/70 border border-rose-700/80 text-rose-200 text-xs rounded-xl flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errors.global}</span>
              </div>
            )}

            {/* Type of User (Employee / Agent) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Type of User <span className="text-brand-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.role === 'Employee'
                      ? 'bg-brand-600/20 border-brand-500 text-white font-bold ring-1 ring-brand-500'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Employee"
                    checked={formData.role === 'Employee'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span className="text-sm">Employee</span>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.role === 'Agent'
                      ? 'bg-teal-600/20 border-teal-500 text-white font-bold ring-1 ring-teal-500'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Agent"
                    checked={formData.role === 'Agent'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span className="text-sm">Agent</span>
                </label>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  First Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Rachel"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Last Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Adams"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Phone No & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Phone No <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rachel.a@skylinecrm.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Username <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="rachel_adams"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {errors.username && <p className="text-xs text-rose-400 mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
              </div>
            </div>

            {/* Buttons: Register & Reset */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full py-2.5 px-4 border border-slate-600 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-bold shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </div>

            {/* Return to Login */}
            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

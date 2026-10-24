import React, { useState } from 'react';
import { UserPlus, User, Mail, Phone, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { PageHeader } from '../../../components/common/PageHeader';

export const CreateUser = ({ onNavigateToList }) => {
  const { addUser, users } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    role: 'Employee',
    department: 'Sales & Operations'
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid corporate email is required';
    if (!formData.username.trim() || formData.username.length < 3) errs.username = 'Username min 3 characters';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password min 6 characters';
    
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === formData.username.trim().toLowerCase() ||
        u.email.toLowerCase() === formData.email.trim().toLowerCase()
    );
    if (exists) errs.username = 'Username or email already assigned in Skyline CRM';

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const created = addUser(formData);
    addToast(`User account created for ${created.firstName} ${created.lastName} (${created.role})`, 'success');
    if (onNavigateToList) onNavigateToList();
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      role: 'Employee',
      department: 'Sales & Operations'
    });
    setErrors({});
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create User"
        subtitle="Provision enterprise user credentials and configure role-based access permissions."
        breadcrumbs={['Skyline CRM', 'User Management', 'Create User']}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type & Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              System Access Role <span className="text-brand-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Admin', 'Employee', 'Agent'].map((r) => (
                <label
                  key={r}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    formData.role === r
                      ? 'bg-brand-50/70 border-brand-500 text-brand-900 font-bold ring-2 ring-brand-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={formData.role === r}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <ShieldCheck className={`w-5 h-5 mb-1.5 ${formData.role === r ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="text-sm">{r}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {r === 'Admin' ? 'Executive Access' : r === 'Employee' ? 'CRM Operations' : 'Channel Partner'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                First Name <span className="text-brand-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Jonathan"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              {errors.firstName && <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Last Name <span className="text-brand-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Miller"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              {errors.lastName && <p className="text-xs text-rose-600 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Corporate Email Address <span className="text-brand-600">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="j.miller@skylinecrm.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Login Username <span className="text-brand-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. jmiller"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              {errors.username && <p className="text-xs text-rose-600 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Temporary Password <span className="text-brand-600">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Department Assignment
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="Sales & Operations">Sales & Operations</option>
              <option value="Executive Management">Executive Management</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="Channel Partner Network">Channel Partner Network</option>
              <option value="Commercial Realty">Commercial Realty</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

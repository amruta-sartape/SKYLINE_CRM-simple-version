import React, { useState, useEffect } from 'react';
import { UserCheck, User, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { PageHeader } from '../../../components/common/PageHeader';

export const UpdateUser = ({ selectedUser, onUpdated }) => {
  const { users, updateUser } = useAuth();
  const { addToast } = useToast();

  const [selectedUserId, setSelectedUserId] = useState(
    selectedUser ? selectedUser.id : users[0]?.id || ''
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: 'Employee',
    department: '',
    status: 'Active'
  });

  useEffect(() => {
    const userToEdit = users.find((u) => u.id === selectedUserId);
    if (userToEdit) {
      setFormData({
        firstName: userToEdit.firstName || '',
        lastName: userToEdit.lastName || '',
        phone: userToEdit.phone || '',
        email: userToEdit.email || '',
        role: userToEdit.role || 'Employee',
        department: userToEdit.department || '',
        status: userToEdit.status || 'Active'
      });
    }
  }, [selectedUserId, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      addToast('First and last names are required.', 'error');
      return;
    }

    updateUser(selectedUserId, formData);
    addToast(`User profile for ${formData.firstName} ${formData.lastName} updated.`, 'success');
    if (onUpdated) onUpdated();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Update User Profile"
        subtitle="Modify user credentials, assign new security roles, change active statuses and departments."
        breadcrumbs={['Skyline CRM', 'User Management', 'Update User']}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
        {/* User Selection Dropdown */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Select User Account To Modify:
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} (@{u.username}) — {u.role} [{u.status}]
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Corporate Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Role, Department & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                System Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
                <option value="Agent">Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Account Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PlusCircle, User, Phone, Mail, Building, DollarSign, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';

export const EnquiryEntry = ({ onNavigateToList }) => {
  const { addEnquiry } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    projectInterest: 'Skyline Tower A',
    unitType: '2 BHK Premium',
    budget: '$350,000 - $450,000',
    source: 'Direct Walk-in',
    assignedTo: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
    notes: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.phone.trim()) {
      addToast('Client Name and Phone number are required.', 'error');
      return;
    }

    const created = addEnquiry(formData);
    addToast(`Enquiry ${created.id} recorded for ${created.clientName}`, 'success');
    setIsSuccess(true);
  };

  const handleReset = () => {
    setFormData({
      clientName: '',
      phone: '',
      email: '',
      projectInterest: 'Skyline Tower A',
      unitType: '2 BHK Premium',
      budget: '$350,000 - $450,000',
      source: 'Direct Walk-in',
      assignedTo: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
      notes: ''
    });
    setIsSuccess(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Enquiry Entry"
        subtitle="Log new customer inquiries, capture unit specifications, preferences and assign followup protocols."
        breadcrumbs={['Skyline CRM', 'Enquiries & Leads', 'Enquiry Entry']}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Enquiry Entry Registered!</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              The inquiry has been logged into Skyline CRM database with unique reference code.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Log Another Enquiry
              </button>
              {onNavigateToList && (
                <button
                  onClick={onNavigateToList}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  View All Enquiries
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Client Full Name <span className="text-brand-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone No <span className="text-brand-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Email & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Enquiry Source Channel
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Direct Walk-in">Direct Walk-in / Sales Lounge</option>
                  <option value="Website Direct">Website Direct Lead</option>
                  <option value="Channel Agent">Channel Partner / Agent</option>
                  <option value="Property Expo">Property Expo / Exhibition</option>
                  <option value="Referral">Client Referral</option>
                </select>
              </div>
            </div>

            {/* Project, Unit & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Project Preference
                </label>
                <select
                  value={formData.projectInterest}
                  onChange={(e) => setFormData({ ...formData, projectInterest: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Skyline Tower A">Skyline Tower A</option>
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Skyline Grandeur">Skyline Grandeur</option>
                  <option value="Skyline Green Park">Skyline Green Park</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit Specification
                </label>
                <input
                  type="text"
                  value={formData.unitType}
                  onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                  placeholder="2 BHK Premium"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Budget Expectation
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="$350,000 - $450,000"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Client Remarks & Special Instructions
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Interested in east-facing balconies, loan assistance requested..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Enquiry Entry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

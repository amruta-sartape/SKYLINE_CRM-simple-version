import React, { useState } from 'react';
import { PlusCircle, PhoneCall, Phone, Mail, Building, DollarSign, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const AgentEnquiry = ({ initialMode = 'display' }) => {
  const { enquiries, addEnquiry } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialMode); // 'entry' or 'display'
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    projectInterest: 'Skyline Grandeur',
    unitType: '3 BHK Deluxe',
    budget: '$500,000 - $650,000',
    source: 'Channel Agent',
    assignedTo: `${currentUser?.firstName || 'Marcus'} ${currentUser?.lastName || 'Vance'}`.trim(),
    notes: ''
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.phone.trim()) {
      addToast('Client name and phone are required.', 'error');
      return;
    }

    const created = addEnquiry(formData);
    addToast(`Partner enquiry ${created.id} registered for ${created.clientName}`, 'success');
    setActiveTab('display');
    setFormData({
      clientName: '',
      phone: '',
      email: '',
      projectInterest: 'Skyline Grandeur',
      unitType: '3 BHK Deluxe',
      budget: '$500,000 - $650,000',
      source: 'Channel Agent',
      assignedTo: `${currentUser?.firstName || 'Marcus'} ${currentUser?.lastName || 'Vance'}`.trim(),
      notes: ''
    });
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-teal-700',
      width: '100px'
    },
    {
      header: 'Buyer Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.clientName}</div>
          <div className="text-[11px] text-slate-500">{row.phone} • {row.email}</div>
        </div>
      )
    },
    {
      header: 'Project & Unit',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.projectInterest}</div>
          <div className="text-[11px] text-slate-500">{row.unitType} ({row.budget})</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'enquiryDate',
      cellClassName: 'text-xs text-slate-500'
    },
    {
      header: 'Status',
      render: (row) => <Badge>{row.status}</Badge>
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedEnquiry(row)}
          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeTab === 'entry' ? 'Partner Enquiry Entry' : 'Display All Enquiries'}
        subtitle="Manage prospective buyer interests, allocate preferred unit configurations and review pipeline status."
        breadcrumbs={['Skyline CRM', 'Enquiries', activeTab === 'entry' ? 'Entry' : 'Display']}
        actions={
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'entry' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enquiry Entry</span>
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'display' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Display All Enquiries
            </button>
          </div>
        }
      />

      {activeTab === 'entry' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 max-w-3xl mx-auto">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Buyer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Benjamin Patel"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Buyer Phone No *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="benjamin@gmail.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Development Project
                </label>
                <select
                  value={formData.projectInterest}
                  onChange={(e) => setFormData({ ...formData, projectInterest: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Skyline Grandeur">Skyline Grandeur</option>
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Skyline Tower A">Skyline Tower A</option>
                  <option value="Skyline Green Park">Skyline Green Park</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit Type
                </label>
                <input
                  type="text"
                  value={formData.unitType}
                  onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                  placeholder="3 BHK Deluxe"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Expected Budget Range
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="$500,000 - $650,000"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Client Preferences / Requirements
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="High floor preference, club view..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Partner Enquiry</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <DataTable
          title="Agent-Enquiries"
          columns={columns}
          data={enquiries}
          searchPlaceholder="Search buyer, project, phone..."
          filterKey="status"
          filterOptions={['New', 'In Progress', 'Site Visit Scheduled', 'Converted to Lead']}
        />
      )}

      {/* Details Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={Boolean(selectedEnquiry)}
          onClose={() => setSelectedEnquiry(null)}
          title={`Enquiry Details: ${selectedEnquiry.clientName}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Client Name:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedEnquiry.clientName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Phone:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedEnquiry.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Project & Unit:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedEnquiry.projectInterest}</p>
                <p className="text-slate-600">{selectedEnquiry.unitType}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Budget:</span>
                <p className="text-emerald-700 font-bold mt-0.5">{selectedEnquiry.budget}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Status:</span>
                <p className="mt-0.5"><Badge>{selectedEnquiry.status}</Badge></p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Enquiry Date:</span>
                <p className="text-slate-900 font-medium mt-0.5">{selectedEnquiry.enquiryDate}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

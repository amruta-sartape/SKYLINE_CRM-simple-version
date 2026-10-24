import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Filter, Layers, DollarSign, UserCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const LeadQualificationPage = () => {
  const { leadTrack, addLead, updateLead, deleteLead } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    budget: '$450,000',
    loanRequired: 'Yes (Bank Loan)',
    preferredLocation: 'Skyline Tower A (East Wing)',
    flatType: '3 BHK',
    purchaseTimeline: 'Within 30 Days',
    purpose: 'Self Use',
    salesExecutive: 'Sarah Jenkins',
    leadStatus: 'Qualified',
    notes: ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please enter Customer Name.', 'error');
      return;
    }

    if (editingLead) {
      updateLead(editingLead.id, formData);
      addToast(`Lead ${editingLead.id} updated successfully.`, 'success');
      setEditingLead(null);
    } else {
      const created = addLead(formData);
      addToast(`New lead ${created.id} qualified for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      budget: '$450,000',
      loanRequired: 'Yes (Bank Loan)',
      preferredLocation: 'Skyline Tower A (East Wing)',
      flatType: '3 BHK',
      purchaseTimeline: 'Within 30 Days',
      purpose: 'Self Use',
      salesExecutive: 'Sarah Jenkins',
      leadStatus: 'Qualified',
      notes: ''
    });
  };

  const openEditModal = (item) => {
    setEditingLead(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteLead(deletingId);
      addToast('Lead record removed.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Qualified':
        return 'success';
      case 'Future Prospect':
        return 'warning';
      case 'Not Interested':
        return 'danger';
      case 'Wrong Number':
      case 'Duplicate':
        return 'secondary';
      default:
        return 'brand';
    }
  };

  const columns = [
    {
      header: 'Lead ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '100px'
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[11px] text-slate-500">Purpose: <span className="font-semibold text-slate-700">{row.purpose}</span></div>
        </div>
      )
    },
    {
      header: 'Budget & Financing',
      render: (row) => (
        <div>
          <div className="font-bold text-emerald-700 text-xs">{row.budget}</div>
          <div className="text-[10px] text-slate-500 font-medium">Loan: {row.loanRequired}</div>
        </div>
      )
    },
    {
      header: 'Preferred Unit',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.flatType}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{row.preferredLocation}</div>
        </div>
      )
    },
    {
      header: 'Timeline',
      accessor: 'purchaseTimeline',
      cellClassName: 'text-xs font-semibold text-slate-700'
    },
    {
      header: 'Executive',
      accessor: 'salesExecutive',
      cellClassName: 'text-xs text-slate-600'
    },
    {
      header: 'Lead Status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.leadStatus)}>
          {row.leadStatus}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingLead(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Lead"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Lead qualification summary cards
  const qualifiedCount = leadTrack.filter(l => l.leadStatus === 'Qualified').length;
  const prospectCount = leadTrack.filter(l => l.leadStatus === 'Future Prospect').length;
  const notInterestedCount = leadTrack.filter(l => ['Not Interested', 'Wrong Number', 'Duplicate'].includes(l.leadStatus)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Qualification & Track"
        description="Verify financial eligibility, purchase timeline, and categorize sales prospects."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Lead Track', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                budget: '$450,000',
                loanRequired: 'Yes (Bank Loan)',
                preferredLocation: 'Skyline Tower A (East Wing)',
                flatType: '3 BHK',
                purchaseTimeline: 'Within 30 Days',
                purpose: 'Self Use',
                salesExecutive: 'Sarah Jenkins',
                leadStatus: 'Qualified',
                notes: ''
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Qualify New Lead
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Tracked Leads</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{leadTrack.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all pipeline stages</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Qualified Prospects</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{qualifiedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for unit booking</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Future Prospects</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{prospectCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Nurturing timeline 60+ days</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Archived / Ineligible</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{notInterestedCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Disqualified or wrong contact</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Lead Track Registry"
        subtitle="Manage lead qualifications, financing needs, and sales assignments"
        data={leadTrack}
        columns={columns}
        searchPlaceholder="Search leads by customer, flat type, or executive..."
        filterKey="leadStatus"
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Qualified', value: 'Qualified' },
          { label: 'Future Prospect', value: 'Future Prospect' },
          { label: 'Not Interested', value: 'Not Interested' },
          { label: 'Wrong Number', value: 'Wrong Number' },
          { label: 'Duplicate', value: 'Duplicate' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingLead}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLead(null);
        }}
        title={editingLead ? `Edit Lead Details: ${editingLead.id}` : 'Qualify New Lead'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Jonathan Miller"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Budget Allocation</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. $450,000 - $550,000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Loan Required?</label>
              <select
                value={formData.loanRequired}
                onChange={(e) => setFormData({ ...formData, loanRequired: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Yes (Bank Loan)">Yes (Bank Loan)</option>
                <option value="Yes (Corporate Loan)">Yes (Corporate Loan)</option>
                <option value="No (Self Funded)">No (Self Funded)</option>
                <option value="Undecided">Undecided</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Flat Type</label>
              <select
                value={formData.flatType}
                onChange={(e) => setFormData({ ...formData, flatType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="3 BHK Villa">3 BHK Villa</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Preferred Location / Wing</label>
              <input
                type="text"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Skyline Tower A (Floor 8+)"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Purchase Timeline</label>
              <select
                value={formData.purchaseTimeline}
                onChange={(e) => setFormData({ ...formData, purchaseTimeline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Immediate">Immediate (0-7 Days)</option>
                <option value="Within 30 Days">Within 30 Days</option>
                <option value="Within 60 Days">Within 60 Days</option>
                <option value="3-6 Months">3-6 Months</option>
                <option value="6+ Months">6+ Months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Self Use">Self Use</option>
                <option value="Investment">Investment</option>
                <option value="Rental Yield">Rental Yield</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sales Executive</label>
              <input
                type="text"
                value={formData.salesExecutive}
                onChange={(e) => setFormData({ ...formData, salesExecutive: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="Executive name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Lead Status</label>
              <select
                value={formData.leadStatus}
                onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Qualified">Qualified</option>
                <option value="Future Prospect">Future Prospect</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Executive Notes</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="Eligibility notes, credit score, buyer preferences..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingLead(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingLead ? 'Update Lead' : 'Save Qualified Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingLead && (
        <Modal
          isOpen={true}
          onClose={() => setViewingLead(null)}
          title={`Lead Profile: ${viewingLead.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Tracking Reference</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingLead.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingLead.leadStatus)}>
                {viewingLead.leadStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingLead.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Budget Range</span>
                <p className="font-bold text-emerald-700 mt-0.5">{viewingLead.budget}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Loan Status</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingLead.loanRequired}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Purchase Purpose</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingLead.purpose}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Flat Configuration</span>
                <p className="font-bold text-brand-700 mt-0.5">{viewingLead.flatType}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Purchase Timeline</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingLead.purchaseTimeline}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Preferred Location / Wing</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewingLead.preferredLocation}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sales Executive</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingLead.salesExecutive}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Last Qualification Check</span>
                <p className="font-medium text-slate-600 mt-0.5">{viewingLead.lastContact || '2025-05-18'}</p>
              </div>
            </div>

            {viewingLead.notes && (
              <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-brand-700">Executive Notes</span>
                <p className="text-slate-700 mt-0.5">{viewingLead.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Lead Record"
        message="Are you sure you want to delete this lead from qualification tracking? This cannot be undone."
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, DollarSign, Tag, CheckCircle2, XCircle,
  Clock, ShieldCheck, Sparkles, Building, TrendingDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const NegotiationPage = () => {
  const { negotiations, addNegotiation, updateNegotiation, deleteNegotiation } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNeg, setEditingNeg] = useState(null);
  const [viewingNeg, setViewingNeg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    basePrice: 340000,
    offeredPrice: 325000,
    discount: '$15,000 (4.4%)',
    specialOffer: 'Modular Kitchen + Free Club Membership',
    managementApproval: 'Pending Approval',
    handledBy: 'Sarah Jenkins',
    status: 'Negotiating'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please specify Customer Name.', 'error');
      return;
    }

    const payload = {
      ...formData,
      basePrice: Number(formData.basePrice) || 0,
      offeredPrice: Number(formData.offeredPrice) || 0
    };

    if (editingNeg) {
      updateNegotiation(editingNeg.id, payload);
      addToast(`Negotiation ${editingNeg.id} updated.`, 'success');
      setEditingNeg(null);
    } else {
      const created = addNegotiation(payload);
      addToast(`Negotiation submitted for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      basePrice: 340000,
      offeredPrice: 325000,
      discount: '$15,000 (4.4%)',
      specialOffer: 'Modular Kitchen + Free Club Membership',
      managementApproval: 'Pending Approval',
      handledBy: 'Sarah Jenkins',
      status: 'Negotiating'
    });
  };

  const openEditModal = (item) => {
    setEditingNeg(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteNegotiation(deletingId);
      addToast('Negotiation proposal removed.', 'info');
      setDeletingId(null);
    }
  };

  const getApprovalBadgeVariant = (approval) => {
    switch (approval) {
      case 'Approved':
        return 'success';
      case 'Under Review':
        return 'warning';
      case 'Rejected':
        return 'danger';
      case 'Pending Approval':
      default:
        return 'secondary';
    }
  };

  const columns = [
    {
      header: 'Proposal ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '105px'
    },
    {
      header: 'Customer & Unit',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[11px] text-slate-500 font-semibold">{row.unitNumber}</div>
        </div>
      )
    },
    {
      header: 'Pricing Breakdown',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-emerald-700">
            Offered: ${(Number(row.offeredPrice) || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 line-through">
            List: ${(Number(row.basePrice) || 0).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      header: 'Discount & Concessions',
      render: (row) => (
        <div>
          <div className="text-xs font-bold text-rose-600">{row.discount}</div>
          <div className="text-[10px] text-slate-500 truncate max-w-[180px]" title={row.specialOffer}>
            {row.specialOffer}
          </div>
        </div>
      )
    },
    {
      header: 'Executive',
      accessor: 'handledBy',
      cellClassName: 'text-xs text-slate-700'
    },
    {
      header: 'Management Approval',
      render: (row) => (
        <Badge variant={getApprovalBadgeVariant(row.managementApproval)}>
          {row.managementApproval}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingNeg(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Proposal"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Proposal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const approvedCount = negotiations.filter(n => n.managementApproval === 'Approved').length;
  const pendingCount = negotiations.filter(n => n.managementApproval === 'Pending Approval' || n.managementApproval === 'Under Review').length;
  const rejectedCount = negotiations.filter(n => n.managementApproval === 'Rejected').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Price Negotiation & Special Offers"
        description="Structured discount management, custom amenity bundles, and management sign-offs."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Negotiation', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                basePrice: 340000,
                offeredPrice: 325000,
                discount: '$15,000 (4.4%)',
                specialOffer: 'Modular Kitchen + Free Club Membership',
                managementApproval: 'Pending Approval',
                handledBy: 'Sarah Jenkins',
                status: 'Negotiating'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Negotiation Proposal
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Proposals</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{negotiations.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Pending and approved offers</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Approved by Management</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for booking token</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Awaiting director decision</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Rejected Proposals</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{rejectedCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Exceeds allowed margin</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Negotiation Register"
        subtitle="Review client bids against list pricing and track executive authorizations"
        data={negotiations}
        columns={columns}
        searchPlaceholder="Search customer, unit number, or executive..."
        filterKey="managementApproval"
        filterOptions={[
          { label: 'All Approvals', value: 'ALL' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Pending Approval', value: 'Pending Approval' },
          { label: 'Under Review', value: 'Under Review' },
          { label: 'Rejected', value: 'Rejected' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingNeg}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingNeg(null);
        }}
        title={editingNeg ? `Edit Proposal: ${editingNeg.id}` : 'Create Negotiation Proposal'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer *</label>
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Unit</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 1402"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">List / Base Price ($)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Offered Price ($)</label>
              <input
                type="number"
                value={formData.offeredPrice}
                onChange={(e) => setFormData({ ...formData, offeredPrice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Discount Margin</label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. $25,000 (4.1%)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Special Offer / Concessions</label>
            <input
              type="text"
              value={formData.specialOffer}
              onChange={(e) => setFormData({ ...formData, specialOffer: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Free Modular Kitchen, 2 Free EV Charging points, Zero Stamp Duty"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Management Approval Status</label>
              <select
                value={formData.managementApproval}
                onChange={(e) => setFormData({ ...formData, managementApproval: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Pending Approval">Pending Approval</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Lead Executive</label>
              <input
                type="text"
                value={formData.handledBy}
                onChange={(e) => setFormData({ ...formData, handledBy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingNeg(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingNeg ? 'Update Proposal' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingNeg && (
        <Modal
          isOpen={true}
          onClose={() => setViewingNeg(null)}
          title={`Negotiation Record: ${viewingNeg.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Proposal Reference</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingNeg.id}</div>
              </div>
              <Badge variant={getApprovalBadgeVariant(viewingNeg.managementApproval)}>
                {viewingNeg.managementApproval}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingNeg.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Selected Unit</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingNeg.unitNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">List Price</span>
                <p className="font-semibold text-slate-700 mt-0.5">${Number(viewingNeg.basePrice).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Agreed / Offered Price</span>
                <p className="font-bold text-emerald-700 mt-0.5">${Number(viewingNeg.offeredPrice).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Discount</span>
                <p className="font-bold text-rose-600 mt-0.5">{viewingNeg.discount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Executive</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingNeg.handledBy}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500">Value-Added Perks & Special Offers</span>
              <p className="text-slate-800 mt-1 font-semibold">{viewingNeg.specialOffer || 'None'}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingNeg(null)}
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
        title="Delete Negotiation Proposal"
        message="Are you sure you want to remove this proposal?"
      />
    </div>
  );
};

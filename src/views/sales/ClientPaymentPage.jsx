import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, DollarSign, Receipt, CreditCard,
  Calendar, CheckCircle2, Clock, AlertTriangle, Building, User
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const ClientPaymentPage = () => {
  const { clientPayments, addClientPayment, updateClientPayment, deleteClientPayment } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    totalCost: 350000,
    installmentType: 'Booking Amount',
    paidAmount: 35000,
    pendingAmount: 315000,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Wire Transfer (Ref: WIRE-88912)',
    paymentStatus: 'Cleared'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please specify Customer Name.', 'error');
      return;
    }

    const paid = Number(formData.paidAmount) || 0;
    const total = Number(formData.totalCost) || 0;
    const pending = Math.max(0, total - paid);

    const payload = {
      ...formData,
      paidAmount: paid,
      totalCost: total,
      pendingAmount: pending
    };

    if (editingPayment) {
      updateClientPayment(editingPayment.id, payload);
      addToast(`Payment receipt ${editingPayment.receiptNo || editingPayment.id} updated.`, 'success');
      setEditingPayment(null);
    } else {
      const created = addClientPayment(payload);
      addToast(`Payment recorded for ${created.customer} ($${paid.toLocaleString()}).`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      totalCost: 350000,
      installmentType: 'Booking Amount',
      paidAmount: 35000,
      pendingAmount: 315000,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Wire Transfer (Ref: WIRE-88912)',
      paymentStatus: 'Cleared'
    });
  };

  const openEditModal = (item) => {
    setEditingPayment(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteClientPayment(deletingId);
      addToast('Payment record deleted.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Cleared':
        return 'success';
      case 'Due':
        return 'warning';
      case 'Overdue':
        return 'danger';
      default:
        return 'brand';
    }
  };

  const columns = [
    {
      header: 'Receipt No',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.receiptNo || row.id}</div>
          <div className="text-[10px] text-slate-400">{row.paymentDate}</div>
        </div>
      )
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
      header: 'Installment Stage',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.installmentType}
        </span>
      )
    },
    {
      header: 'Paid Amount',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-emerald-700">
            ${(Number(row.paidAmount) || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{row.paymentMode}</div>
        </div>
      )
    },
    {
      header: 'Pending Balance',
      render: (row) => (
        <div>
          <div className="text-xs font-bold text-amber-700">
            ${Number(row.pendingAmount || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Due: {row.dueDate}</div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.paymentStatus)}>
          {row.paymentStatus}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingPayment(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Receipt"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Payment"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Payment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalPaid = clientPayments.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);
  const totalPending = clientPayments.reduce((acc, curr) => acc + (Number(curr.pendingAmount) || 0), 0);
  const clearedCount = clientPayments.filter(p => p.paymentStatus === 'Cleared').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Payment & Milestone Collections"
        description="Track staged payments across Booking, Agreement, Slab Completion, and Final Handover."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Client Payment', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                totalCost: 350000,
                installmentType: 'Booking Amount',
                paidAmount: 35000,
                pendingAmount: 315000,
                dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMode: 'Wire Transfer (Ref: WIRE-88912)',
                paymentStatus: 'Cleared'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Record Client Payment
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Transactions</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{clientPayments.length} Receipts</div>
          <div className="text-[11px] text-slate-400 mt-1">Processed payment installments</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total Collected</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">${totalPaid.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Cleared customer funds</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Upcoming / Pending Due</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">${totalPending.toLocaleString()}</div>
          <div className="text-[11px] text-amber-600 mt-1">Scheduled milestones</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Cleared Receipts</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{clearedCount}</div>
          <div className="text-[11px] text-blue-600 mt-1">Bank reconciliation verified</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Client Payment Registry"
        subtitle="Staged milestone installment entries and bank voucher details"
        data={clientPayments}
        columns={columns}
        searchPlaceholder="Search customer, receipt number, or unit..."
        filterKey="installmentType"
        filterOptions={[
          { label: 'All Installments', value: 'ALL' },
          { label: 'Booking Amount', value: 'Booking Amount' },
          { label: 'Agreement Payment', value: 'Agreement Payment' },
          { label: 'Slab Payment', value: 'Slab Payment' },
          { label: 'Final Payment', value: 'Final Payment' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingPayment}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? `Edit Payment: ${editingPayment.receiptNo || editingPayment.id}` : 'Record Client Payment'}
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
                placeholder="e.g. Victoria Sterling"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Number</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 1201"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Installment Stage</label>
              <select
                value={formData.installmentType}
                onChange={(e) => setFormData({ ...formData, installmentType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Booking Amount">Booking Amount (Token)</option>
                <option value="Agreement Payment">Agreement Payment (10-20%)</option>
                <option value="Slab Payment">Slab Payment (Construction Milestone)</option>
                <option value="Final Payment">Final Payment (Possession)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Unit Cost ($)</label>
              <input
                type="number"
                value={formData.totalCost}
                onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Paid Amount ($)</label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Date</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Next Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Mode / Reference</label>
              <input
                type="text"
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. RTGS Transfer / Demand Draft"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Cleared">Cleared</option>
                <option value="Due">Due</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingPayment(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingPayment ? 'Update Receipt' : 'Generate Payment Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingPayment && (
        <Modal
          isOpen={true}
          onClose={() => setViewingPayment(null)}
          title={`Payment Receipt: ${viewingPayment.receiptNo || viewingPayment.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Official Receipt #</span>
                <div className="font-mono text-sm font-extrabold text-brand-700">{viewingPayment.receiptNo || viewingPayment.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingPayment.paymentStatus)}>
                {viewingPayment.paymentStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Client / Payer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingPayment.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Unit Number</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingPayment.unitNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Installment Category</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingPayment.installmentType}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Amount Received</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(viewingPayment.paidAmount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Payment Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingPayment.paymentDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Remaining Balance</span>
                <p className="font-bold text-amber-700 mt-0.5">${Number(viewingPayment.pendingAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Banking Transaction Reference</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewingPayment.paymentMode}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
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
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment receipt record?"
      />
    </div>
  );
};

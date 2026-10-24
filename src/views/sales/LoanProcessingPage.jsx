import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, Landmark, CheckCircle2, Clock,
  AlertCircle, XCircle, DollarSign, Percent, Calendar
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const LoanProcessingPage = () => {
  const { loanProcessings, addLoanProcessing, updateLoanProcessing, deleteLoanProcessing } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [viewingLoan, setViewingLoan] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    bankName: 'HDFC Bank Home Loans',
    loanAmount: 280000,
    interestRate: '8.40%',
    tenureYears: 20,
    emi: 2412,
    sanctionDate: new Date().toISOString().split('T')[0],
    status: 'Loan Applied',
    executive: 'Sarah Jenkins'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please enter Customer Name.', 'error');
      return;
    }

    const payload = {
      ...formData,
      loanAmount: Number(formData.loanAmount) || 0,
      emi: Number(formData.emi) || 0,
      tenureYears: Number(formData.tenureYears) || 20
    };

    if (editingLoan) {
      updateLoanProcessing(editingLoan.id, payload);
      addToast(`Loan file ${editingLoan.id} updated.`, 'success');
      setEditingLoan(null);
    } else {
      const created = addLoanProcessing(payload);
      addToast(`Loan application filed for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      bankName: 'HDFC Bank Home Loans',
      loanAmount: 280000,
      interestRate: '8.40%',
      tenureYears: 20,
      emi: 2412,
      sanctionDate: new Date().toISOString().split('T')[0],
      status: 'Loan Applied',
      executive: 'Sarah Jenkins'
    });
  };

  const openEditModal = (item) => {
    setEditingLoan(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteLoanProcessing(deletingId);
      addToast('Loan record deleted.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Disbursed':
      case 'Approved':
        return 'success';
      case 'Bank Verification':
      case 'Loan Applied':
        return 'brand';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const columns = [
    {
      header: 'Loan ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-700',
      width: '95px'
    },
    {
      header: 'Customer & Unit',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500 font-semibold">{row.unitNumber}</div>
        </div>
      )
    },
    {
      header: 'Banking Partner',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-800">{row.bankName}</span>
        </div>
      )
    },
    {
      header: 'Loan Terms',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-emerald-700">
            ${(Number(row.loanAmount) || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">
            {row.interestRate} • {row.tenureYears} Yrs (EMI: ${(Number(row.emi) || 0).toLocaleString()}/mo)
          </div>
        </div>
      )
    },
    {
      header: 'Sanction / Filing Date',
      accessor: 'sanctionDate',
      cellClassName: 'text-xs text-slate-600'
    },
    {
      header: 'Loan Status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingLoan(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Sanction Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Loan File"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Loan File"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalSanctioned = loanProcessings.reduce((sum, l) => sum + (Number(l.loanAmount) || 0), 0);
  const disbursedCount = loanProcessings.filter(l => l.status === 'Disbursed').length;
  const approvedCount = loanProcessings.filter(l => l.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Loan Processing & Sanctions"
        description="Facilitate institutional bank tie-ups, loan approvals, eligibility checks, and disbursement tracking."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Loan Processing', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                bankName: 'HDFC Bank Home Loans',
                loanAmount: 280000,
                interestRate: '8.40%',
                tenureYears: 20,
                emi: 2412,
                sanctionDate: new Date().toISOString().split('T')[0],
                status: 'Loan Applied',
                executive: 'Sarah Jenkins'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            File Loan Application
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Applied Loans</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{loanProcessings.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Bank files under management</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Sanctioned & Disbursed</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{disbursedCount + approvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Clear mortgage sanctions</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Total Loan Volume</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">${(totalSanctioned / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-blue-600 mt-1">Institutional funding value</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">In Verification</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {loanProcessings.filter(l => l.status === 'Bank Verification' || l.status === 'Loan Applied').length}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Bank credit appraisal phase</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Institutional Loan Portfolio"
        subtitle="Track mortgage sanctions across partner banks"
        data={loanProcessings}
        columns={columns}
        searchPlaceholder="Search customer, bank name, or unit..."
        filterKey="status"
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Loan Applied', value: 'Loan Applied' },
          { label: 'Bank Verification', value: 'Bank Verification' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Disbursed', value: 'Disbursed' },
          { label: 'Rejected', value: 'Rejected' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingLoan}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLoan(null);
        }}
        title={editingLoan ? `Edit Loan File: ${editingLoan.customer}` : 'File Loan Application'}
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
                placeholder="e.g. Dr. Aris Thorne"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Number</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. HDFC Bank, State Bank, Chase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Loan Amount ($)</label>
              <input
                type="number"
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Interest Rate</label>
              <input
                type="text"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 8.40%"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tenure (Years)</label>
              <input
                type="number"
                value={formData.tenureYears}
                onChange={(e) => setFormData({ ...formData, tenureYears: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Monthly EMI ($)</label>
              <input
                type="number"
                value={formData.emi}
                onChange={(e) => setFormData({ ...formData, emi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Loan Applied">Loan Applied</option>
                <option value="Bank Verification">Bank Verification</option>
                <option value="Approved">Approved</option>
                <option value="Disbursed">Disbursed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Executive In-Charge</label>
              <input
                type="text"
                value={formData.executive}
                onChange={(e) => setFormData({ ...formData, executive: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingLoan(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingLoan ? 'Update Loan File' : 'Save Loan Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingLoan && (
        <Modal
          isOpen={true}
          onClose={() => setViewingLoan(null)}
          title={`Loan Sanction Memo: ${viewingLoan.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Application File ID</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingLoan.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingLoan.status)}>
                {viewingLoan.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Borrower</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingLoan.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Mortgaged Unit</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingLoan.unitNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Financing Bank</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingLoan.bankName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sanctioned Amount</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(viewingLoan.loanAmount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tenure & Rate</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingLoan.tenureYears} Years @ {viewingLoan.interestRate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Monthly EMI</span>
                <p className="font-bold text-slate-900 mt-0.5">${Number(viewingLoan.emi).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingLoan(null)}
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
        title="Delete Loan Application"
        message="Are you sure you want to delete this loan application record?"
      />
    </div>
  );
};

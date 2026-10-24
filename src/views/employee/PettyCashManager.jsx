import React, { useState } from 'react';
import { PlusCircle, Receipt, DollarSign, Tag, CheckCircle2, Eye } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

const PETTY_EXPENSE_CATEGORIES = [
  'Office Expenses',
  'Tea & Snacks',
  'Fuel',
  'Vehicle Maintenance',
  'Courier',
  'Stationery',
  'Electricity',
  'Internet',
  'Marketing',
  'Site Expenses',
  'Labour Payment',
  'Miscellaneous'
];

export const PettyCashManager = ({ initialMode = 'display' }) => {
  const { pettyCash, addPettyCash } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialMode); // 'entry' or 'display'
  const [viewingVoucher, setViewingVoucher] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expenseCategory: 'Site Expenses',
    description: '',
    employeeName: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
    amount: '',
    paymentMode: 'Cash',
    requestedBy: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
    approvedBy: 'Alexander Wright',
    remarks: 'Disbursed from site petty cash float',
    status: 'Approved'
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) {
      addToast('Please enter expense description and amount.', 'error');
      return;
    }

    const amt = Number(formData.amount) || 0;
    const created = addPettyCash({
      ...formData,
      amount: amt
    });

    addToast(`Petty expense voucher ${created.voucherNumber || created.id} recorded ($${amt}).`, 'success');
    setActiveTab('display');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      expenseCategory: 'Site Expenses',
      description: '',
      employeeName: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
      amount: '',
      paymentMode: 'Cash',
      requestedBy: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
      approvedBy: 'Alexander Wright',
      remarks: 'Disbursed from site petty cash float',
      status: 'Approved'
    });
  };

  const columns = [
    {
      header: 'Voucher No',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.voucherNumber || row.receiptNo || row.id}</div>
          <div className="text-[10px] text-slate-400">{row.date}</div>
        </div>
      ),
      width: '130px'
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.expenseCategory || row.category || 'Site Expenses'}
        </span>
      )
    },
    {
      header: 'Description',
      render: (row) => (
        <div className="max-w-[240px] truncate text-xs text-slate-800 font-medium">
          {row.description || row.expenseType}
        </div>
      )
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className="text-xs font-extrabold text-rose-700">
          -${Number(row.amount || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Disbursed To',
      render: (row) => (
        <div className="text-xs text-slate-700">
          {row.employeeName || row.spentBy}
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setViewingVoucher(row)}
          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
          title="View Voucher"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeTab === 'entry' ? 'Petty Cash Entry' : 'Petty Cash Display'}
        description="Daily operational cash disbursements across 12 standard operating expense classifications."
        breadcrumbs={[
          { label: 'Expenses & Payments' },
          { label: activeTab === 'entry' ? 'Petty Cash Entry' : 'Petty Cash Display', active: true }
        ]}
        actions={
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'entry' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cash Entry
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'display' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Show Petty Cash
            </button>
          </div>
        }
      />

      {activeTab === 'entry' ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-600" />
            New Petty Cash Disbursement Voucher
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Expense Category *</label>
                <select
                  value={formData.expenseCategory}
                  onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                >
                  {PETTY_EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description / Particulars *</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Refreshments for client visit / Courier of deeds"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="Cash">Cash (Float)</option>
                  <option value="Digital UPI">Digital UPI</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
              >
                Log Petty Expense
              </button>
            </div>
          </form>
        </div>
      ) : (
        <DataTable
          title="Petty Cash Outlay Log"
          subtitle="Chronological list of all logged cash payments"
          data={pettyCash}
          columns={columns}
          searchPlaceholder="Search voucher or description..."
        />
      )}

      {/* View Modal */}
      {viewingVoucher && (
        <Modal
          isOpen={true}
          onClose={() => setViewingVoucher(null)}
          title={`Petty Cash Voucher: ${viewingVoucher.voucherNumber || viewingVoucher.receiptNo}`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
              <p className="font-bold text-slate-900 mt-0.5">{viewingVoucher.expenseCategory || viewingVoucher.category}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Description</span>
              <p className="font-semibold text-slate-800 mt-0.5">{viewingVoucher.description || viewingVoucher.expenseType}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Amount</span>
                <p className="font-extrabold text-rose-700 mt-0.5">${Number(viewingVoucher.amount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Disbursed To</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingVoucher.employeeName || viewingVoucher.spentBy}</p>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingVoucher(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
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

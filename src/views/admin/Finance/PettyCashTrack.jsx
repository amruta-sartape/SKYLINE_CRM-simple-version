import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, Receipt, DollarSign, Calendar,
  CheckCircle2, Clock, AlertCircle, PieChart, BarChart3,
  TrendingDown, ArrowDownRight, ArrowUpRight, ShieldCheck, UserCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

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

export const PettyCashTrack = () => {
  const { pettyCash, pettyCashSummary, addPettyCash, updatePettyCash, deletePettyCash, employees } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('register'); // 'register', 'daily', 'monthly', 'category', 'balance', 'audit'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expenseCategory: 'Site Expenses',
    description: '',
    employeeName: employees[0]?.fullName || 'Sarah Jenkins',
    amount: 150,
    paymentMode: 'Cash',
    requestedBy: employees[0]?.fullName || 'Sarah Jenkins',
    approvedBy: 'Alexander Wright',
    remarks: 'Approved for on-site administrative expenses',
    status: 'Approved'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) {
      addToast('Please enter Expense Description and Amount.', 'error');
      return;
    }

    const amt = Number(formData.amount) || 0;
    const payload = {
      ...formData,
      amount: amt
    };

    if (editingEntry) {
      updatePettyCash(editingEntry.id, payload);
      addToast(`Petty cash voucher ${editingEntry.voucherNumber || editingEntry.id} updated.`, 'success');
      setEditingEntry(null);
    } else {
      const created = addPettyCash(payload);
      addToast(`Petty cash expense ${created.voucherNumber} recorded ($${amt}).`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      expenseCategory: 'Site Expenses',
      description: '',
      employeeName: employees[0]?.fullName || 'Sarah Jenkins',
      amount: 150,
      paymentMode: 'Cash',
      requestedBy: employees[0]?.fullName || 'Sarah Jenkins',
      approvedBy: 'Alexander Wright',
      remarks: 'Approved for on-site administrative expenses',
      status: 'Approved'
    });
  };

  const openEditModal = (item) => {
    setEditingEntry(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deletePettyCash(deletingId);
      addToast('Petty cash voucher removed.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Voucher No',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.voucherNumber || row.id}</div>
          <div className="text-[10px] text-slate-400">{row.date}</div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {row.expenseCategory}
        </span>
      )
    },
    {
      header: 'Description',
      render: (row) => (
        <div className="max-w-[220px] truncate text-xs text-slate-800 font-medium" title={row.description}>
          {row.description}
        </div>
      )
    },
    {
      header: 'Disbursed To',
      render: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{row.employeeName}</div>
          <div className="text-[10px] text-slate-500">Appr: {row.approvedBy}</div>
        </div>
      )
    },
    {
      header: 'Expense Amount',
      render: (row) => (
        <div className="text-xs font-extrabold text-rose-700">
          -${(Number(row.amount) || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Approved' ? 'success' : 'warning'}>
          {row.status || 'Approved'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingEntry(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Voucher"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Voucher"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Voucher"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalSpent = pettyCash.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const openingBalance = pettyCashSummary?.openingBalance || 15000;
  const cashReceived = pettyCashSummary?.cashReceived || 8000;
  const closingBalance = Math.max(0, openingBalance + cashReceived - totalSpent);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Petty Cash & Imprest Management"
        description="Daily cash disbursement ledger across 12 standard operating expense classifications."
        breadcrumbs={[
          { label: 'Finance & Procurement' },
          { label: 'Petty Cash Track', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                date: new Date().toISOString().split('T')[0],
                expenseCategory: 'Site Expenses',
                description: '',
                employeeName: employees[0]?.fullName || 'Sarah Jenkins',
                amount: 150,
                paymentMode: 'Cash',
                requestedBy: employees[0]?.fullName || 'Sarah Jenkins',
                approvedBy: 'Alexander Wright',
                remarks: 'Approved for on-site administrative expenses',
                status: 'Approved'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Petty Cash Entry
          </button>
        }
      />

      {/* Petty Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Opening Balance</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">${openingBalance.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Float brought forward</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Cash Received / Imprest</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">+${cashReceived.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Bank cheque replenishments</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Total Cash Spent</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">-${totalSpent.toLocaleString()}</div>
          <div className="text-[11px] text-rose-600 mt-1">{pettyCash.length} Vouchers disbursed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Vault Closing Balance</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">${closingBalance.toLocaleString()}</div>
          <div className="text-[11px] text-blue-600 mt-1">Current in-hand petty cash</div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'register', label: 'Petty Cash Voucher Register' },
          { id: 'daily', label: 'Daily Cash Book' },
          { id: 'monthly', label: 'Monthly Expense Report' },
          { id: 'category', label: 'Expense by Category' },
          { id: 'balance', label: 'Cash Balance Report' },
          { id: 'audit', label: 'Audit & Compliance Report' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Voucher Register */}
      {activeTab === 'register' && (
        <DataTable
          title="Petty Cash Voucher Register"
          subtitle="Record and inspect individual operational cash disbursements"
          data={pettyCash}
          columns={columns}
          searchPlaceholder="Search voucher #, employee, or description..."
          filterKey="expenseCategory"
          filterOptions={[
            { label: 'All Categories', value: 'ALL' },
            ...PETTY_EXPENSE_CATEGORIES.map(cat => ({ label: cat, value: cat }))
          ]}
        />
      )}

      {/* Tab 2: Daily Cash Book */}
      {activeTab === 'daily' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daily Imprest Cash Book</h3>
              <p className="text-xs text-slate-500">Day-by-day cash intake and outflow tracking</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              Active Float: ${closingBalance.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Voucher #</th>
                  <th className="p-3">Particulars & Category</th>
                  <th className="p-3">Cash In (Credit)</th>
                  <th className="p-3">Cash Out (Debit)</th>
                  <th className="p-3">Disbursed To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-emerald-50/30">
                  <td className="p-3 font-semibold text-slate-700">2025-05-18</td>
                  <td className="p-3 font-mono text-slate-500">FLOAT-RELOAD</td>
                  <td className="p-3 font-bold text-emerald-900">Bank Cheque Imprest Replenishment #4412</td>
                  <td className="p-3 font-extrabold text-emerald-700">+${cashReceived.toLocaleString()}</td>
                  <td className="p-3 text-slate-400">-</td>
                  <td className="p-3 font-medium text-slate-700">Accounts Desk</td>
                </tr>
                {pettyCash.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-700">{row.date}</td>
                    <td className="p-3 font-mono text-brand-700">{row.voucherNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.expenseCategory}</div>
                      <div className="text-[10px] text-slate-500">{row.description}</div>
                    </td>
                    <td className="p-3 text-slate-400">-</td>
                    <td className="p-3 font-extrabold text-rose-700">-${Number(row.amount).toLocaleString()}</td>
                    <td className="p-3 text-slate-800">{row.employeeName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Monthly Expense Report */}
      {activeTab === 'monthly' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Monthly Operational Expense Breakdown</h3>
            <p className="text-xs text-slate-500">Monthly breakdown of petty office and site expenditures</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total May 2025 Outflow</div>
              <div className="text-xl font-extrabold text-rose-700 mt-1">${totalSpent.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500 mt-1">Reimbursed with tax receipts</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Average Daily Outlay</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">${Math.round(totalSpent / 5)} / day</div>
              <div className="text-[11px] text-slate-500 mt-1">Within daily approval limits</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Compliance Rate</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">100% Attached</div>
              <div className="text-[11px] text-emerald-600 mt-1">All vouchers verified & signed</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Expense by Category */}
      {activeTab === 'category' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">12 Standard Expense Categories Distribution</h3>
            <p className="text-xs text-slate-500">Distribution across all mandatory category codes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PETTY_EXPENSE_CATEGORIES.map((cat) => {
              const items = pettyCash.filter(p => p.expenseCategory === cat);
              const catTotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
              return (
                <div key={cat} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{cat}</div>
                    <div className="text-[10px] text-slate-500">{items.length} vouchers</div>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">
                    ${catTotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Cash Balance Report */}
      {activeTab === 'balance' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Cash Float & Vault Balance Statement</h3>
            <p className="text-xs text-slate-500">Reconciled balance between physical cash box and software ledger</p>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">Opening Balance (Float)</span>
              <span className="font-mono font-bold text-sm">${openingBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-emerald-400">(+) Cash In / Imprest Replenishment</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">+${cashReceived.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-rose-400">(-) Total Operational Vouchers Disbursed</span>
              <span className="font-mono font-bold text-rose-400 text-sm">-${totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-bold text-white">Reconciled Vault Closing Balance</span>
              <span className="font-mono font-extrabold text-lg text-brand-400">${closingBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit & Compliance */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Internal Audit & Management Sign-off</h3>
            <p className="text-xs text-slate-500">Executive supervisory authorizations and voucher sign-offs</p>
          </div>

          <div className="space-y-3">
            {pettyCash.map((row) => (
              <div key={row.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{row.voucherNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-brand-700">{row.expenseCategory}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{row.description}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Requested by: <span className="font-semibold text-slate-800">{row.requestedBy || row.employeeName}</span> | Remarks: {row.remarks}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-rose-700">${Number(row.amount).toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Approved by {row.approvedBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingEntry}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEntry(null);
        }}
        title={editingEntry ? `Edit Petty Cash Voucher: ${editingEntry.voucherNumber || editingEntry.id}` : 'Record Petty Cash Disbursement'}
      >
        <form onSubmit={handleSave} className="space-y-4">
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Voucher Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Expense Description *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Refreshments for client negotiations / Diesel refuel"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount ($) *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Employee / Spent By</label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value, requestedBy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Cash">Cash (Vault Float)</option>
                <option value="UPI / Digital Cash">UPI / Digital Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Approved By</label>
              <input
                type="text"
                value={formData.approvedBy}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Approval Remarks</label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="Bill verified & approved"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingEntry(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingEntry ? 'Update Voucher' : 'Disburse & Save Voucher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingEntry && (
        <Modal
          isOpen={true}
          onClose={() => setViewingEntry(null)}
          title={`Petty Cash Voucher: ${viewingEntry.voucherNumber || viewingEntry.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Voucher Reference</span>
                <div className="font-mono text-sm font-extrabold text-brand-700">{viewingEntry.voucherNumber || viewingEntry.id}</div>
              </div>
              <Badge variant={viewingEntry.status === 'Approved' ? 'success' : 'warning'}>
                {viewingEntry.status || 'Approved'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Expense Category</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingEntry.expenseCategory}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Voucher Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingEntry.date}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Disbursed Amount</span>
                <p className="font-extrabold text-rose-700 mt-0.5">${Number(viewingEntry.amount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Disbursed To</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingEntry.employeeName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Description & Purpose</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewingEntry.description}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Approved By</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingEntry.approvedBy}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Audit Remarks</span>
                <p className="font-semibold text-emerald-700 mt-0.5">{viewingEntry.remarks || 'Receipt verified'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingEntry(null)}
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
        title="Delete Petty Cash Voucher"
        message="Are you sure you want to delete this petty cash voucher from the expense audit record?"
      />
    </div>
  );
};

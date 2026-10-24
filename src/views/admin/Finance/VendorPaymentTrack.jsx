import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, CreditCard, DollarSign, Calendar,
  Building, CheckCircle2, Clock, AlertTriangle, XCircle, FileSpreadsheet,
  ArrowUpRight, Receipt, PieChart
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const VendorPaymentTrack = () => {
  const { vendorPayments, addVendorPayment, updateVendorPayment, deleteVendorPayment, vendors } = useData();
  const { addToast } = useToast();

  const [activeReportTab, setActiveReportTab] = useState('register'); // 'register', 'ledger', 'outstanding', 'monthly', 'purchase'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    billAmount: 25000,
    gst: '$4,500 (18%)',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank RTGS',
    utrNumber: '',
    bank: 'Chase Bank Corporate',
    paidAmount: 25000,
    balanceAmount: 0,
    paymentStatus: 'Fully Paid'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.invoiceNumber.trim() || !formData.vendorName) {
      addToast('Please specify Invoice Number and Vendor Name.', 'error');
      return;
    }

    const bill = Number(formData.billAmount) || 0;
    const paid = Number(formData.paidAmount) || 0;
    const balance = Math.max(0, bill - paid);

    let status = formData.paymentStatus;
    if (paid >= bill && bill > 0) {
      status = 'Fully Paid';
    } else if (paid > 0 && paid < bill) {
      status = 'Partially Paid';
    } else if (paid === 0) {
      status = 'Pending';
    }

    const payload = {
      ...formData,
      billAmount: bill,
      paidAmount: paid,
      balanceAmount: balance,
      paymentStatus: status
    };

    if (editingBill) {
      updateVendorPayment(editingBill.id, payload);
      addToast(`Vendor invoice ${editingBill.invoiceNumber} updated.`, 'success');
      setEditingBill(null);
    } else {
      const created = addVendorPayment(payload);
      addToast(`Vendor bill ${created.invoiceNumber} recorded for ${created.vendorName}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      billAmount: 25000,
      gst: '$4,500 (18%)',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank RTGS',
      utrNumber: '',
      bank: 'Chase Bank Corporate',
      paidAmount: 25000,
      balanceAmount: 0,
      paymentStatus: 'Fully Paid'
    });
  };

  const openEditModal = (item) => {
    setEditingBill(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteVendorPayment(deletingId);
      addToast('Vendor payment record deleted.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Fully Paid':
        return 'success';
      case 'Partially Paid':
        return 'brand';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const columns = [
    {
      header: 'Invoice No',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.invoiceNumber || row.id}</div>
          <div className="text-[10px] text-slate-400">Date: {row.invoiceDate}</div>
        </div>
      )
    },
    {
      header: 'Vendor Name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {row.vendorName}
          </div>
          <div className="text-[10px] text-slate-400">Due: {row.dueDate}</div>
        </div>
      )
    },
    {
      header: 'Bill Amount & GST',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-slate-900">${(Number(row.billAmount) || 0).toLocaleString()}</div>
          <div className="text-[10px] text-slate-400">GST: {row.gst}</div>
        </div>
      )
    },
    {
      header: 'Paid Details',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-emerald-700">${Number(row.paidAmount || 0).toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">{row.paymentMode} ({row.bank})</div>
        </div>
      )
    },
    {
      header: 'Balance Due',
      render: (row) => {
        const bal = Number(row.balanceAmount || 0);
        return (
          <span className={`text-xs font-bold ${bal === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            ${bal.toLocaleString()}
          </span>
        );
      }
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
            onClick={() => setViewingBill(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Voucher"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Payment Entry"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Summary figures
  const totalBillsCount = vendorPayments.length;
  const totalBillAmount = vendorPayments.reduce((acc, curr) => acc + (Number(curr.billAmount) || 0), 0);
  const totalPaidAmount = vendorPayments.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);
  const totalPendingAmount = vendorPayments.reduce((acc, curr) => acc + (Number(curr.balanceAmount) || 0), 0);
  const partiallyPaidCount = vendorPayments.filter(v => v.paymentStatus === 'Partially Paid').length;
  const overdueCount = vendorPayments.filter(v => v.paymentStatus === 'Overdue').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Payment & Invoice Track"
        description="Vendor bill processing, tax deductions, UTR disbursements, and outstanding liability ledger."
        breadcrumbs={[
          { label: 'Finance & Procurement' },
          { label: 'Vendor Payment Track', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
                invoiceNumber: '',
                invoiceDate: new Date().toISOString().split('T')[0],
                billAmount: 25000,
                gst: '$4,500 (18%)',
                dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMode: 'Bank RTGS',
                utrNumber: '',
                bank: 'Chase Bank Corporate',
                paidAmount: 25000,
                balanceAmount: 0,
                paymentStatus: 'Fully Paid'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Record Vendor Bill
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Vendor Bills</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">${totalBillAmount.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">{totalBillsCount} Invoices catalogued</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Amount</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">${totalPendingAmount.toLocaleString()}</div>
          <div className="text-[11px] text-amber-600 mt-1">Outstanding vendor liability</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Partially Paid</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{partiallyPaidCount} Invoices</div>
          <div className="text-[11px] text-blue-600 mt-1">Staged milestone releases</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Overdue Invoices</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{overdueCount} Invoices</div>
          <div className="text-[11px] text-rose-600 mt-1">Past credit period</div>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'register', label: 'Vendor Bills Register' },
          { id: 'ledger', label: 'Vendor Ledger' },
          { id: 'outstanding', label: 'Outstanding Bills' },
          { id: 'monthly', label: 'Monthly Vendor Payments' },
          { id: 'purchase', label: 'Purchase Summary' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeReportTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Active View / Report */}
      {activeReportTab === 'register' && (
        <DataTable
          title="Vendor Invoices & Payment Ledger"
          subtitle="Real-time tracking of contractor claims, GST components, and bank UTRs"
          data={vendorPayments}
          columns={columns}
          searchPlaceholder="Search invoice number, vendor, or UTR..."
          filterKey="paymentStatus"
          filterOptions={[
            { label: 'All Statuses', value: 'ALL' },
            { label: 'Fully Paid', value: 'Fully Paid' },
            { label: 'Partially Paid', value: 'Partially Paid' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Overdue', value: 'Overdue' }
          ]}
        />
      )}

      {activeReportTab === 'ledger' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Vendor Account Ledger Statement</h3>
              <p className="text-xs text-slate-500">Consolidated ledger breakdown by contractor account</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              FY 2025-26
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {vendors.map((v) => {
              const vendorBills = vendorPayments.filter(vp => vp.vendorName === v.vendorName);
              const totalBilled = vendorBills.reduce((s, b) => s + (Number(b.billAmount) || 0), 0);
              const totalPaid = vendorBills.reduce((s, b) => s + (Number(b.paidAmount) || 0), 0);
              const balance = Math.max(0, totalBilled - totalPaid);

              return (
                <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80">
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{v.vendorName}</span>
                      <span className="text-[10px] font-semibold text-slate-500">({v.category})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      GSTIN: {v.gstNumber} • A/C: {v.accountNo} ({v.bankName})
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Billed</div>
                      <div className="font-bold text-slate-900">${totalBilled.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-emerald-600">Paid Amount</div>
                      <div className="font-bold text-emerald-700">${totalPaid.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-amber-600">Balance Payable</div>
                      <div className="font-extrabold text-amber-700">${balance.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeReportTab === 'outstanding' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Aging & Outstanding Liabilities</h3>
              <p className="text-xs text-slate-500">Unsettled contractor invoices categorized by due date</p>
            </div>
            <div className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
              Total Outstanding: ${totalPendingAmount.toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Total Bill</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Pending Balance</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorPayments.filter(v => (v.balanceAmount || 0) > 0).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.vendorName}</td>
                    <td className="p-3 font-mono text-brand-700">{row.invoiceNumber}</td>
                    <td className="p-3 text-slate-600">{row.dueDate}</td>
                    <td className="p-3 text-slate-800 font-semibold">${Number(row.billAmount).toLocaleString()}</td>
                    <td className="p-3 text-emerald-700 font-semibold">${Number(row.paidAmount || 0).toLocaleString()}</td>
                    <td className="p-3 font-extrabold text-amber-700">${Number(row.balanceAmount).toLocaleString()}</td>
                    <td className="p-3"><Badge variant={getStatusBadgeVariant(row.paymentStatus)}>{row.paymentStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'monthly' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Monthly Vendor Disbursement Summary</h3>
            <p className="text-xs text-slate-500">Aggregated cash outflows toward civil contractors and material vendors</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">May 2025 Disbursements</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">${totalPaidAmount.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500 mt-1">Cleared across 3 bank batches</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">June 2025 Projected Due</div>
              <div className="text-xl font-extrabold text-amber-700 mt-1">${totalPendingAmount.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500 mt-1">Estimated contract releases</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Fiscal Outflow</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">${(totalBillAmount).toLocaleString()}</div>
              <div className="text-[11px] text-slate-500 mt-1">Combined vendor contracts</div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'purchase' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Purchase Summary by Contractor Category</h3>
            <p className="text-xs text-slate-500">Expenditure allocation across civil, material, elevators, and consultants</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-xl">
              <div className="text-xs font-bold text-brand-900">Material & Structural Steel</div>
              <div className="text-lg font-extrabold text-brand-700 mt-1">$50,150 (32.1%)</div>
              <div className="text-[11px] text-slate-600 mt-1">TMT Rebar Fe 500D steel supply</div>
            </div>
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <div className="text-xs font-bold text-indigo-900">Lift Installation & Vertical Transport</div>
              <div className="text-lg font-extrabold text-indigo-700 mt-1">$66,080 (42.3%)</div>
              <div className="text-[11px] text-slate-600 mt-1">Tower A gearless high-speed lifts</div>
            </div>
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <div className="text-xs font-bold text-emerald-900">Electrical Substation & Power Grid</div>
              <div className="text-lg font-extrabold text-emerald-700 mt-1">$25,488 (16.3%)</div>
              <div className="text-[11px] text-slate-600 mt-1">Armoured cabling & switchgears</div>
            </div>
            <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
              <div className="text-xs font-bold text-purple-900">Legal, Architectural & RERA Consultancy</div>
              <div className="text-lg font-extrabold text-purple-700 mt-1">$14,500 (9.3%)</div>
              <div className="text-[11px] text-slate-600 mt-1">Title verification and compliance</div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingBill}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBill(null);
        }}
        title={editingBill ? `Edit Vendor Bill: ${editingBill.invoiceNumber}` : 'Record Vendor Invoice'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendor *</label>
              <select
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.vendorName}>{v.vendorName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendor Invoice # *</label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none uppercase"
                placeholder="e.g. INV-TS-88491"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Invoice Date</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bill Amount ($)</label>
              <input
                type="number"
                value={formData.billAmount}
                onChange={(e) => {
                  const b = Number(e.target.value) || 0;
                  setFormData({ ...formData, billAmount: b, balanceAmount: Math.max(0, b - formData.paidAmount) });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GST Component</label>
              <input
                type="text"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. $4,500 (18%)"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Payment & UTR Settlement</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Paid Amount ($)</label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => {
                    const p = Number(e.target.value) || 0;
                    setFormData({ ...formData, paidAmount: p, balanceAmount: Math.max(0, formData.billAmount - p) });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Bank RTGS">Bank RTGS</option>
                  <option value="Bank NEFT">Bank NEFT</option>
                  <option value="Direct Wire Transfer">Direct Wire Transfer</option>
                  <option value="Corporate Cheque">Corporate Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">UTR / Ref Number</label>
                <input
                  type="text"
                  value={formData.utrNumber}
                  onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold font-mono uppercase"
                  placeholder="UTR99881234"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Disbursing Bank</label>
                <input
                  type="text"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingBill(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingBill ? 'Update Vendor Invoice' : 'Save Vendor Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingBill && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBill(null)}
          title={`Vendor Payment Voucher: ${viewingBill.invoiceNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Invoice Number</span>
                <div className="font-mono text-sm font-extrabold text-brand-700">{viewingBill.invoiceNumber}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingBill.paymentStatus)}>
                {viewingBill.paymentStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Vendor</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingBill.vendorName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Bill Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingBill.invoiceDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed Amount</span>
                <p className="font-extrabold text-slate-900 mt-0.5">${Number(viewingBill.billAmount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Disbursed</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(viewingBill.paidAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Remaining Balance</span>
                <p className="font-extrabold text-amber-700 mt-0.5">${Number(viewingBill.balanceAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">UTR Reference</span>
                <p className="font-mono font-semibold text-slate-800 mt-0.5">{viewingBill.utrNumber || 'Pending'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingBill(null)}
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
        title="Delete Vendor Invoice"
        message="Are you sure you want to remove this vendor payment record?"
      />
    </div>
  );
};

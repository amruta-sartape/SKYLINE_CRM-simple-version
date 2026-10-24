import React, { useState } from 'react';
import { Plus, CreditCard, DollarSign, Building, Eye, Edit, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const VendorPayment = () => {
  const { vendorPayments, addVendorPayment, vendors } = useData();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState(null);

  const [formData, setFormData] = useState({
    vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    billAmount: '',
    gst: '$1,800 (18%)',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank RTGS',
    utrNumber: '',
    bank: 'Chase Bank Corporate',
    paidAmount: '',
    paymentStatus: 'Pending'
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim() || !formData.billAmount) {
      addToast('Please enter Vendor and Bill Amount.', 'error');
      return;
    }
    const bill = Number(formData.billAmount) || 0;
    const paid = Number(formData.paidAmount) || 0;
    const balance = Math.max(0, bill - paid);

    let status = 'Pending';
    if (paid >= bill && bill > 0) status = 'Fully Paid';
    else if (paid > 0) status = 'Partially Paid';

    const created = addVendorPayment({
      ...formData,
      invoiceNumber: formData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
      billAmount: bill,
      paidAmount: paid,
      balanceAmount: balance,
      paymentStatus: status
    });

    addToast(`Payment voucher filed for ${created.vendorName} ($${bill.toLocaleString()}).`, 'success');
    setIsModalOpen(false);
    setFormData({
      vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      billAmount: '',
      gst: '$1,800 (18%)',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank RTGS',
      utrNumber: '',
      bank: 'Chase Bank Corporate',
      paidAmount: '',
      paymentStatus: 'Pending'
    });
  };

  const columns = [
    {
      header: 'Invoice #',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.invoiceNumber || row.billNo || row.id}</div>
          <div className="text-[10px] text-slate-400">{row.invoiceDate || row.paymentDate}</div>
        </div>
      )
    },
    {
      header: 'Vendor Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {row.vendorName}
          </div>
          <div className="text-[10px] text-slate-400">Due: {row.dueDate || '30 Days'}</div>
        </div>
      )
    },
    {
      header: 'Bill Amount',
      render: (row) => (
        <div className="text-xs font-extrabold text-slate-900">
          ${Number(row.billAmount || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Paid Amount',
      render: (row) => (
        <div className="text-xs font-extrabold text-emerald-700">
          ${Number(row.paidAmount || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Balance',
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
        <Badge variant={row.paymentStatus === 'Fully Paid' || row.status === 'Settled' ? 'success' : 'warning'}>
          {row.paymentStatus || row.status || 'Pending'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setViewingBill(row)}
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
        title="Vendor Payment Voucher Submission"
        description="Employee desk for contractor bill entries, GST claims, and payment voucher generation."
        breadcrumbs={[
          { label: 'Expenses & Payments' },
          { label: 'Vendor Payment', active: true }
        ]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            File Vendor Bill
          </button>
        }
      />

      <DataTable
        title="Contractor & Material Bills"
        subtitle="Manage supplier payment disbursements and invoice clearance"
        data={vendorPayments}
        columns={columns}
        searchPlaceholder="Search vendor name or invoice number..."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File Vendor Payment Claim"
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Invoice #</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none uppercase"
                placeholder="e.g. INV-2025-099"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bill Amount ($) *</label>
              <input
                type="number"
                required
                value={formData.billAmount}
                onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
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
                placeholder="0 if pending"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              Submit Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingBill && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBill(null)}
          title={`Vendor Bill: ${viewingBill.invoiceNumber || viewingBill.billNo}`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vendor</span>
              <p className="font-bold text-slate-900 mt-0.5">{viewingBill.vendorName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Bill Amount</span>
                <p className="font-extrabold text-slate-900 mt-0.5">${Number(viewingBill.billAmount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Paid Amount</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(viewingBill.paidAmount || 0).toLocaleString()}</p>
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
    </div>
  );
};

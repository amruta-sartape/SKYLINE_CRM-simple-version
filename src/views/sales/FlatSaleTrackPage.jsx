import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, Home, DollarSign, CheckCircle2, Clock,
  Receipt, Building2, UserCheck, TrendingUp
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FlatSaleTrackPage = () => {
  const { flatSales, addFlatSale, updateFlatSale, deleteFlatSale } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [viewingSale, setViewingSale] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    flatType: '2 BHK',
    floor: '4th Floor',
    projectName: 'Skyline Heights',
    saleAmount: 340000,
    receivedAmount: 200000,
    balanceDue: 140000,
    bookingDate: new Date().toISOString().split('T')[0],
    salesExecutive: 'Sarah Jenkins',
    saleStatus: 'In Process'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please enter Customer Name.', 'error');
      return;
    }

    const saleAmount = Number(formData.saleAmount) || 0;
    const receivedAmount = Number(formData.receivedAmount) || 0;
    const balanceDue = Math.max(0, saleAmount - receivedAmount);

    const payload = {
      ...formData,
      saleAmount,
      receivedAmount,
      balanceDue
    };

    if (editingSale) {
      updateFlatSale(editingSale.id, payload);
      addToast(`Flat sale ${editingSale.invoiceNo || editingSale.id} updated.`, 'success');
      setEditingSale(null);
    } else {
      const created = addFlatSale(payload);
      addToast(`Flat sale recorded for ${created.customer} (Unit: ${created.unitNumber}).`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      flatType: '2 BHK',
      floor: '4th Floor',
      projectName: 'Skyline Heights',
      saleAmount: 340000,
      receivedAmount: 200000,
      balanceDue: 140000,
      bookingDate: new Date().toISOString().split('T')[0],
      salesExecutive: 'Sarah Jenkins',
      saleStatus: 'In Process'
    });
  };

  const openEditModal = (item) => {
    setEditingSale(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteFlatSale(deletingId);
      addToast('Flat sale record removed.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Invoice No',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.invoiceNo || row.id}</div>
          <div className="text-[10px] text-slate-400">{row.bookingDate}</div>
        </div>
      )
    },
    {
      header: 'Customer Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500">Executive: {row.salesExecutive}</div>
        </div>
      )
    },
    {
      header: 'Property / Unit',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{row.unitNumber} ({row.flatType})</div>
          <div className="text-[10px] text-slate-500">{row.projectName || 'Skyline Tower'} • {row.floor}</div>
        </div>
      )
    },
    {
      header: 'Sale Amount',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-emerald-700">
            ${(Number(row.saleAmount) || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">
            Recvd: ${Number(row.receivedAmount || 0).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      header: 'Outstanding Balance',
      render: (row) => {
        const bal = Number(row.balanceDue || 0);
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
        <Badge variant={row.saleStatus === 'Completed' ? 'success' : 'brand'}>
          {row.saleStatus}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingSale(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Sale Record"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Sale"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Sale"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalRevenue = flatSales.reduce((acc, curr) => acc + (Number(curr.saleAmount) || 0), 0);
  const totalReceived = flatSales.reduce((acc, curr) => acc + (Number(curr.receivedAmount) || 0), 0);
  const completedSales = flatSales.filter(s => s.saleStatus === 'Completed').length;
  const inProcessSales = flatSales.filter(s => s.saleStatus === 'In Process').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flat Sale Track & Revenue"
        description="Monitor unit deeds, total contract value, collections, and sales closure milestones."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Flat Sale Track', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                flatType: '2 BHK',
                floor: '4th Floor',
                projectName: 'Skyline Heights',
                saleAmount: 340000,
                receivedAmount: 200000,
                balanceDue: 140000,
                bookingDate: new Date().toISOString().split('T')[0],
                salesExecutive: 'Sarah Jenkins',
                saleStatus: 'In Process'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Record Flat Sale
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Contract Value</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">${(totalRevenue / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-slate-400 mt-1">Gross recognized sales</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Realized Collections</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">${(totalReceived / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-emerald-600 mt-1">Funds banked to date</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Completed Closures</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{completedSales} Units</div>
          <div className="text-[11px] text-blue-600 mt-1">100% paid & finalized</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">In Process Sales</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{inProcessSales} Units</div>
          <div className="text-[11px] text-amber-600 mt-1">Active payment stages</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Sales Invoicing & Ledger"
        subtitle="Detailed log of all purchased units and financial execution progress"
        data={flatSales}
        columns={columns}
        searchPlaceholder="Search customer, invoice, or unit..."
        filterKey="saleStatus"
        filterOptions={[
          { label: 'All Sales', value: 'ALL' },
          { label: 'Completed', value: 'Completed' },
          { label: 'In Process', value: 'In Process' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingSale}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSale(null);
        }}
        title={editingSale ? `Edit Flat Sale: ${editingSale.invoiceNo || editingSale.id}` : 'Record New Flat Sale'}
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project Name</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Number</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Floor</label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
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
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Sale Amount ($)</label>
              <input
                type="number"
                value={formData.saleAmount}
                onChange={(e) => setFormData({ ...formData, saleAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Received Amount ($)</label>
              <input
                type="number"
                value={formData.receivedAmount}
                onChange={(e) => setFormData({ ...formData, receivedAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Booking Date</label>
              <input
                type="date"
                value={formData.bookingDate}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sales Executive</label>
              <input
                type="text"
                value={formData.salesExecutive}
                onChange={(e) => setFormData({ ...formData, salesExecutive: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sale Status</label>
              <select
                value={formData.saleStatus}
                onChange={(e) => setFormData({ ...formData, saleStatus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="In Process">In Process</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingSale(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingSale ? 'Update Sale' : 'Save Flat Sale'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingSale && (
        <Modal
          isOpen={true}
          onClose={() => setViewingSale(null)}
          title={`Flat Sale Invoice: ${viewingSale.invoiceNo || viewingSale.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Invoice Number</span>
                <div className="font-mono text-sm font-extrabold text-brand-700">{viewingSale.invoiceNo || viewingSale.id}</div>
              </div>
              <Badge variant={viewingSale.saleStatus === 'Completed' ? 'success' : 'brand'}>
                {viewingSale.saleStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Buyer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingSale.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Property Unit</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingSale.unitNumber} ({viewingSale.flatType})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sale Value</span>
                <p className="font-extrabold text-slate-900 mt-0.5">${Number(viewingSale.saleAmount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Received Total</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(viewingSale.receivedAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pending Balance</span>
                <p className="font-bold text-amber-700 mt-0.5">${Number(viewingSale.balanceDue || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sales Executive</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingSale.salesExecutive}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingSale(null)}
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
        title="Delete Flat Sale Record"
        message="Are you sure you want to delete this flat sale invoice record?"
      />
    </div>
  );
};

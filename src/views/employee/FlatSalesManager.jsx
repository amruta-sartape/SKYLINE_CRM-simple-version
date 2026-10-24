import React, { useState } from 'react';
import { PlusCircle, Home, Edit, Trash2, DollarSign, CheckCircle2, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FlatSalesManager = ({ initialMode = 'display' }) => {
  const { flatSales, addFlatSale, updateFlatSale, deleteFlatSale } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialMode); // 'entry', 'display', 'update', 'delete'
  const [editingSale, setEditingSale] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  // New Sale Form
  const [formData, setFormData] = useState({
    buyerName: '',
    phone: '',
    projectName: 'Skyline Heights',
    flatNumber: 'Unit 402',
    salePrice: 380000,
    receivedAmount: 150000,
    closedBy: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
    registryStatus: 'In Process',
    handoverDate: '2025-09-30'
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.buyerName.trim() || !formData.flatNumber.trim()) {
      addToast('Buyer name and flat number are required.', 'error');
      return;
    }

    const price = Number(formData.salePrice) || 0;
    const rec = Number(formData.receivedAmount) || 0;

    const created = addFlatSale({
      ...formData,
      salePrice: price,
      receivedAmount: rec,
      balanceDue: Math.max(0, price - rec)
    });

    addToast(`Sale invoice ${created.invoiceNo} registered for ${created.buyerName}`, 'success');
    setActiveTab('display');
  };

  const handleUpdateSave = (e) => {
    e.preventDefault();
    const price = Number(editingSale.salePrice) || 0;
    const rec = Number(editingSale.receivedAmount) || 0;

    updateFlatSale(editingSale.id, {
      ...editingSale,
      salePrice: price,
      receivedAmount: rec,
      balanceDue: Math.max(0, price - rec)
    });

    addToast(`Sale ${editingSale.invoiceNo} updated successfully.`, 'success');
    setEditingSale(null);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteFlatSale(deletingId);
      addToast('Flat sale entry deleted.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Invoice No',
      accessor: 'invoiceNo',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '140px'
    },
    {
      header: 'Buyer Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.buyerName || row.customer}</div>
          <div className="text-[11px] text-slate-500">{row.phone || row.salesExecutive}</div>
        </div>
      )
    },
    {
      header: 'Property & Unit',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.projectName || 'Skyline Complex'}</div>
          <div className="text-[11px] text-slate-500">{row.flatNumber || row.unitNumber} ({row.flatType || '3 BHK'})</div>
        </div>
      )
    },
    {
      header: 'Price / Balance',
      render: (row) => (
        <div>
          <span className="text-xs font-bold text-slate-900">
            ${(Number(row.salePrice || row.saleAmount) || 0).toLocaleString()}
          </span>
          <span className="block text-[10px] text-rose-600 font-bold">
            Due: ${(Number(row.balanceDue) || 0).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      header: 'Registry Status',
      render: (row) => <Badge>{row.registryStatus || row.saleStatus || 'In Process'}</Badge>
    },
    {
      header: 'Handover',
      accessor: 'handoverDate',
      cellClassName: 'text-xs text-slate-500'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedSale(row)}
            className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Deed
          </button>
          <button
            onClick={() => setEditingSale({ ...row })}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Flat Sale"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Flat Sale"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          activeTab === 'entry'
            ? 'Flat Sales Entry'
            : activeTab === 'update'
            ? 'Sales Update'
            : activeTab === 'delete'
            ? 'Sales Delete'
            : 'Sales Display'
        }
        subtitle="Manage formal flat sales, buyer deeds, stamp registration filings, and payment collections."
        breadcrumbs={['Skyline CRM', 'Flat Sales', activeTab.toUpperCase()]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('entry')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'entry' ? 'bg-brand-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Entry</span>
              </button>
              <button
                onClick={() => setActiveTab('display')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'display' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Display
              </button>
              <button
                onClick={() => setActiveTab('update')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'update' ? 'bg-white text-brand-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Update
              </button>
              <button
                onClick={() => setActiveTab('delete')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'delete' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        }
      />

      {activeTab === 'entry' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 max-w-4xl mx-auto">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Buyer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  placeholder="e.g. Victoria Sterling"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
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
                  Project Name
                </label>
                <select
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Skyline Grandeur">Skyline Grandeur</option>
                  <option value="Skyline Tower A">Skyline Tower A</option>
                  <option value="Skyline Green Park">Skyline Green Park</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Flat / Unit Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                  placeholder="Unit 402"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sale Consideration ($)
                </label>
                <input
                  type="number"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Amount Received ($)
                </label>
                <input
                  type="number"
                  required
                  value={formData.receivedAmount}
                  onChange={(e) => setFormData({ ...formData, receivedAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Registry Status
                </label>
                <select
                  value={formData.registryStatus}
                  onChange={(e) => setFormData({ ...formData, registryStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="In Process">In Process</option>
                  <option value="Scheduled for Registration">Scheduled for Registration</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>Record Flat Sale Entry</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <DataTable
          title="Flat-Sales-Directory"
          columns={columns}
          data={flatSales}
          searchPlaceholder="Search buyer, invoice, property..."
          filterKey="registryStatus"
          filterOptions={['Completed', 'In Process', 'Scheduled for Registration']}
        />
      )}

      {/* Edit Sale Modal */}
      {editingSale && (
        <Modal
          isOpen={Boolean(editingSale)}
          onClose={() => setEditingSale(null)}
          title={`Update Flat Sale: ${editingSale.invoiceNo}`}
        >
          <form onSubmit={handleUpdateSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Buyer Name
                </label>
                <input
                  type="text"
                  required
                  value={editingSale.buyerName}
                  onChange={(e) => setEditingSale({ ...editingSale, buyerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Flat Number
                </label>
                <input
                  type="text"
                  required
                  value={editingSale.flatNumber}
                  onChange={(e) => setEditingSale({ ...editingSale, flatNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sale Price ($)
                </label>
                <input
                  type="number"
                  value={editingSale.salePrice}
                  onChange={(e) => setEditingSale({ ...editingSale, salePrice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Received Amount ($)
                </label>
                <input
                  type="number"
                  value={editingSale.receivedAmount}
                  onChange={(e) => setEditingSale({ ...editingSale, receivedAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Registry Status
                </label>
                <select
                  value={editingSale.registryStatus}
                  onChange={(e) => setEditingSale({ ...editingSale, registryStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="In Process">In Process</option>
                  <option value="Scheduled for Registration">Scheduled for Registration</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSale(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Deed Modal */}
      {selectedSale && (
        <Modal
          isOpen={Boolean(selectedSale)}
          onClose={() => setSelectedSale(null)}
          title={`Contract Deed: ${selectedSale.invoiceNo}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Buyer Name:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedSale.buyerName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Property Asset:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedSale.projectName} ({selectedSale.flatNumber})</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Contract Price:</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">${selectedSale.salePrice?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Received Amount:</span>
                <p className="text-emerald-700 font-bold text-sm mt-0.5">${selectedSale.receivedAmount?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Outstanding Due:</span>
                <p className="text-rose-700 font-bold mt-0.5">${selectedSale.balanceDue?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Registry Status:</span>
                <p className="mt-0.5"><Badge>{selectedSale.registryStatus}</Badge></p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close Deed
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Flat Sale Record"
        message="Are you sure you want to permanently remove this flat sale transaction from Skyline CRM?"
      />
    </div>
  );
};

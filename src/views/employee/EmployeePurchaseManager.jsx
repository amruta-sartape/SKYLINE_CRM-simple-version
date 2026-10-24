import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Building,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  DollarSign,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const EmployeePurchaseManager = ({ initialMode = 'display' }) => {
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, vendors } = useData();
  const { addToast } = useToast();

  const [activeMode, setActiveMode] = useState(initialMode); // 'display', 'entry'
  const [isModalOpen, setIsModalOpen] = useState(initialMode === 'entry');
  const [selectedPO, setSelectedPO] = useState(null);

  const initialForm = {
    vendorName: vendors[0]?.companyName || 'UltraTech Cement Ltd',
    material: 'Grade 53 OPC Cement Bags',
    quantity: '500 Bags',
    rate: 380,
    gst: 34200,
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'In Process',
    notes: 'Urgent foundation casting delivery'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleSavePO = (e) => {
    e.preventDefault();
    const rate = Number(formData.rate) || 0;
    const qtyNum = parseInt(formData.quantity, 10) || 1;
    const subtotal = rate * qtyNum;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;

    const created = addPurchaseOrder({
      ...formData,
      rate,
      gst,
      totalAmount: total
    });

    addToast(`Purchase Order ${created.poNumber} logged (₹${total.toLocaleString('en-IN')})`, 'success');
    setIsModalOpen(false);
    setActiveMode('display');
  };

  const columns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '130px'
    },
    {
      header: 'Vendor & Company',
      accessor: 'vendorName',
      cellClassName: 'font-semibold text-slate-900 text-xs'
    },
    {
      header: 'Material / Item Description',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{row.material}</div>
          <div className="text-[11px] text-slate-500">Qty: {row.quantity} @ ₹{row.rate}</div>
        </div>
      )
    },
    {
      header: 'GST (18%)',
      render: (row) => (
        <span className="text-xs font-mono text-slate-600">
          ₹{row.gst?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Total Order Value',
      render: (row) => (
        <span className="text-xs font-bold text-slate-900 font-mono">
          ₹{row.totalAmount?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Expected Delivery',
      accessor: 'deliveryDate',
      cellClassName: 'text-xs font-mono text-slate-700'
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Delivered' ? 'success' : row.status === 'Approved' ? 'indigo' : 'warning'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedPO(row)}
          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded"
          title="View PO Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeMode === 'entry' ? 'Purchase Order Entry' : 'Display Purchase Entries'}
        subtitle="Log material procurement purchase orders, track site deliveries, and verify contractor requisitions."
        breadcrumbs={['Skyline CRM', 'Operations', 'Purchase Entry']}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Entry</span>
          </button>
        }
      />

      <DataTable
        title="Material-Purchase-Requisitions"
        columns={columns}
        data={purchaseOrders}
        searchPlaceholder="Search PO number, vendor, material description..."
        filterKey="status"
        filterOptions={['In Process', 'Approved', 'Delivered']}
      />

      {/* Add PO Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Material Purchase Entry"
        subtitle="Issue purchase order requisition for site materials."
      >
        <form onSubmit={handleSavePO} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Registered Vendor *</label>
            <select
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.companyName}>
                  {v.companyName} ({v.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Material Description *</label>
            <input
              type="text"
              required
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              placeholder="e.g. Grade 53 OPC Cement Bags"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="500 Bags"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Rate (₹) *</label>
              <input
                type="number"
                required
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Delivery Date *</label>
              <input
                type="date"
                required
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="In Process">In Process</option>
                <option value="Approved">Approved</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Requisition Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Urgent casting delivery for Tower A"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              Submit Purchase Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* View PO Modal */}
      {selectedPO && (
        <Modal
          isOpen={Boolean(selectedPO)}
          onClose={() => setSelectedPO(null)}
          title={`Purchase Order: ${selectedPO.poNumber}`}
          subtitle={`${selectedPO.vendorName} — ${selectedPO.deliveryDate}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold">Vendor:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedPO.vendorName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Material:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedPO.material}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Quantity:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedPO.quantity}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Unit Rate:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">₹{selectedPO.rate}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">GST Amount (18%):</span>
                <p className="font-mono font-bold text-slate-700 mt-0.5">₹{selectedPO.gst?.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Total PO Value:</span>
                <p className="font-mono font-black text-brand-700 text-sm mt-0.5">₹{selectedPO.totalAmount?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPO(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, ShoppingCart, DollarSign, Calendar,
  Building, CheckCircle2, Clock, Truck, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const PurchaseOrderPage = () => {
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, vendors } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [viewingPO, setViewingPO] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
    category: 'Material Supplier',
    material: '',
    quantity: '10 Units',
    rate: 1000,
    gst: '$1,800 (18%)',
    totalAmount: 11800,
    deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'Approved',
    authorizedBy: 'Alexander Wright'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.material.trim() || !formData.vendorName) {
      addToast('Please specify Material Description and Vendor.', 'error');
      return;
    }

    const rate = Number(formData.rate) || 0;
    const totalAmount = Number(formData.totalAmount) || rate;

    const payload = {
      ...formData,
      rate,
      totalAmount
    };

    if (editingPO) {
      updatePurchaseOrder(editingPO.id, payload);
      addToast(`Purchase Order ${editingPO.poNumber || editingPO.id} updated.`, 'success');
      setEditingPO(null);
    } else {
      const created = addPurchaseOrder(payload);
      addToast(`Purchase Order ${created.poNumber} issued to ${created.vendorName}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
      category: 'Material Supplier',
      material: '',
      quantity: '10 Units',
      rate: 1000,
      gst: '$1,800 (18%)',
      totalAmount: 11800,
      deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: 'Approved',
      authorizedBy: 'Alexander Wright'
    });
  };

  const openEditModal = (item) => {
    setEditingPO(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deletePurchaseOrder(deletingId);
      addToast('Purchase order record removed.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Approved':
        return 'success';
      case 'In Process':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'brand';
    }
  };

  const columns = [
    {
      header: 'PO Number',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.poNumber || row.id}</div>
          <div className="text-[10px] text-slate-400">{row.date}</div>
        </div>
      )
    },
    {
      header: 'Vendor / Supplier',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {row.vendorName}
          </div>
          <div className="text-[10px] text-slate-500">{row.category}</div>
        </div>
      )
    },
    {
      header: 'Material & Quantity',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs max-w-[200px] truncate" title={row.material}>
            {row.material}
          </div>
          <div className="text-[10px] text-brand-700 font-bold">Qty: {row.quantity}</div>
        </div>
      )
    },
    {
      header: 'Unit Rate & GST',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-700">${(Number(row.rate) || 0).toLocaleString()} / unit</div>
          <div className="text-[10px] text-slate-400">GST: {row.gst}</div>
        </div>
      )
    },
    {
      header: 'Total PO Value',
      render: (row) => (
        <div className="text-xs font-extrabold text-emerald-700">
          ${(Number(row.totalAmount) || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Delivery Due',
      accessor: 'deliveryDate',
      cellClassName: 'text-xs text-slate-600'
    },
    {
      header: 'Status',
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
            onClick={() => setViewingPO(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View PO Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit PO"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete PO"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalPOValue = purchaseOrders.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const deliveredCount = purchaseOrders.filter(p => p.status === 'Delivered').length;
  const inProcessCount = purchaseOrders.filter(p => p.status === 'In Process' || p.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders (PO) & Material Procurement"
        description="Formalize contractual purchase requisitions, rate contracts, tax invoices, and on-site delivery tracking."
        breadcrumbs={[
          { label: 'Finance & Procurement' },
          { label: 'Purchase Orders', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                date: new Date().toISOString().split('T')[0],
                vendorName: vendors[0]?.vendorName || 'Titan Steel & Metals',
                category: 'Material Supplier',
                material: '',
                quantity: '10 Units',
                rate: 1000,
                gst: '$1,800 (18%)',
                totalAmount: 11800,
                deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
                status: 'Approved',
                authorizedBy: 'Alexander Wright'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Raise Purchase Order
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Purchase Orders</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{purchaseOrders.length} Orders</div>
          <div className="text-[11px] text-slate-400 mt-1">Issued to suppliers & contractors</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total Procurement Value</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">${totalPOValue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Committed material orders</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Delivered on Site</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{deliveredCount} Orders</div>
          <div className="text-[11px] text-blue-600 mt-1">Inspected & accepted</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">In Process / Dispatch</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{inProcessCount} Orders</div>
          <div className="text-[11px] text-amber-600 mt-1">Awaiting site arrival</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Purchase Order Registry"
        subtitle="Manage supplier deliverables, rates, and authorization approvals"
        data={purchaseOrders}
        columns={columns}
        searchPlaceholder="Search PO number, vendor, or material..."
        filterKey="status"
        filterOptions={[
          { label: 'All Orders', value: 'ALL' },
          { label: 'Approved', value: 'Approved' },
          { label: 'In Process', value: 'In Process' },
          { label: 'Delivered', value: 'Delivered' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingPO}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPO(null);
        }}
        title={editingPO ? `Edit Purchase Order: ${editingPO.poNumber || editingPO.id}` : 'Raise Purchase Order'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendor / Supplier *</label>
              <select
                value={formData.vendorName}
                onChange={(e) => {
                  const selected = vendors.find(v => v.vendorName === e.target.value);
                  setFormData({
                    ...formData,
                    vendorName: e.target.value,
                    category: selected?.category || formData.category
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.vendorName}>{v.vendorName} ({v.category})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PO Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Material / Service Description *</label>
            <input
              type="text"
              required
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. TMT Steel Bars (Fe 500D) - 16mm & 20mm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Quantity</label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 50 Metric Tons"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Rate / Unit ($)</label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => {
                  const r = Number(e.target.value) || 0;
                  setFormData({ ...formData, rate: r, totalAmount: r * 1.18 });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GST Breakdown</label>
              <input
                type="text"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. $7,650 (18%)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total PO Amount ($)</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Delivery Date</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Order Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Approved">Approved</option>
                <option value="In Process">In Process</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingPO(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingPO ? 'Update Purchase Order' : 'Issue Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingPO && (
        <Modal
          isOpen={true}
          onClose={() => setViewingPO(null)}
          title={`Purchase Order: ${viewingPO.poNumber || viewingPO.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Order Reference</span>
                <div className="font-mono text-sm font-extrabold text-brand-700">{viewingPO.poNumber || viewingPO.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingPO.status)}>
                {viewingPO.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Vendor / Supplier</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingPO.vendorName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">PO Issue Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingPO.date}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Material Specification</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingPO.material}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Order Quantity</span>
                <p className="font-semibold text-brand-700 mt-0.5">{viewingPO.quantity}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Unit Rate</span>
                <p className="font-semibold text-slate-800 mt-0.5">${Number(viewingPO.rate).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Applicable Taxes (GST)</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingPO.gst}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Purchase Value</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(viewingPO.totalAmount).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingPO(null)}
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
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order requisition?"
      />
    </div>
  );
};

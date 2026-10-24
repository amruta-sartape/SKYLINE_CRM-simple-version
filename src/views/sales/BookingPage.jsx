import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, FileSpreadsheet, CheckCircle2, Clock,
  AlertCircle, DollarSign, Home, Building, Calendar, Receipt
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const BookingPage = ({ initialAction }) => {
  const { bookings, addBooking, updateBooking, deleteBooking } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAction === 'entry');
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    bookingAmount: 35000,
    totalCost: 350000,
    bookingDate: new Date().toISOString().split('T')[0],
    unitNumber: 'Unit 402',
    floor: '4th Floor',
    flatType: '2 BHK',
    projectName: 'Skyline Heights',
    bookingStatus: 'Confirmed',
    salesExecutive: 'Sarah Jenkins'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please specify Customer Name.', 'error');
      return;
    }

    const payload = {
      ...formData,
      bookingAmount: Number(formData.bookingAmount) || 0,
      totalCost: Number(formData.totalCost) || 0
    };

    if (editingBooking) {
      updateBooking(editingBooking.id, payload);
      addToast(`Booking ${editingBooking.bookingNo || editingBooking.id} updated.`, 'success');
      setEditingBooking(null);
    } else {
      const created = addBooking(payload);
      addToast(`Booking confirmed for ${created.customer} (Unit: ${created.unitNumber}).`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      bookingAmount: 35000,
      totalCost: 350000,
      bookingDate: new Date().toISOString().split('T')[0],
      unitNumber: 'Unit 402',
      floor: '4th Floor',
      flatType: '2 BHK',
      projectName: 'Skyline Heights',
      bookingStatus: 'Confirmed',
      salesExecutive: 'Sarah Jenkins'
    });
  };

  const openEditModal = (item) => {
    setEditingBooking(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteBooking(deletingId);
      addToast('Booking record removed.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'brand';
    }
  };

  const columns = [
    {
      header: 'Booking No',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-700">{row.bookingNo || row.id}</div>
          <div className="text-[10px] text-slate-400">{row.bookingDate}</div>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500">Executive: {row.salesExecutive || 'Sarah Jenkins'}</div>
        </div>
      )
    },
    {
      header: 'Unit / Property',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{row.unitNumber} ({row.flatType})</div>
          <div className="text-[10px] text-slate-500">{row.projectName || 'Skyline Complex'} • {row.floor}</div>
        </div>
      )
    },
    {
      header: 'Booking Token Amount',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-emerald-700">
            ${(Number(row.bookingAmount) || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">Total: ${(Number(row.totalCost) || 0).toLocaleString()}</div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.bookingStatus)}>
          {row.bookingStatus}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingBooking(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Booking Slip"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Update Booking"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Booking"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
  const pendingCount = bookings.filter(b => b.bookingStatus === 'Pending').length;
  const totalTokens = bookings.reduce((sum, b) => sum + (Number(b.bookingAmount) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking & Booking Track"
        description="Record token advances, reserve flat allotments, and generate booking confirmations."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Booking Track', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                bookingAmount: 35000,
                totalCost: 350000,
                bookingDate: new Date().toISOString().split('T')[0],
                unitNumber: 'Unit 402',
                floor: '4th Floor',
                flatType: '2 BHK',
                projectName: 'Skyline Heights',
                bookingStatus: 'Confirmed',
                salesExecutive: 'Sarah Jenkins'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Booking Entry
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bookings</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{bookings.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Recorded contracts</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Confirmed Bookings</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{confirmedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Token funds received</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Tokens</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Awaiting wire clearance</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Total Token Advances</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">${totalTokens.toLocaleString()}</div>
          <div className="text-[11px] text-blue-600 mt-1">Earnest booking deposits</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Booking Ledger"
        subtitle="Manage official unit reservations and track customer token transactions"
        data={bookings}
        columns={columns}
        searchPlaceholder="Search customer, booking number, or unit..."
        filterKey="bookingStatus"
        filterOptions={[
          { label: 'All Bookings', value: 'ALL' },
          { label: 'Confirmed', value: 'Confirmed' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Cancelled', value: 'Cancelled' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingBooking}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBooking(null);
        }}
        title={editingBooking ? `Edit Booking: ${editingBooking.bookingNo || editingBooking.id}` : 'Create Booking Record'}
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
                placeholder="e.g. Unit 804"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Floor</label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 8th Floor"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Booking Token ($)</label>
              <input
                type="number"
                value={formData.bookingAmount}
                onChange={(e) => setFormData({ ...formData, bookingAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Booking Status</label>
              <select
                value={formData.bookingStatus}
                onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingBooking(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingBooking ? 'Update Booking' : 'Save Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingBooking && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBooking(null)}
          title={`Booking Slip: ${viewingBooking.bookingNo || viewingBooking.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Allotment Order</span>
                <div className="font-mono text-sm font-extrabold text-brand-700">{viewingBooking.bookingNo || viewingBooking.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingBooking.bookingStatus)}>
                {viewingBooking.bookingStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingBooking.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Allotted Flat</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingBooking.unitNumber} ({viewingBooking.flatType})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Booking Token Deposit</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(viewingBooking.bookingAmount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Purchase Value</span>
                <p className="font-bold text-slate-800 mt-0.5">${Number(viewingBooking.totalCost).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Booking Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingBooking.bookingDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Executive In-Charge</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingBooking.salesExecutive}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Unit is officially marked as reserved. Client payment schedule is generated.</span>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
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
        title="Cancel & Delete Booking"
        message="Are you sure you want to delete this booking record? The unit will return to available inventory."
      />
    </div>
  );
};

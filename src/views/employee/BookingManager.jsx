import React, { useState } from 'react';
import { PlusCircle, FileSpreadsheet, Edit, Trash2, CheckCircle2, DollarSign, Home } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const BookingManager = ({ initialMode = 'display' }) => {
  const { bookings, addBooking, updateBooking, deleteBooking } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialMode); // 'entry', 'display', 'update', 'delete'
  const [editingBooking, setEditingBooking] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // New Booking Entry Form State
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: 'Skyline Tower A',
    unitNumber: '',
    unitType: '2 BHK Premium',
    totalCost: 350000,
    bookingAmount: 35000,
    paymentMode: 'Wire Transfer',
    agentName: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
    agreementStatus: 'Draft Generated'
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.unitNumber.trim()) {
      addToast('Client Name and Unit Number are required.', 'error');
      return;
    }

    const created = addBooking({
      ...formData,
      totalCost: Number(formData.totalCost) || 0,
      bookingAmount: Number(formData.bookingAmount) || 0
    });

    addToast(`Booking ${created.bookingNo} created for ${created.clientName}`, 'success');
    setActiveTab('display');
    setFormData({
      clientName: '',
      projectName: 'Skyline Tower A',
      unitNumber: '',
      unitType: '2 BHK Premium',
      totalCost: 350000,
      bookingAmount: 35000,
      paymentMode: 'Wire Transfer',
      agentName: `${currentUser?.firstName || 'Sarah'} ${currentUser?.lastName || 'Jenkins'}`.trim(),
      agreementStatus: 'Draft Generated'
    });
  };

  const handleUpdateSave = (e) => {
    e.preventDefault();
    updateBooking(editingBooking.id, {
      ...editingBooking,
      totalCost: Number(editingBooking.totalCost) || 0,
      bookingAmount: Number(editingBooking.bookingAmount) || 0
    });
    addToast(`Booking ${editingBooking.bookingNo} updated successfully.`, 'success');
    setEditingBooking(null);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteBooking(deletingId);
      addToast('Booking entry purged from database.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Booking No',
      accessor: 'bookingNo',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '150px'
    },
    {
      header: 'Buyer Details',
      render: (row) => (
        <div className="font-bold text-slate-900 text-xs">
          {row.clientName || row.customer}
        </div>
      )
    },
    {
      header: 'Property & Unit',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.projectName || 'Skyline Complex'}</div>
          <div className="text-[11px] text-slate-500">{row.unitNumber} ({row.unitType || row.flatType || '2 BHK'})</div>
        </div>
      )
    },
    {
      header: 'Token Received',
      render: (row) => (
        <div>
          <span className="text-xs font-bold text-emerald-700">
            ${(row.bookingAmount || 0).toLocaleString()}
          </span>
          <span className="block text-[10px] text-slate-400">
            of ${(row.totalCost || 0).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      header: 'Agreement Status',
      render: (row) => <Badge>{row.agreementStatus || row.bookingStatus || 'Confirmed'}</Badge>
    },
    {
      header: 'Booking Date',
      accessor: 'bookingDate',
      cellClassName: 'text-xs text-slate-500'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedBooking(row)}
            className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Summary
          </button>
          <button
            onClick={() => setEditingBooking({ ...row })}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          activeTab === 'entry'
            ? 'Booking Entry'
            : activeTab === 'update'
            ? 'Booking Update'
            : activeTab === 'delete'
            ? 'Booking Delete'
            : 'Booking Display'
        }
        subtitle="Manage formal apartment bookings, token receipts, draft agreements, and customer allocations."
        breadcrumbs={['Skyline CRM', 'Bookings', activeTab.toUpperCase()]}
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

      {/* Entry View or Data Table */}
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
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Harrison Palmer"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Project Development *
                </label>
                <select
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Skyline Tower A">Skyline Tower A</option>
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Skyline Grandeur">Skyline Grandeur</option>
                  <option value="Skyline Green Park">Skyline Green Park</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Allocated Unit / Flat Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                  placeholder="e.g. Unit 804"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit Configuration
                </label>
                <input
                  type="text"
                  value={formData.unitType}
                  onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                  placeholder="2 BHK Premium"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Total Contract Cost ($)
                </label>
                <input
                  type="number"
                  required
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Token Advance Paid ($)
                </label>
                <input
                  type="number"
                  required
                  value={formData.bookingAmount}
                  onChange={(e) => setFormData({ ...formData, bookingAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="Cheque (Clear)">Cheque (Clear)</option>
                  <option value="Card / Net Banking">Card / Net Banking</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Confirm & Record Booking</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <DataTable
          title="Booking-Registry"
          columns={columns}
          data={bookings}
          searchPlaceholder="Search buyer, booking no, property, unit..."
          filterKey="projectName"
          filterOptions={['Skyline Tower A', 'Skyline Heights', 'Skyline Grandeur', 'Skyline Green Park']}
        />
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <Modal
          isOpen={Boolean(editingBooking)}
          onClose={() => setEditingBooking(null)}
          title={`Update Booking: ${editingBooking.bookingNo}`}
        >
          <form onSubmit={handleUpdateSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={editingBooking.clientName}
                  onChange={(e) => setEditingBooking({ ...editingBooking, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Allocated Unit Number
                </label>
                <input
                  type="text"
                  required
                  value={editingBooking.unitNumber}
                  onChange={(e) => setEditingBooking({ ...editingBooking, unitNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Total Cost ($)
                </label>
                <input
                  type="number"
                  value={editingBooking.totalCost}
                  onChange={(e) => setEditingBooking({ ...editingBooking, totalCost: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Booking Amount ($)
                </label>
                <input
                  type="number"
                  value={editingBooking.bookingAmount}
                  onChange={(e) => setEditingBooking({ ...editingBooking, bookingAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Agreement Status
                </label>
                <select
                  value={editingBooking.agreementStatus}
                  onChange={(e) => setEditingBooking({ ...editingBooking, agreementStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Draft Generated">Draft Generated</option>
                  <option value="Signed & Stamped">Signed & Stamped</option>
                  <option value="Pending KYC">Pending KYC</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Save Booking Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Summary View Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Dossier: ${selectedBooking.bookingNo}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Client Name:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedBooking.clientName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Property & Unit:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedBooking.projectName}</p>
                <p className="text-slate-600">{selectedBooking.unitNumber} ({selectedBooking.unitType})</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Total Price:</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">${selectedBooking.totalCost?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Token Advance:</span>
                <p className="text-emerald-700 font-bold text-sm mt-0.5">${selectedBooking.bookingAmount?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Agreement Status:</span>
                <p className="mt-0.5"><Badge>{selectedBooking.agreementStatus}</Badge></p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Booking Officer:</span>
                <p className="text-slate-900 font-medium mt-0.5">{selectedBooking.agentName}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Booking Record"
        message="Are you sure you want to cancel and delete this customer booking entry?"
      />
    </div>
  );
};

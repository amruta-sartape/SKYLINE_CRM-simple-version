import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, Compass, Calendar, Clock, Car,
  UserCheck, CheckCircle2, AlertCircle, RefreshCw, XCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const SiteVisitPage = () => {
  const { siteVisits, addSiteVisit, updateSiteVisit, deleteSiteVisit } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [viewingVisit, setViewingVisit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    propertyInterested: 'Skyline Tower A',
    unitNumber: 'Unit 402',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '02:00 PM',
    pickupRequired: 'No',
    executive: 'Sarah Jenkins',
    customerFeedback: '',
    status: 'Visited'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please enter Customer Name.', 'error');
      return;
    }

    if (editingVisit) {
      updateSiteVisit(editingVisit.id, formData);
      addToast(`Site visit ${editingVisit.id} updated.`, 'success');
      setEditingVisit(null);
    } else {
      const created = addSiteVisit(formData);
      addToast(`Site visit scheduled for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      propertyInterested: 'Skyline Tower A',
      unitNumber: 'Unit 402',
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '02:00 PM',
      pickupRequired: 'No',
      executive: 'Sarah Jenkins',
      customerFeedback: '',
      status: 'Visited'
    });
  };

  const openEditModal = (item) => {
    setEditingVisit(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteSiteVisit(deletingId);
      addToast('Site visit record removed.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Visited':
        return 'success';
      case 'Rescheduled':
        return 'warning';
      case 'No Show':
        return 'danger';
      default:
        return 'brand';
    }
  };

  const columns = [
    {
      header: 'Visit Ref',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '100px'
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500">{row.propertyInterested || 'Skyline Complex'} ({row.unitNumber || 'Model Flat'})</div>
        </div>
      )
    },
    {
      header: 'Schedule',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{row.visitDate}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {row.visitTime}
          </div>
        </div>
      )
    },
    {
      header: 'Pickup Service',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
          row.pickupRequired?.includes('Yes') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
        }`}>
          <Car className="w-3 h-3" />
          {row.pickupRequired}
        </span>
      )
    },
    {
      header: 'Executive',
      accessor: 'executive',
      cellClassName: 'text-xs text-slate-700 font-medium'
    },
    {
      header: 'Customer Feedback',
      render: (row) => (
        <div className="max-w-[200px] truncate text-xs text-slate-600" title={row.customerFeedback}>
          {row.customerFeedback || 'No feedback recorded yet.'}
        </div>
      )
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
            onClick={() => setViewingVisit(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Update Visit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Visit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const visitedCount = siteVisits.filter(s => s.status === 'Visited').length;
  const rescheduledCount = siteVisits.filter(s => s.status === 'Rescheduled').length;
  const noShowCount = siteVisits.filter(s => s.status === 'No Show').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Visit Track & Experience"
        description="Coordinate physical site tours, VIP concierge pick-ups, and prospect feedback."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Site Visit Track', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                propertyInterested: 'Skyline Tower A',
                unitNumber: 'Unit 402',
                visitDate: new Date().toISOString().split('T')[0],
                visitTime: '02:00 PM',
                pickupRequired: 'No',
                executive: 'Sarah Jenkins',
                customerFeedback: '',
                status: 'Visited'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Site Visit
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Visits Scheduled</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{siteVisits.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all project phases</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed Tours</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{visitedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Visited & evaluated layouts</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Rescheduled Visits</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{rescheduledCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Adjusted appointment time</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">No Shows</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{noShowCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Missed appointments</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Site Visit Schedule & Feedback"
        subtitle="Manage client property tours, transportation needs, and site remarks"
        data={siteVisits}
        columns={columns}
        searchPlaceholder="Search customer, executive, or unit..."
        filterKey="status"
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Visited', value: 'Visited' },
          { label: 'Rescheduled', value: 'Rescheduled' },
          { label: 'No Show', value: 'No Show' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingVisit}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVisit(null);
        }}
        title={editingVisit ? `Update Site Visit: ${editingVisit.id}` : 'Schedule Site Visit'}
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Property Project</label>
              <input
                type="text"
                value={formData.propertyInterested}
                onChange={(e) => setFormData({ ...formData, propertyInterested: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Skyline Heights"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit / Flat Focus</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 804"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Visit Date</label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Visit Time</label>
              <input
                type="text"
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 02:30 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pickup Required?</label>
              <select
                value={formData.pickupRequired}
                onChange={(e) => setFormData({ ...formData, pickupRequired: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="No (Self Drive)">No (Self Drive)</option>
                <option value="Yes (Standard Cab)">Yes (Standard Cab)</option>
                <option value="Yes (VIP Pickup)">Yes (VIP Pickup)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Host Executive</label>
              <input
                type="text"
                value={formData.executive}
                onChange={(e) => setFormData({ ...formData, executive: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Visit Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Visited">Visited</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="No Show">No Show</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Feedback & Observations</label>
            <textarea
              rows={3}
              value={formData.customerFeedback}
              onChange={(e) => setFormData({ ...formData, customerFeedback: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="Record impressions regarding layout, view, clubhouse, price expectations..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingVisit(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingVisit ? 'Update Visit' : 'Save Site Visit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingVisit && (
        <Modal
          isOpen={true}
          onClose={() => setViewingVisit(null)}
          title={`Site Visit Report: ${viewingVisit.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Appointment Code</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingVisit.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingVisit.status)}>
                {viewingVisit.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingVisit.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Inspected Property</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingVisit.propertyInterested} ({viewingVisit.unitNumber})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Date & Time</span>
                <p className="font-medium text-slate-700 mt-0.5">{viewingVisit.visitDate} at {viewingVisit.visitTime}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Host Executive</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingVisit.executive}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pickup Logistics</span>
                <p className="font-medium text-slate-700 mt-0.5">{viewingVisit.pickupRequired}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500">Prospect Feedback</span>
              <p className="text-slate-800 mt-1 leading-relaxed">{viewingVisit.customerFeedback || 'No feedback recorded.'}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingVisit(null)}
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
        title="Delete Site Visit"
        message="Are you sure you want to delete this site visit record?"
      />
    </div>
  );
};

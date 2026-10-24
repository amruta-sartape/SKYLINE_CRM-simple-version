import React, { useState } from 'react';
import { Calendar, Clock, Edit, Trash2, CheckCircle2, Phone, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FollowupManager = ({ initialMode = 'display' }) => {
  const { followups, addFollowup, updateFollowup, deleteFollowup } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialMode); // 'display', 'update', 'delete'
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    clientName: '',
    phone: '',
    followupDate: '',
    time: '',
    mode: 'Phone Call',
    priority: 'Medium',
    status: 'Pending',
    notes: ''
  });

  const openEditModal = (item) => {
    setEditingFollowup(item);
    setEditFormData({
      clientName: item.clientName,
      phone: item.phone,
      followupDate: item.followupDate,
      time: item.time,
      mode: item.mode,
      priority: item.priority,
      status: item.status,
      notes: item.notes || ''
    });
  };

  const handleUpdateSave = (e) => {
    e.preventDefault();
    if (!editFormData.clientName.trim()) {
      addToast('Client name is required.', 'error');
      return;
    }
    updateFollowup(editingFollowup.id, editFormData);
    addToast(`Follow-up ${editingFollowup.id} updated successfully.`, 'success');
    setEditingFollowup(null);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteFollowup(deletingId);
      addToast('Follow-up record removed.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-slate-500',
      width: '90px'
    },
    {
      header: 'Client Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.clientName || row.customer || 'Prospective Buyer'}</div>
          <div className="text-xs text-slate-500">{row.phone || row.mobileNumber || '+1 (555) 234-5678'}</div>
        </div>
      )
    },
    {
      header: 'Scheduled Slot',
      render: (row) => (
        <div className="text-xs text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.followupDate || row.date || row.nextFollowupDate}</span>
          <span className="text-slate-400">({row.time || '10:00 AM'})</span>
        </div>
      )
    },
    {
      header: 'Channel',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.mode || row.followupType || 'Phone Call'}
        </span>
      )
    },
    {
      header: 'Priority',
      render: (row) => <Badge variant={row.priority || 'Medium'}>{row.priority || 'Medium'}</Badge>
    },
    {
      header: 'Status',
      render: (row) => <Badge>{row.status || 'Pending'}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Update</span>
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete follow-up"
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
          activeTab === 'delete'
            ? 'Follow-up Delete'
            : activeTab === 'update'
            ? 'Follow-up Update'
            : 'Follow-up Display'
        }
        subtitle="Manage scheduled client reminders, update appointment feedback, and purge completed logs."
        breadcrumbs={['Skyline CRM', 'Follow-ups', activeTab === 'delete' ? 'Delete' : activeTab === 'update' ? 'Update' : 'Display']}
        actions={
          <div className="flex items-center gap-2">
            {/* Tab Filter Switcher */}
            <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('display')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'display' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Display All
              </button>
              <button
                onClick={() => setActiveTab('update')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'update' ? 'bg-white text-brand-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Update Mode
              </button>
              <button
                onClick={() => setActiveTab('delete')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'delete' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Delete Mode
              </button>
            </div>
          </div>
        }
      />

      <DataTable
        title="Follow-up-Directory"
        columns={columns}
        data={followups}
        searchPlaceholder="Search client name, channel, date..."
        filterKey="status"
        filterOptions={['Pending', 'Completed', 'Scheduled']}
      />

      {/* Edit / Update Modal */}
      {editingFollowup && (
        <Modal
          isOpen={Boolean(editingFollowup)}
          onClose={() => setEditingFollowup(null)}
          title={`Update Follow-up: ${editingFollowup.id}`}
          subtitle={`Client: ${editingFollowup.clientName}`}
        >
          <form onSubmit={handleUpdateSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.clientName}
                  onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editFormData.followupDate}
                  onChange={(e) => setEditFormData({ ...editFormData, followupDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={editFormData.time}
                  onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Updated Feedback & Discussion Notes
              </label>
              <textarea
                rows={3}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingFollowup(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Follow-up Schedule"
        message="Are you sure you want to delete this scheduled follow-up from your pipeline?"
      />
    </div>
  );
};

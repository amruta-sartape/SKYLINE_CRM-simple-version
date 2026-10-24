import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, CalendarCheck, PhoneCall, MessageSquare, Mail,
  Video, Users, MessageCircle, Clock, AlertCircle, Calendar
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FollowupManagementPage = () => {
  const { followups, addFollowup, updateFollowup, deleteFollowup } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [viewingFollowup, setViewingFollowup] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    remarks: '',
    nextFollowupDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    executiveName: 'Sarah Jenkins',
    followupType: 'Phone Call',
    status: 'Pending'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please specify the customer name.', 'error');
      return;
    }

    if (editingFollowup) {
      updateFollowup(editingFollowup.id, formData);
      addToast(`Follow-up ${editingFollowup.id} updated successfully.`, 'success');
      setEditingFollowup(null);
    } else {
      const created = addFollowup(formData);
      addToast(`Follow-up recorded with ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      date: new Date().toISOString().split('T')[0],
      time: '11:00 AM',
      remarks: '',
      nextFollowupDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      executiveName: 'Sarah Jenkins',
      followupType: 'Phone Call',
      status: 'Pending'
    });
  };

  const openEditModal = (item) => {
    setEditingFollowup(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteFollowup(deletingId);
      addToast('Follow-up record removed.', 'info');
      setDeletingId(null);
    }
  };

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'Phone Call':
        return <PhoneCall className="w-3.5 h-3.5 text-blue-600" />;
      case 'WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case 'SMS':
        return <MessageCircle className="w-3.5 h-3.5 text-purple-600" />;
      case 'Meeting':
        return <Users className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Video Call':
        return <Video className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <PhoneCall className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '95px'
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500 font-medium">Assigned: {row.executiveName}</div>
        </div>
      )
    },
    {
      header: 'Interaction Type',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-800">
          {renderTypeIcon(row.followupType)}
          {row.followupType}
        </span>
      )
    },
    {
      header: 'Logged Date & Time',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.date}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {row.time}
          </div>
        </div>
      )
    },
    {
      header: 'Remarks & Discussion',
      render: (row) => (
        <div className="max-w-[240px] truncate text-xs text-slate-700 font-normal" title={row.remarks}>
          {row.remarks}
        </div>
      )
    },
    {
      header: 'Next Follow-up',
      render: (row) => (
        <div className="font-semibold text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 inline-block">
          {row.nextFollowupDate || 'TBD'}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'Scheduled' ? 'brand' : 'warning'}>
          {row.status || 'Pending'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingFollowup(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Follow-up"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Update Follow-up"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Follow-up"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const pendingCount = followups.filter(f => f.status === 'Pending').length;
  const completedCount = followups.filter(f => f.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Management & Track"
        description="Monitor multi-channel client engagements, scheduled touchpoints, and executive notes."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Follow-up Track', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                date: new Date().toISOString().split('T')[0],
                time: '11:00 AM',
                remarks: '',
                nextFollowupDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                executiveName: 'Sarah Jenkins',
                followupType: 'Phone Call',
                status: 'Pending'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Follow-up
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Interactions</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{followups.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged across phone, meeting, WhatsApp, email</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Follow-ups</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Requires sales executive action</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed Touchpoints</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Successfully logged interactions</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Follow-up Interaction Log"
        subtitle="Chronological list of customer outreach across all team members"
        data={followups}
        columns={columns}
        searchPlaceholder="Search by customer, executive, or notes..."
        filterKey="followupType"
        filterOptions={[
          { label: 'All Channels', value: 'ALL' },
          { label: 'Phone Call', value: 'Phone Call' },
          { label: 'WhatsApp', value: 'WhatsApp' },
          { label: 'Email', value: 'Email' },
          { label: 'Meeting', value: 'Meeting' },
          { label: 'Video Call', value: 'Video Call' },
          { label: 'SMS', value: 'SMS' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingFollowup}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingFollowup(null);
        }}
        title={editingFollowup ? `Update Follow-up: ${editingFollowup.id}` : 'Schedule New Follow-up'}
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
                placeholder="e.g. Jonathan Miller"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Follow-up Type</label>
              <select
                value={formData.followupType}
                onChange={(e) => setFormData({ ...formData, followupType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Meeting">Meeting</option>
                <option value="Video Call">Video Call</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 10:30 AM"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Executive Name</label>
              <input
                type="text"
                value={formData.executiveName}
                onChange={(e) => setFormData({ ...formData, executiveName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Remarks & Details</label>
            <textarea
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="What was discussed? Any specific preferences, questions, or reservations?"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={formData.nextFollowupDate}
                onChange={(e) => setFormData({ ...formData, nextFollowupDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingFollowup(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingFollowup ? 'Update Record' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingFollowup && (
        <Modal
          isOpen={true}
          onClose={() => setViewingFollowup(null)}
          title={`Follow-up Details: ${viewingFollowup.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Interaction Ref</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingFollowup.id}</div>
              </div>
              <Badge variant={viewingFollowup.status === 'Completed' ? 'success' : 'warning'}>
                {viewingFollowup.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingFollowup.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Channel / Type</span>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  {renderTypeIcon(viewingFollowup.followupType)}
                  {viewingFollowup.followupType}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Execution Date & Time</span>
                <p className="font-medium text-slate-700 mt-0.5">{viewingFollowup.date} at {viewingFollowup.time}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Executive</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingFollowup.executiveName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Next Scheduled Contact</span>
                <p className="font-bold text-brand-700 mt-0.5">{viewingFollowup.nextFollowupDate || 'None Scheduled'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500">Remarks & Discussion Summary</span>
              <p className="text-slate-800 mt-1 leading-relaxed">{viewingFollowup.remarks || 'No notes provided.'}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingFollowup(null)}
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
        title="Delete Follow-up"
        message="Are you sure you want to remove this follow-up record from the audit trail?"
      />
    </div>
  );
};

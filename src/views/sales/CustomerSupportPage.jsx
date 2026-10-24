import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, HeadphonesIcon, AlertCircle, CheckCircle2,
  Clock, LifeBuoy, MessageSquare, Wrench, FileQuestion, Users, ShieldAlert
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const CustomerSupportPage = () => {
  const { customerSupports, addCustomerSupport, updateCustomerSupport, deleteCustomerSupport } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    category: 'Service Request',
    subject: '',
    priority: 'Medium',
    assignedExecutive: 'Devon Miller',
    date: new Date().toISOString().split('T')[0],
    status: 'Open',
    resolutionNotes: ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim() || !formData.subject.trim()) {
      addToast('Please enter Customer Name and Ticket Subject.', 'error');
      return;
    }

    if (editingTicket) {
      updateCustomerSupport(editingTicket.id, formData);
      addToast(`Support ticket ${editingTicket.id} updated.`, 'success');
      setEditingTicket(null);
    } else {
      const created = addCustomerSupport(formData);
      addToast(`Support ticket ${created.id} raised for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      category: 'Service Request',
      subject: '',
      priority: 'Medium',
      assignedExecutive: 'Devon Miller',
      date: new Date().toISOString().split('T')[0],
      status: 'Open',
      resolutionNotes: ''
    });
  };

  const openEditModal = (item) => {
    setEditingTicket(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteCustomerSupport(deletingId);
      addToast('Support ticket record removed.', 'info');
      setDeletingId(null);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      case 'Low':
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'success';
      case 'In Progress':
        return 'brand';
      case 'Open':
      default:
        return 'warning';
    }
  };

  const renderCategoryIcon = (category) => {
    switch (category) {
      case 'Maintenance':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      case 'Complaint':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'Documentation':
        return <FileQuestion className="w-3.5 h-3.5 text-blue-600" />;
      case 'Referral':
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Service Request':
      default:
        return <LifeBuoy className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-700',
      width: '100px'
    },
    {
      header: 'Customer & Unit',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500 font-semibold">{row.unitNumber}</div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-800">
          {renderCategoryIcon(row.category)}
          {row.category}
        </span>
      )
    },
    {
      header: 'Subject',
      render: (row) => (
        <div className="max-w-[240px] truncate text-xs font-medium text-slate-800" title={row.subject}>
          {row.subject}
        </div>
      )
    },
    {
      header: 'Priority',
      render: (row) => (
        <Badge variant={getPriorityBadgeVariant(row.priority)}>
          {row.priority}
        </Badge>
      )
    },
    {
      header: 'Executive',
      accessor: 'assignedExecutive',
      cellClassName: 'text-xs text-slate-700 font-medium'
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
            onClick={() => setViewingTicket(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Ticket"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Ticket"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Ticket"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const openTickets = customerSupports.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedTickets = customerSupports.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="After-Sales Customer Support & Helpdesk"
        description="Address maintenance requests, buyer queries, documentation assistance, and client referrals."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Customer Support', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                category: 'Service Request',
                subject: '',
                priority: 'Medium',
                assignedExecutive: 'Devon Miller',
                date: new Date().toISOString().split('T')[0],
                status: 'Open',
                resolutionNotes: ''
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Raise Support Ticket
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Support Tickets</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{customerSupports.length} Tickets</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all after-sales categories</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Active / In-Progress</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{openTickets} Tickets</div>
          <div className="text-[11px] text-amber-600 mt-1">Pending executive resolution</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Resolved & Closed</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{resolvedTickets} Tickets</div>
          <div className="text-[11px] text-emerald-600 mt-1">Satisfactorily completed requests</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Helpdesk Ticket Queue"
        subtitle="Filter by issue classification and assign resolution executives"
        data={customerSupports}
        columns={columns}
        searchPlaceholder="Search customer, subject, or unit..."
        filterKey="category"
        filterOptions={[
          { label: 'All Categories', value: 'ALL' },
          { label: 'Maintenance', value: 'Maintenance' },
          { label: 'Complaint', value: 'Complaint' },
          { label: 'Service Request', value: 'Service Request' },
          { label: 'Documentation', value: 'Documentation' },
          { label: 'Referral', value: 'Referral' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingTicket}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTicket(null);
        }}
        title={editingTicket ? `Edit Ticket: ${editingTicket.id}` : 'Raise New Support Ticket'}
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Number</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 804"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Complaint">Complaint</option>
                <option value="Service Request">Service Request</option>
                <option value="Documentation">Documentation</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject / Issue Description *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Electrical outlet voltage check in balcony"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Executive</label>
              <input
                type="text"
                value={formData.assignedExecutive}
                onChange={(e) => setFormData({ ...formData, assignedExecutive: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ticket Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resolution Notes</label>
            <textarea
              rows={2}
              value={formData.resolutionNotes || ''}
              onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="Record actions taken, repair dates, or closure remarks..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTicket(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingTicket ? 'Update Ticket' : 'Create Support Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingTicket && (
        <Modal
          isOpen={true}
          onClose={() => setViewingTicket(null)}
          title={`Support Ticket: ${viewingTicket.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Ticket Reference</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingTicket.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingTicket.status)}>
                {viewingTicket.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingTicket.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Unit Number</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingTicket.unitNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  {renderCategoryIcon(viewingTicket.category)}
                  {viewingTicket.category}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Priority Level</span>
                <div className="mt-0.5">
                  <Badge variant={getPriorityBadgeVariant(viewingTicket.priority)}>
                    {viewingTicket.priority} Priority
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Specialist</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingTicket.assignedExecutive}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Logged Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingTicket.date}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500">Issue Details</span>
              <p className="text-slate-900 font-medium mt-1">{viewingTicket.subject}</p>
            </div>

            {viewingTicket.resolutionNotes && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Resolution Status & Notes</span>
                <p className="text-emerald-900 mt-1">{viewingTicket.resolutionNotes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingTicket(null)}
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
        title="Delete Support Ticket"
        message="Are you sure you want to delete this customer support ticket?"
      />
    </div>
  );
};

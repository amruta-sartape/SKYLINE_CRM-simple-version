import React, { useState } from 'react';
import {
  Send,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgePercent,
  Truck,
  Layers,
  Eye,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const AgentRequests = ({ initialMode = 'display' }) => {
  const { agentRequests, addAgentRequest, deleteAgentRequest } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialMode); // 'display', 'raise'
  const [isModalOpen, setIsModalOpen] = useState(initialMode === 'raise');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const initialForm = {
    agentName: currentUser?.displayName || currentUser?.username || 'Apex Realty Partners',
    agentEmail: currentUser?.email || 'agent@skylinecrm.com',
    requestType: 'Commission Claim',
    subject: '',
    details: '',
    priority: 'Medium'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleSaveRequest = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.details.trim()) {
      addToast('Please provide request subject and description details.', 'error');
      return;
    }

    addAgentRequest({
      ...formData,
      adminRemarks: 'Pending administrative evaluation.'
    });

    addToast(`Request "${formData.subject}" raised successfully.`, 'success');
    setIsModalOpen(false);
    setFormData(initialForm);
    setActiveTab('display');
  };

  const columns = [
    {
      header: 'Request Reference & Date',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-brand-600">{row.id}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{row.date}</div>
        </div>
      )
    },
    {
      header: 'Request Type',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.requestType}
        </span>
      )
    },
    {
      header: 'Subject & Description',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.subject}</div>
          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.details}</div>
        </div>
      )
    },
    {
      header: 'Priority',
      render: (row) => (
        <Badge
          variant={
            row.priority === 'Urgent'
              ? 'error'
              : row.priority === 'High'
              ? 'warning'
              : 'default'
          }
        >
          {row.priority}
        </Badge>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'Approved' || row.status === 'Resolved'
              ? 'success'
              : row.status === 'In Review'
              ? 'warning'
              : 'default'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Admin Feedback',
      accessor: 'adminRemarks',
      cellClassName: 'text-xs text-slate-600 italic truncate max-w-xs'
    },
    {
      header: 'Action',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedRequest(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded"
            title="View Request Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteAgentRequest(row.id);
              addToast('Request cancelled.', 'info');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            title="Delete Request"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Assistance & Support Requests"
        subtitle="Raise deal commission claims, special customer discounts, marketing materials, and site visit transportation requests."
        breadcrumbs={['Skyline CRM', 'Agent Portal', 'Agent Requests']}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Raise New Request</span>
          </button>
        }
      />

      <DataTable
        title="Agent-Requests-Log"
        columns={columns}
        data={agentRequests}
        searchPlaceholder="Search subject, request type, status..."
        filterKey="requestType"
        filterOptions={['Commission Claim', 'Special Discount Approval', 'Marketing Collateral', 'Site Transport Request']}
      />

      {/* Raise Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Agent Request to Management"
        subtitle="Submit your claim, discount concession, or support requisition."
      >
        <form onSubmit={handleSaveRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Category *</label>
              <select
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Commission Claim">Commission Claim & Deal Brokerage</option>
                <option value="Special Discount Approval">Special Discount / Concession Approval</option>
                <option value="Marketing Collateral">Brochure & Marketing Collateral Pack</option>
                <option value="Site Transport Request">Client Site Visit VIP Transport</option>
                <option value="Lead Re-assignment">Lead Re-assignment / Extension</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent (Deal in Progress)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Request Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Brokerage Commission Payout for Unit B-1204"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Explanation & References *</label>
            <textarea
              rows={4}
              required
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Provide booking token details, customer name, requested discount percentage or specific collateral requirements..."
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* View Request Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title={`Request Details: ${selectedRequest.id}`}
          subtitle={`${selectedRequest.requestType} — ${selectedRequest.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedRequest.subject}</span>
                <Badge variant={selectedRequest.status === 'Approved' ? 'success' : 'warning'}>
                  {selectedRequest.status}
                </Badge>
              </div>

              <div className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {selectedRequest.details}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                <div>Priority: <strong>{selectedRequest.priority}</strong></div>
                <div>Submitted by: <strong>{selectedRequest.agentName}</strong></div>
              </div>

              <div className="p-3 bg-brand-50 rounded-lg border border-brand-200">
                <span className="font-bold text-brand-900 block mb-0.5">Management / Admin Remarks:</span>
                <p className="text-brand-800 italic">{selectedRequest.adminRemarks || 'Under review by executive committee.'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
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

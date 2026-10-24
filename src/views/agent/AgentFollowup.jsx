import React, { useState } from 'react';
import { Calendar, Clock, Phone, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const AgentFollowup = () => {
  const { followups } = useData();
  const [selectedFollowup, setSelectedFollowup] = useState(null);

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-slate-500',
      width: '90px'
    },
    {
      header: 'Buyer Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.clientName || row.customer || 'Client'}</div>
          <div className="text-[11px] text-slate-500">{row.phone || row.mobileNumber || '+1 (555) 345-6789'}</div>
        </div>
      )
    },
    {
      header: 'Scheduled Slot',
      render: (row) => (
        <div className="text-xs text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.followupDate || row.date || row.nextFollowupDate}</span>
          <span className="text-slate-400">({row.time || '11:00 AM'})</span>
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
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedFollowup(row)}
          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
        >
          View Notes
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Display"
        subtitle="Review client followup commitments, scheduled phone consultations, and inspection meets."
        breadcrumbs={['Skyline CRM', 'Follow-ups', 'Display']}
      />

      <DataTable
        title="Agent-Followups"
        columns={columns}
        data={followups}
        searchPlaceholder="Search client, channel, date..."
        filterKey="status"
        filterOptions={['Pending', 'Completed', 'Scheduled']}
      />

      {/* Modal */}
      {selectedFollowup && (
        <Modal
          isOpen={Boolean(selectedFollowup)}
          onClose={() => setSelectedFollowup(null)}
          title={`Follow-up Notes: ${selectedFollowup.clientName}`}
        >
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Follow-up Remarks:</span>
              "{selectedFollowup.notes || 'No discussion notes logged.'}"
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedFollowup(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

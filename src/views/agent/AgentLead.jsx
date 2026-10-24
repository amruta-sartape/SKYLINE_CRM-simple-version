import React, { useState } from 'react';
import { Layers, Phone, Mail, DollarSign, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const AgentLead = () => {
  const { leads } = useData();
  const [selectedLead, setSelectedLead] = useState(null);

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-teal-700',
      width: '90px'
    },
    {
      header: 'Buyer Lead',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.leadName || row.customer || 'Prospective Buyer'}</div>
          <div className="text-[11px] text-slate-500">{row.phone || row.mobileNumber || '+1 (555) 782-9012'}</div>
        </div>
      )
    },
    {
      header: 'Project & Budget',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.project || row.preferredLocation || row.flatType || 'Skyline Complex'}</div>
          <div className="text-[11px] text-emerald-700 font-bold">{row.budget}</div>
        </div>
      )
    },
    {
      header: 'Pipeline Stage',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          {row.stage || row.leadStatus || 'Qualified'}
        </span>
      )
    },
    {
      header: 'Financing / Timeline',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.loanRequired || row.purchaseTimeline || 'Immediate'}
        </span>
      )
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedLead(row)}
          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
        >
          View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Display"
        subtitle="Review qualified customer prospect pipelines, stage maturities, and purchasing budgets."
        breadcrumbs={['Skyline CRM', 'Leads', 'Display']}
      />

      <DataTable
        title="Agent-Leads"
        columns={columns}
        data={leads}
        searchPlaceholder="Search lead name, project..."
        filterKey="stage"
        filterOptions={['Initial Discovery', 'Proposal Sent', 'Negotiation', 'Documentation']}
      />

      {/* Modal */}
      {selectedLead && (
        <Modal
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          title={`Lead Profile: ${selectedLead.leadName}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Phone:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedLead.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Email:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedLead.email}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Project:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedLead.project}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Budget:</span>
                <p className="text-emerald-700 font-bold mt-0.5">{selectedLead.budget}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Deal Stage:</span>
                <p className="text-teal-700 font-bold mt-0.5">{selectedLead.stage}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Lead Score:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedLead.score}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLead(null)}
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

import React, { useState } from 'react';
import { Layers, Phone, Mail, DollarSign, Target, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const LeadDisplay = () => {
  const { leads } = useData();
  const [selectedLead, setSelectedLead] = useState(null);

  const columns = [
    {
      header: 'Lead ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '100px'
    },
    {
      header: 'Lead Name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.leadName || row.customer || 'Lead'}</div>
          <div className="text-xs text-slate-500">{row.phone || row.mobileNumber || '+1 (555) 782-9012'} • {row.email || 'client@example.com'}</div>
        </div>
      )
    },
    {
      header: 'Target Project / Unit',
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.project || row.preferredLocation || row.flatType || 'Skyline Complex'}
        </span>
      )
    },
    {
      header: 'Budget',
      render: (row) => (
        <span className="text-xs font-bold text-emerald-700">
          {row.budget}
        </span>
      )
    },
    {
      header: 'Pipeline Stage',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.stage || row.leadStatus || 'Qualified'}
        </span>
      )
    },
    {
      header: 'Financing',
      render: (row) => (
        <span className="text-xs font-bold text-slate-800">
          {row.score || row.loanRequired || 'Pre-approved'}
        </span>
      )
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedLead(row)}
          className="px-2.5 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
        >
          View Lead
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Display"
        subtitle="Review qualified customer prospect pipelines, stage maturities, and purchasing budgets."
        breadcrumbs={['Skyline CRM', 'Enquiries & Leads', 'Lead Display']}
      />

      <DataTable
        title="Lead-Display-Roster"
        columns={columns}
        data={leads}
        searchPlaceholder="Search lead name, project, phone..."
        filterKey="stage"
        filterOptions={['Initial Discovery', 'Proposal Sent', 'Negotiation', 'Documentation']}
        onRowClick={(row) => setSelectedLead(row)}
      />

      {/* View Lead Details Modal */}
      {selectedLead && (
        <Modal
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          title={`Lead Profile: ${selectedLead.leadName}`}
          subtitle={`ID: ${selectedLead.id}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Contact Phone:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedLead.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Email:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedLead.email}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Project & Budget:</span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedLead.project}</p>
                <p className="text-emerald-700 font-bold">{selectedLead.budget}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Conversion Probability:</span>
                <p className="text-brand-700 font-bold mt-0.5">{selectedLead.probability || '70%'}</p>
                <p className="text-slate-600 font-medium">{selectedLead.score}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Current Pipeline Stage:</span>
                <p className="text-indigo-700 font-bold mt-0.5">{selectedLead.stage}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Handled By:</span>
                <p className="text-slate-900 font-medium mt-0.5">{selectedLead.handledBy}</p>
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

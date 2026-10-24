import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, FileCheck, CheckCircle2, Clock,
  AlertCircle, XCircle, FileText, UserCheck, ShieldCheck, FolderCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const DocumentCollectionPage = () => {
  const { documentCollections, addDocumentCollection, updateDocumentCollection, deleteDocumentCollection } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    panCard: 'Pending',
    aadhaarCard: 'Pending',
    passportPhoto: 'Pending',
    addressProof: 'Pending',
    incomeProof: 'Pending',
    bankStatement: 'Pending',
    updatedDate: new Date().toISOString().split('T')[0]
  });

  const calculateOverallStatus = (data) => {
    const docs = [data.panCard, data.aadhaarCard, data.passportPhoto, data.addressProof, data.incomeProof, data.bankStatement];
    const verifiedCount = docs.filter(d => d === 'Verified').length;
    const pct = Math.round((verifiedCount / 6) * 100);
    if (pct === 100) return 'Complete (100%)';
    if (docs.some(d => d === 'Rejected' || d?.includes('Rejected'))) return `Action Required (${pct}%)`;
    return `Pending (${pct}%)`;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please specify Customer Name.', 'error');
      return;
    }

    const overallStatus = calculateOverallStatus(formData);
    const payload = {
      ...formData,
      overallStatus,
      updatedDate: new Date().toISOString().split('T')[0]
    };

    if (editingDoc) {
      updateDocumentCollection(editingDoc.id, payload);
      addToast(`Document KYC docket for ${editingDoc.customer} updated.`, 'success');
      setEditingDoc(null);
    } else {
      const created = addDocumentCollection(payload);
      addToast(`KYC Docket opened for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      panCard: 'Pending',
      aadhaarCard: 'Pending',
      passportPhoto: 'Pending',
      addressProof: 'Pending',
      incomeProof: 'Pending',
      bankStatement: 'Pending',
      updatedDate: new Date().toISOString().split('T')[0]
    });
  };

  const openEditModal = (item) => {
    setEditingDoc(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteDocumentCollection(deletingId);
      addToast('KYC docket removed.', 'info');
      setDeletingId(null);
    }
  };

  const renderDocBadge = (status) => {
    if (status === 'Verified') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Verified
        </span>
      );
    }
    if (status === 'Uploaded') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          <Clock className="w-3 h-3 text-blue-500" />
          Uploaded
        </span>
      );
    }
    if (status?.includes('Rejected')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
        Pending
      </span>
    );
  };

  const columns = [
    {
      header: 'KYC Ref',
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
      header: 'Identity Docs',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600">
            <span>PAN Card:</span>
            {renderDocBadge(row.panCard)}
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600">
            <span>Aadhaar:</span>
            {renderDocBadge(row.aadhaarCard)}
          </div>
        </div>
      )
    },
    {
      header: 'Proof & Financials',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600">
            <span>Address Proof:</span>
            {renderDocBadge(row.addressProof)}
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600">
            <span>Income Proof:</span>
            {renderDocBadge(row.incomeProof)}
          </div>
        </div>
      )
    },
    {
      header: 'Bank Statement',
      render: (row) => renderDocBadge(row.bankStatement)
    },
    {
      header: 'Overall Progress',
      render: (row) => {
        const isComplete = row.overallStatus?.includes('100%');
        const isAction = row.overallStatus?.includes('Action');
        return (
          <Badge variant={isComplete ? 'success' : isAction ? 'danger' : 'warning'}>
            {row.overallStatus}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingDoc(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Inspect KYC Docket"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Update Checklist"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Docket"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalDockets = documentCollections.length;
  const completeDockets = documentCollections.filter(d => d.overallStatus?.includes('100%')).length;
  const pendingDockets = documentCollections.filter(d => !d.overallStatus?.includes('100%')).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Collection & KYC Verification"
        description="Verify mandatory PAN, Aadhaar, address proofs, income proofs, and bank statements for agreement."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Document Collection', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                panCard: 'Pending',
                aadhaarCard: 'Pending',
                passportPhoto: 'Pending',
                addressProof: 'Pending',
                incomeProof: 'Pending',
                bankStatement: 'Pending',
                updatedDate: new Date().toISOString().split('T')[0]
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Open KYC Docket
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Customer Dockets</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalDockets}</div>
          <div className="text-[11px] text-slate-400 mt-1">Booked buyer dossiers</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">100% Verified KYC</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{completeDockets}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for legal registration</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Incomplete / Pending Upload</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingDockets}</div>
          <div className="text-[11px] text-amber-600 mt-1">Action required by compliance desk</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="KYC Compliance Dossier"
        subtitle="Individual document checklist tracking and clearance verification"
        data={documentCollections}
        columns={columns}
        searchPlaceholder="Search customer, KYC ref, or unit..."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingDoc}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDoc(null);
        }}
        title={editingDoc ? `Update KYC Docket: ${editingDoc.customer}` : 'Open New KYC Docket'}
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Allotment</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 804"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Mandatory KYC Checklist Verification</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">1. PAN Card</label>
                <select
                  value={formData.panCard}
                  onChange={(e) => setFormData({ ...formData, panCard: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Verified">Verified</option>
                  <option value="Uploaded">Uploaded</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected (Invalid)">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Aadhaar Card</label>
                <select
                  value={formData.aadhaarCard}
                  onChange={(e) => setFormData({ ...formData, aadhaarCard: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Verified">Verified</option>
                  <option value="Uploaded">Uploaded</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Passport Photo</label>
                <select
                  value={formData.passportPhoto}
                  onChange={(e) => setFormData({ ...formData, passportPhoto: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Verified">Verified</option>
                  <option value="Uploaded">Uploaded</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Address Proof (Utility / DL)</label>
                <select
                  value={formData.addressProof}
                  onChange={(e) => setFormData({ ...formData, addressProof: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Verified">Verified</option>
                  <option value="Uploaded">Uploaded</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected (Blurry)">Rejected (Blurry)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">5. Income Proof (ITR / Form 16)</label>
                <select
                  value={formData.incomeProof}
                  onChange={(e) => setFormData({ ...formData, incomeProof: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Verified">Verified</option>
                  <option value="Uploaded">Uploaded</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">6. Bank Statement (6 Months)</label>
                <select
                  value={formData.bankStatement}
                  onChange={(e) => setFormData({ ...formData, bankStatement: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Verified">Verified</option>
                  <option value="Uploaded">Uploaded</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingDoc(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingDoc ? 'Update KYC Docket' : 'Save KYC Docket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingDoc && (
        <Modal
          isOpen={true}
          onClose={() => setViewingDoc(null)}
          title={`KYC Docket: ${viewingDoc.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Dossier ID</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingDoc.id}</div>
              </div>
              <Badge variant={viewingDoc.overallStatus?.includes('100%') ? 'success' : 'warning'}>
                {viewingDoc.overallStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingDoc.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Unit Number</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingDoc.unitNumber}</p>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Document Audit Status</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>PAN Card</span>
                  {renderDocBadge(viewingDoc.panCard)}
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Aadhaar Card</span>
                  {renderDocBadge(viewingDoc.aadhaarCard)}
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Passport Photo</span>
                  {renderDocBadge(viewingDoc.passportPhoto)}
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Address Proof</span>
                  {renderDocBadge(viewingDoc.addressProof)}
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Income Proof</span>
                  {renderDocBadge(viewingDoc.incomeProof)}
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Bank Statement</span>
                  {renderDocBadge(viewingDoc.bankStatement)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
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
        title="Delete KYC Docket"
        message="Are you sure you want to remove this KYC document verification docket?"
      />
    </div>
  );
};

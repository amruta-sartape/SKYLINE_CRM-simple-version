import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, FileSignature, CheckCircle2, Clock,
  Stamp, Landmark, Calendar, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AgreementPage = () => {
  const { agreements, addAgreement, updateAgreement, deleteAgreement } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAgr, setEditingAgr] = useState(null);
  const [viewingAgr, setViewingAgr] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    agreementDate: new Date().toISOString().split('T')[0],
    stampDuty: '$20,400 (6%)',
    registrationDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    registrationNumber: 'REG-NY-2025-0000',
    subRegistrarOffice: 'District Central Sub-Registrar Office',
    status: 'Draft Generated'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please enter Customer Name.', 'error');
      return;
    }

    if (editingAgr) {
      updateAgreement(editingAgr.id, formData);
      addToast(`Sale Agreement ${editingAgr.id} updated.`, 'success');
      setEditingAgr(null);
    } else {
      const created = addAgreement(formData);
      addToast(`Agreement registered for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      agreementDate: new Date().toISOString().split('T')[0],
      stampDuty: '$20,400 (6%)',
      registrationDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      registrationNumber: 'REG-NY-2025-0000',
      subRegistrarOffice: 'District Central Sub-Registrar Office',
      status: 'Draft Generated'
    });
  };

  const openEditModal = (item) => {
    setEditingAgr(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteAgreement(deletingId);
      addToast('Agreement record removed.', 'info');
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Signed & Stamped':
      case 'Registered':
        return 'success';
      case 'In Sub-Registrar Office':
        return 'warning';
      case 'Draft Generated':
      default:
        return 'brand';
    }
  };

  const columns = [
    {
      header: 'Agreement Ref',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-700',
      width: '110px'
    },
    {
      header: 'Customer & Allotted Flat',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500 font-semibold">{row.unitNumber}</div>
        </div>
      )
    },
    {
      header: 'Stamp Duty & Fees',
      render: (row) => (
        <div>
          <div className="text-xs font-extrabold text-emerald-700">{row.stampDuty}</div>
          <div className="text-[10px] text-slate-400">Date: {row.agreementDate}</div>
        </div>
      )
    },
    {
      header: 'Govt Registration No',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-semibold text-slate-800">{row.registrationNumber}</div>
          <div className="text-[10px] text-slate-500">{row.subRegistrarOffice}</div>
        </div>
      )
    },
    {
      header: 'Registration Date',
      accessor: 'registrationDate',
      cellClassName: 'text-xs text-slate-600'
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
            onClick={() => setViewingAgr(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Deed Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Agreement"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Agreement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const stampedCount = agreements.filter(a => a.status === 'Signed & Stamped').length;
  const inRegistrarCount = agreements.filter(a => a.status === 'In Sub-Registrar Office').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agreement for Sale & Deed Registration"
        description="Formalize registered sale deed documentation, government stamp duties, and sub-registrar filings."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Agreement', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                agreementDate: new Date().toISOString().split('T')[0],
                stampDuty: '$20,400 (6%)',
                registrationDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
                registrationNumber: 'REG-NY-2025-0000',
                subRegistrarOffice: 'District Central Sub-Registrar Office',
                status: 'Draft Generated'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Draft Sale Agreement
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Legal Agreements</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{agreements.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Sale deeds in registry</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Signed & Stamped</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{stampedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Legally binding executed contracts</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">In Sub-Registrar Queue</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{inRegistrarCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Pending biometric appointment</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Sale Deeds & Government Registrations"
        subtitle="Manage official bilateral agreements and legal title transfers"
        data={agreements}
        columns={columns}
        searchPlaceholder="Search customer, registration number, or unit..."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingAgr}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAgr(null);
        }}
        title={editingAgr ? `Edit Agreement: ${editingAgr.customer}` : 'Draft New Sale Agreement'}
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
                placeholder="e.g. Victoria Sterling"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Description</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 1201 (Skyline Grandeur)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Agreement Date</label>
              <input
                type="date"
                value={formData.agreementDate}
                onChange={(e) => setFormData({ ...formData, agreementDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Stamp Duty Amount & Rate</label>
              <input
                type="text"
                value={formData.stampDuty}
                onChange={(e) => setFormData({ ...formData, stampDuty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. $34,800 (6%)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Govt Registration Number</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. REG-NY-2025-99812"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Registration Date</label>
              <input
                type="date"
                value={formData.registrationDate}
                onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sub-Registrar Jurisdiction</label>
              <input
                type="text"
                value={formData.subRegistrarOffice}
                onChange={(e) => setFormData({ ...formData, subRegistrarOffice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. District Central Sub-Registrar"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Execution Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Draft Generated">Draft Generated</option>
                <option value="Signed & Stamped">Signed & Stamped</option>
                <option value="In Sub-Registrar Office">In Sub-Registrar Office</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingAgr(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingAgr ? 'Update Deed' : 'Generate Agreement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingAgr && (
        <Modal
          isOpen={true}
          onClose={() => setViewingAgr(null)}
          title={`Sale Deed Summary: ${viewingAgr.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Deed Docket #</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingAgr.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingAgr.status)}>
                {viewingAgr.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Purchaser</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingAgr.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Property Unit</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingAgr.unitNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Stamp Duty Paid</span>
                <p className="font-bold text-emerald-700 mt-0.5">{viewingAgr.stampDuty}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Signing Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingAgr.agreementDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Govt Registry ID</span>
                <p className="font-mono font-bold text-brand-700 mt-0.5">{viewingAgr.registrationNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Registry Authority</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingAgr.subRegistrarOffice}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingAgr(null)}
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
        title="Delete Agreement Record"
        message="Are you sure you want to delete this agreement deed record?"
      />
    </div>
  );
};

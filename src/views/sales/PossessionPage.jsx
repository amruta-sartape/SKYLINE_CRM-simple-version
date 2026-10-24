import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, Key, CheckCircle2, Clock,
  Sparkles, ShieldCheck, FileCheck, Zap, Home, Calendar
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const PossessionPage = () => {
  const { possessions, addPossession, updatePossession, deletePossession } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [viewingPos, setViewingPos] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    unitNumber: 'Unit 402',
    projectName: 'Skyline Heights',
    handoverDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    finalInspection: 'Completed (Passed)',
    utilityConnection: 'Electricity & Water Meter Active',
    keyHandover: 'Ready at Sales Pavilion',
    possessionLetter: 'Draft Generated',
    status: 'Ready'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      addToast('Please specify Customer Name.', 'error');
      return;
    }

    if (editingPos) {
      updatePossession(editingPos.id, formData);
      addToast(`Possession handover for ${editingPos.customer} updated.`, 'success');
      setEditingPos(null);
    } else {
      const created = addPossession(formData);
      addToast(`Possession scheduled for ${created.customer}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customer: '',
      unitNumber: 'Unit 402',
      projectName: 'Skyline Heights',
      handoverDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      finalInspection: 'Completed (Passed)',
      utilityConnection: 'Electricity & Water Meter Active',
      keyHandover: 'Ready at Sales Pavilion',
      possessionLetter: 'Draft Generated',
      status: 'Ready'
    });
  };

  const openEditModal = (item) => {
    setEditingPos(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deletePossession(deletingId);
      addToast('Possession record removed.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Possession Ref',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-700',
      width: '110px'
    },
    {
      header: 'Owner & Flat',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer}</div>
          <div className="text-[10px] text-slate-500 font-semibold">{row.unitNumber} ({row.projectName || 'Skyline Complex'})</div>
        </div>
      )
    },
    {
      header: 'Handover Date',
      accessor: 'handoverDate',
      cellClassName: 'text-xs font-semibold text-slate-800'
    },
    {
      header: 'Checklist Verification',
      render: (row) => (
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center gap-1 text-slate-600">
            <span className="font-medium">1. Inspection:</span>
            <span className="text-emerald-700 font-semibold">{row.finalInspection}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <span className="font-medium">2. Utilities:</span>
            <span className="text-blue-700 font-semibold">{row.utilityConnection}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Keys & Letter Status',
      render: (row) => (
        <div className="space-y-1 text-[10px]">
          <div className="text-slate-700 font-medium">Key: <span className="font-semibold">{row.keyHandover}</span></div>
          <div className="text-slate-700 font-medium">Deed: <span className="font-semibold text-brand-700">{row.possessionLetter}</span></div>
        </div>
      )
    },
    {
      header: 'Possession Status',
      render: (row) => (
        <Badge variant={row.status === 'Delivered' ? 'success' : 'brand'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingPos(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Inspect Handover Dossier"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Update Status"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Possession Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const deliveredCount = possessions.filter(p => p.status === 'Delivered').length;
  const readyCount = possessions.filter(p => p.status === 'Ready').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Possession & Key Handover Management"
        description="Verify pre-delivery snag inspection, utility meters, physical key handover, and possession deed."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Possession', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                customer: '',
                unitNumber: 'Unit 402',
                projectName: 'Skyline Heights',
                handoverDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                finalInspection: 'Completed (Passed)',
                utilityConnection: 'Electricity & Water Meter Active',
                keyHandover: 'Ready at Sales Pavilion',
                possessionLetter: 'Draft Generated',
                status: 'Ready'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Key Handover
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Possession Dossiers</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{possessions.length} Units</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready or delivered handovers</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Delivered & Occupied</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{deliveredCount} Units</div>
          <div className="text-[11px] text-emerald-600 mt-1">Keys & letter delivered to owner</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Ready for Handover</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{readyCount} Units</div>
          <div className="text-[11px] text-blue-600 mt-1">Snag clearance complete</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Possession & Delivery Registry"
        subtitle="Manage end-to-end buyer property handover checklist and certifications"
        data={possessions}
        columns={columns}
        searchPlaceholder="Search customer, unit number, or project..."
        filterKey="status"
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Delivered', value: 'Delivered' },
          { label: 'Ready', value: 'Ready' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingPos}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPos(null);
        }}
        title={editingPos ? `Update Handover: ${editingPos.customer}` : 'Schedule Key Handover'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer / Owner *</label>
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Allotment</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 1201"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project Name</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Handover Date</label>
              <input
                type="date"
                value={formData.handoverDate}
                onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Handover Checklist Verification</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Final Inspection & Snags</label>
                <input
                  type="text"
                  value={formData.finalInspection}
                  onChange={(e) => setFormData({ ...formData, finalInspection: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Utility Connection</label>
                <input
                  type="text"
                  value={formData.utilityConnection}
                  onChange={(e) => setFormData({ ...formData, utilityConnection: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Key Handover</label>
                <input
                  type="text"
                  value={formData.keyHandover}
                  onChange={(e) => setFormData({ ...formData, keyHandover: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Possession Letter</label>
                <input
                  type="text"
                  value={formData.possessionLetter}
                  onChange={(e) => setFormData({ ...formData, possessionLetter: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Overall Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            >
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingPos(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingPos ? 'Update Possession' : 'Schedule Possession'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingPos && (
        <Modal
          isOpen={true}
          onClose={() => setViewingPos(null)}
          title={`Possession Sign-off: ${viewingPos.customer}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Handover Protocol #</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingPos.id}</div>
              </div>
              <Badge variant={viewingPos.status === 'Delivered' ? 'success' : 'brand'}>
                {viewingPos.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Owner</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingPos.customer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Unit Number</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingPos.unitNumber} ({viewingPos.projectName})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Handover Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingPos.handoverDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Inspection Protocol</span>
                <p className="font-semibold text-emerald-700 mt-0.5">{viewingPos.finalInspection}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Utility Activation</span>
                <p className="font-semibold text-blue-700 mt-0.5">{viewingPos.utilityConnection}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Key Handover</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingPos.keyHandover}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Possession letter signed and physical possession certificate granted.</span>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingPos(null)}
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
        title="Delete Possession Dossier"
        message="Are you sure you want to delete this possession handover record?"
      />
    </div>
  );
};

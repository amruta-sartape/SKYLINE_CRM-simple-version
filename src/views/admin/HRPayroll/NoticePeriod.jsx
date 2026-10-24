import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  ShieldCheck,
  UserX,
  FileCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';

export const NoticePeriod = () => {
  const { noticePeriods, addNoticePeriod, updateNoticePeriod, deleteNoticePeriod, employees } = useData();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [selectedLetterEmp, setSelectedLetterEmp] = useState(null);

  const initialForm = {
    employeeName: employees[0]?.fullName || 'Devon Miller',
    resignationDate: new Date().toISOString().split('T')[0],
    noticeDuration: '30 Days',
    lastWorkingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    handoverStatus: 'In Progress (Handing over site blueprints)',
    assetClearance: 'Pending',
    financeClearance: 'Pending',
    hrClearance: 'Pending',
    status: 'Serving Notice',
    notes: 'Transitioning active responsibilities'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ntc) => {
    setEditingNotice(ntc);
    setFormData({ ...ntc });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x.fullName === formData.employeeName);
    const payload = {
      ...formData,
      employeeId: emp ? emp.id : 'EMP-01',
      employeeCode: emp ? emp.code : 'SKY-EMP-101',
      department: emp ? emp.department : 'General',
      designation: emp ? emp.designation : 'Staff'
    };

    if (editingNotice) {
      updateNoticePeriod(editingNotice.id, payload);
      addToast(`Notice period record updated for ${formData.employeeName}`, 'success');
    } else {
      addNoticePeriod(payload);
      addToast(`Notice period registered for ${formData.employeeName}`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleMarkRelieved = (row) => {
    updateNoticePeriod(row.id, {
      status: 'Relieved',
      assetClearance: 'Approved',
      financeClearance: 'Approved',
      hrClearance: 'Approved'
    });
    addToast(`Employee ${row.employeeName} marked as Relieved with all clearances approved.`, 'success');
  };

  const columns = [
    {
      header: 'Employee Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500 font-mono">{row.employeeCode} • {row.department}</div>
        </div>
      )
    },
    {
      header: 'Resignation Date',
      accessor: 'resignationDate',
      cellClassName: 'text-xs font-mono text-slate-700'
    },
    {
      header: 'Notice Duration',
      accessor: 'noticeDuration',
      cellClassName: 'text-xs font-semibold text-slate-800'
    },
    {
      header: 'Last Working Day',
      render: (row) => (
        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {row.lastWorkingDate}
        </span>
      )
    },
    {
      header: 'Clearance Approvals',
      render: (row) => (
        <div className="text-[11px] space-y-0.5">
          <div>Asset: <strong className={row.assetClearance === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}>{row.assetClearance}</strong></div>
          <div>Finance: <strong className={row.financeClearance === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}>{row.financeClearance}</strong></div>
          <div>HR: <strong className={row.hrClearance === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}>{row.hrClearance}</strong></div>
        </div>
      )
    },
    {
      header: 'Notice Status',
      render: (row) => (
        <Badge variant={row.status === 'Relieved' ? 'default' : 'warning'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'Serving Notice' && (
            <button
              onClick={() => handleMarkRelieved(row)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
              title="Issue Relieving & Clearances"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Relieve</span>
            </button>
          )}
          <button
            onClick={() => setSelectedLetterEmp(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded"
            title="View Relieving Certificate"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded"
            title="Edit Notice Record"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteNoticePeriod(row.id);
              addToast('Notice period record removed.', 'info');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            title="Delete Record"
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
        title="Notice Period & Relieving Management"
        subtitle="Manage employee resignation workflows, handover milestones, multi-department clearances (IT, Accounts, HR), and formal relieving certificates."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Notice Period']}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Resignation</span>
          </button>
        }
      />

      <DataTable
        title="Employee-Notice-Period-Register"
        columns={columns}
        data={noticePeriods}
        searchPlaceholder="Search employee, designation, clearance status..."
        filterKey="status"
        filterOptions={['Serving Notice', 'Relieved']}
      />

      {/* Add / Edit Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotice ? 'Update Notice Period' : 'Register Resignation & Notice Period'}
        subtitle="Specify resignation date, notice duration, and handover checklist."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee *</label>
            <select
              value={formData.employeeName}
              onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.fullName}>
                  {emp.fullName} ({emp.code}) — {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resignation Date *</label>
              <input
                type="date"
                required
                value={formData.resignationDate}
                onChange={(e) => setFormData({ ...formData, resignationDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Duration</label>
              <select
                value={formData.noticeDuration}
                onChange={(e) => {
                  const days = parseInt(e.target.value, 10) || 30;
                  const resDate = new Date(formData.resignationDate);
                  const lastDay = new Date(resDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setFormData({
                    ...formData,
                    noticeDuration: e.target.value,
                    lastWorkingDate: lastDay
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="30 Days">30 Days (Standard Staff)</option>
                <option value="60 Days">60 Days (Management / Lead)</option>
                <option value="90 Days">90 Days (Executive Director)</option>
                <option value="Immediate Relieving">Immediate Relieving (Buyout / Waiver)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Calculated Last Working Date *</label>
            <input
              type="date"
              required
              value={formData.lastWorkingDate}
              onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-rose-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Handover Task Status</label>
            <input
              type="text"
              value={formData.handoverStatus}
              onChange={(e) => setFormData({ ...formData, handoverStatus: e.target.value })}
              placeholder="e.g. In Progress (Handing over project documents to team)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Asset Clearance</label>
              <select
                value={formData.assetClearance}
                onChange={(e) => setFormData({ ...formData, assetClearance: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Finance Clearance</label>
              <select
                value={formData.financeClearance}
                onChange={(e) => setFormData({ ...formData, financeClearance: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">HR Clearance</label>
              <select
                value={formData.hrClearance}
                onChange={(e) => setFormData({ ...formData, hrClearance: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
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
              {editingNotice ? 'Update Record' : 'Register Notice Period'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Relieving Certificate Modal */}
      {selectedLetterEmp && (
        <Modal
          isOpen={Boolean(selectedLetterEmp)}
          onClose={() => setSelectedLetterEmp(null)}
          title="Relieving & Experience Certificate Preview"
          subtitle={`Skyline CRM HR Clearance — ${selectedLetterEmp.employeeName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-6 bg-white border border-slate-300 rounded-xl space-y-4 text-slate-800">
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="text-base font-black text-slate-900 tracking-tight">SKYLINE CRM</h3>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Corporate Human Resources Division</p>
                <p className="text-[10px] text-slate-400">Skyline Tower, Financial District</p>
              </div>

              <div className="text-center font-bold text-sm text-slate-900 underline">
                TO WHOMSOEVER IT MAY CONCERN
              </div>

              <p className="leading-relaxed">
                This is to certify that <strong>{selectedLetterEmp.employeeName}</strong> (Employee Code: <strong>{selectedLetterEmp.employeeCode}</strong>) was employed with Skyline CRM in the <strong>{selectedLetterEmp.department}</strong> department as <strong>{selectedLetterEmp.designation}</strong>.
              </p>

              <p className="leading-relaxed">
                The employee tendered their resignation on <strong>{selectedLetterEmp.resignationDate}</strong> and has successfully completed their notice period. Their official last working day is <strong>{selectedLetterEmp.lastWorkingDate}</strong>.
              </p>

              <p className="leading-relaxed">
                All organizational assets, company documents, and financial dues have been reconciled and cleared across IT, Finance, and Human Resources. We wish them success in their future endeavors.
              </p>

              <div className="pt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400">Date: {new Date().toISOString().split('T')[0]}</p>
                </div>
                <div className="text-right">
                  <div className="h-8 border-b border-slate-300 w-36 ml-auto"></div>
                  <strong className="text-slate-900 block mt-1">Authorized Signatory</strong>
                  <span className="text-[10px] text-slate-500">Skyline CRM HR Directorate</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLetterEmp(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

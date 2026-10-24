import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Search,
  Award
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';

export const InterviewManager = () => {
  const { interviews, addInterview, updateInterview, deleteInterview, employees } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('display'); // 'display', 'schedule', 'results'
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [evaluatingInterview, setEvaluatingInterview] = useState(null);

  const initialForm = {
    candidateName: '',
    email: '',
    phone: '',
    position: 'Senior Sales Relationship Manager',
    department: 'Sales & Marketing',
    interviewDate: new Date().toISOString().split('T')[0],
    interviewTime: '11:00 AM',
    round: 'Technical & Sales Pitch',
    interviewer: employees[0]?.fullName || 'Sarah Jenkins',
    status: 'Scheduled',
    result: 'Pending Evaluation',
    feedback: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [evalResult, setEvalResult] = useState({
    status: 'Selected',
    result: 'Offer Letter Issued',
    feedback: ''
  });

  const handleOpenSchedule = () => {
    setEditingInterview(null);
    setFormData(initialForm);
    setIsScheduleModalOpen(true);
  };

  const handleOpenEdit = (intv) => {
    setEditingInterview(intv);
    setFormData({
      candidateName: intv.candidateName,
      email: intv.email,
      phone: intv.phone,
      position: intv.position,
      department: intv.department,
      interviewDate: intv.interviewDate,
      interviewTime: intv.interviewTime,
      round: intv.round,
      interviewer: intv.interviewer,
      status: intv.status,
      result: intv.result,
      feedback: intv.feedback || ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!formData.candidateName.trim() || !formData.email.trim()) {
      addToast('Please provide candidate name and email address.', 'error');
      return;
    }

    if (editingInterview) {
      updateInterview(editingInterview.id, formData);
      addToast(`Interview schedule updated for ${formData.candidateName}`, 'success');
    } else {
      const created = addInterview(formData);
      addToast(`Interview scheduled for ${created.candidateName} on ${created.interviewDate}`, 'success');
    }

    setIsScheduleModalOpen(false);
    setEditingInterview(null);
  };

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    if (evaluatingInterview) {
      updateInterview(evaluatingInterview.id, {
        status: evalResult.status,
        result: evalResult.result,
        feedback: evalResult.feedback
      });
      addToast(`Interview evaluation recorded for ${evaluatingInterview.candidateName}`, 'success');
      setEvaluatingInterview(null);
    }
  };

  // Metrics
  const totalScheduled = interviews.filter((i) => i.status === 'Scheduled').length;
  const totalSelected = interviews.filter((i) => i.status === 'Selected').length;
  const totalShortlisted = interviews.filter((i) => i.status === 'Shortlisted').length;

  const columns = [
    {
      header: 'Candidate Name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.candidateName}</div>
          <div className="text-xs text-slate-500">{row.email} • {row.phone}</div>
        </div>
      )
    },
    {
      header: 'Position & Dept',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.position}</div>
          <div className="text-[11px] text-slate-500">{row.department}</div>
        </div>
      )
    },
    {
      header: 'Interview Schedule',
      render: (row) => (
        <div className="text-xs">
          <div className="font-mono font-bold text-brand-700">{row.interviewDate}</div>
          <div className="text-slate-500">{row.interviewTime}</div>
        </div>
      )
    },
    {
      header: 'Interview Round',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.round}
        </span>
      )
    },
    {
      header: 'Assigned Interviewer',
      accessor: 'interviewer',
      cellClassName: 'text-xs font-semibold text-slate-700'
    },
    {
      header: 'Status & Result',
      render: (row) => (
        <div>
          <Badge
            variant={
              row.status === 'Selected'
                ? 'success'
                : row.status === 'Rejected'
                ? 'error'
                : row.status === 'Shortlisted'
                ? 'warning'
                : 'default'
            }
          >
            {row.status}
          </Badge>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">{row.result}</div>
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setEvaluatingInterview(row);
              setEvalResult({
                status: row.status || 'Selected',
                result: row.result || 'Offer Letter Issued',
                feedback: row.feedback || ''
              });
            }}
            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Interview Result / Evaluation"
          >
            <Award className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
            title="Update Interview"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              deleteInterview(row.id);
              addToast('Interview record removed.', 'info');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Interview"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment & Interview Management"
        subtitle="Schedule candidate interviews, record panel assessments, update hiring statuses, and issue offer decisions."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Interview Schedule']}
        actions={
          <button
            onClick={handleOpenSchedule}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Interview</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Interviews</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{interviews.length}</div>
            <span className="text-xs text-slate-500 font-medium">In pipeline</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Schedule</span>
            <div className="text-2xl font-black text-brand-700 mt-1">{totalScheduled}</div>
            <span className="text-xs text-slate-500 font-medium">Pending rounds</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shortlisted</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{totalShortlisted}</div>
            <span className="text-xs text-slate-500 font-medium">Next round ready</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hired & Offers</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{totalSelected}</div>
            <span className="text-xs text-slate-500 font-medium">Offers released</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Interview Table */}
      <DataTable
        title="Candidate-Interview-Roster"
        columns={columns}
        data={interviews}
        searchPlaceholder="Search candidate, position, interviewer, status..."
        filterKey="status"
        filterOptions={['Scheduled', 'Shortlisted', 'Selected', 'Rejected']}
      />

      {/* Schedule / Update Interview Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={editingInterview ? 'Update Interview Schedule' : 'Schedule Candidate Interview'}
        subtitle="Set candidate details, target job designation, interview round, and panel lead."
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Full Name *</label>
              <input
                type="text"
                required
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                placeholder="e.g. Ananya Iyer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ananya.i@gmail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98450 11223"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
                <option value="CRM & Customer Relations">CRM & Customer Relations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation Position *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Senior Sales Relationship Manager"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interview Round *</label>
              <select
                value={formData.round}
                onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Initial HR Screening">Initial HR Screening</option>
                <option value="Technical & Sales Pitch">Technical & Sales Pitch</option>
                <option value="Managerial & Case Study">Managerial & Case Study</option>
                <option value="Final Director Round">Final Director Round</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date *</label>
              <input
                type="date"
                required
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
              <input
                type="text"
                required
                value={formData.interviewTime}
                onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                placeholder="11:30 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Panel Lead *</label>
              <select
                value={formData.interviewer}
                onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.fullName}>
                    {emp.fullName} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Profile Notes</label>
            <textarea
              rows={2}
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              placeholder="e.g. 4 years of real estate experience in premium residential projects..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              {editingInterview ? 'Update Schedule' : 'Confirm Interview'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Interview Result / Evaluation Modal */}
      {evaluatingInterview && (
        <Modal
          isOpen={Boolean(evaluatingInterview)}
          onClose={() => setEvaluatingInterview(null)}
          title="Interview Evaluation & Result Decision"
          subtitle={`${evaluatingInterview.candidateName} — ${evaluatingInterview.position}`}
        >
          <form onSubmit={handleSaveEvaluation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Evaluation Decision *</label>
                <select
                  value={evalResult.status}
                  onChange={(e) => setEvalResult({ ...evalResult, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Selected">Selected</option>
                  <option value="Shortlisted">Shortlisted for Next Round</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hiring Action / Result Status</label>
                <select
                  value={evalResult.result}
                  onChange={(e) => setEvalResult({ ...evalResult, result: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Offer Letter Issued">Offer Letter Issued</option>
                  <option value="Pending Salary Negotiation">Pending Salary Negotiation</option>
                  <option value="Shortlisted for Final Round">Shortlisted for Final Round</option>
                  <option value="Not Qualified for Role">Not Qualified for Role</option>
                  <option value="Profile Kept in Talent Pool">Profile Kept in Talent Pool</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interviewer Feedback & Score</label>
              <textarea
                rows={3}
                value={evalResult.feedback}
                onChange={(e) => setEvalResult({ ...evalResult, feedback: e.target.value })}
                placeholder="Candidate performed exceptionally well during sales pitch and mock objection handling..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEvaluatingInterview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
              >
                Record Evaluation Decision
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

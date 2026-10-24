import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Users,
  Building,
  CheckCircle2,
  Trash2,
  Edit,
  FileText,
  MapPin
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';

export const MeetingSchedule = () => {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, employees } = useData();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const initialForm = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM - 12:00 PM',
    room: 'Executive Boardroom A',
    department: 'All Departments',
    organizer: employees[0]?.fullName || 'Sarah Jenkins',
    attendees: 'Sales & Project Engineering Leads',
    agenda: '',
    status: 'Scheduled'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingMeeting(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mtg) => {
    setEditingMeeting(mtg);
    setFormData({ ...mtg });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.agenda.trim()) {
      addToast('Please provide meeting title and agenda outline.', 'error');
      return;
    }

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, formData);
      addToast(`Meeting "${formData.title}" updated.`, 'success');
    } else {
      addMeeting(formData);
      addToast(`Meeting "${formData.title}" scheduled.`, 'success');
    }

    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Meeting Title & Agenda',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.agenda}</div>
        </div>
      )
    },
    {
      header: 'Date & Time',
      render: (row) => (
        <div className="text-xs">
          <div className="font-mono font-bold text-brand-700">{row.date}</div>
          <div className="text-slate-500 font-medium">{row.time}</div>
        </div>
      )
    },
    {
      header: 'Conference Venue',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{row.room}</span>
        </span>
      )
    },
    {
      header: 'Organizer & Dept',
      render: (row) => (
        <div className="text-xs">
          <div className="font-bold text-slate-900">{row.organizer}</div>
          <div className="text-slate-500">{row.department}</div>
        </div>
      )
    },
    {
      header: 'Attendees',
      accessor: 'attendees',
      cellClassName: 'text-xs text-slate-600 truncate max-w-xs'
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Scheduled' ? 'success' : row.status === 'Completed' ? 'default' : 'warning'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded"
            title="Edit Meeting"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteMeeting(row.id);
              addToast('Meeting removed.', 'info');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            title="Delete Meeting"
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
        title="Internal Meeting & Conference Schedule"
        subtitle="Organize departmental synchronization conferences, site engineering updates, project audits, and client deal alignments."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Meeting Schedule']}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        }
      />

      <DataTable
        title="Corporate-Meeting-Calendar"
        columns={columns}
        data={meetings}
        searchPlaceholder="Search meeting title, room, organizer, agenda..."
        filterKey="department"
        filterOptions={['All Departments', 'Sales & Marketing', 'Civil & Infrastructure', 'Finance & Accounts']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMeeting ? 'Update Scheduled Meeting' : 'Schedule New Team Meeting'}
        subtitle="Set meeting room, attendees, date & time, and discussion agenda points."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Tower B Structural Casting Review"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="10:00 AM - 11:30 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Conference Room / Location</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Executive Boardroom A"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="All Departments">All Departments</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organizer Lead</label>
              <select
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.fullName}>
                    {emp.fullName} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Invited Attendees / Teams</label>
              <input
                type="text"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                placeholder="e.g. Sales Team, Site Engineers"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Agenda & Deliverables *</label>
            <textarea
              rows={3}
              required
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="e.g. Review token clearances, slab casting schedules, and vendor payment approvals..."
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
              {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

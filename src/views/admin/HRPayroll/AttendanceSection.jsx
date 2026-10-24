import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Users,
  CalendarDays,
  FileCheck,
  Timer,
  Filter,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';

export const AttendanceSection = () => {
  const {
    employees,
    attendance,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    leaves,
    addLeave,
    updateLeave,
    deleteLeave,
    overtimes,
    addOvertime,
    updateOvertime,
    deleteOvertime,
    holidays,
    addHoliday,
    deleteHoliday
  } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'leaves', 'overtime', 'holidays'

  // Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);

  // Forms
  const [attForm, setAttForm] = useState({
    employeeName: employees[0]?.fullName || 'Sarah Jenkins',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    remarks: 'Regular scheduled shift'
  });

  const [leaveForm, setLeaveForm] = useState({
    employeeName: employees[0]?.fullName || 'Sarah Jenkins',
    leaveType: 'Casual Leave',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    numDays: 1,
    reason: 'Personal family matters'
  });

  const [otForm, setOtForm] = useState({
    employeeName: employees[0]?.fullName || 'Devon Miller',
    date: new Date().toISOString().split('T')[0],
    hours: 2.5,
    reason: 'Site supervision & project client inspection'
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    day: 'Monday',
    type: 'National Holiday',
    description: ''
  });

  // Handlers
  const handleSaveAttendance = (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x.fullName === attForm.employeeName);
    addAttendance({
      ...attForm,
      employeeId: emp ? emp.id : 'EMP-01',
      employeeCode: emp ? emp.code : 'SKY-EMP-101',
      department: emp ? emp.department : 'General'
    });
    addToast(`Attendance recorded for ${attForm.employeeName} (${attForm.status})`, 'success');
    setIsAttendanceModalOpen(false);
  };

  const handleSaveLeave = (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x.fullName === leaveForm.employeeName);
    addLeave({
      ...leaveForm,
      numDays: Number(leaveForm.numDays) || 1,
      employeeId: emp ? emp.id : 'EMP-01',
      employeeCode: emp ? emp.code : 'SKY-EMP-101',
      department: emp ? emp.department : 'General'
    });
    addToast(`Leave request submitted for ${leaveForm.employeeName}`, 'success');
    setIsLeaveModalOpen(false);
  };

  const handleSaveOvertime = (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x.fullName === otForm.employeeName);
    addOvertime({
      ...otForm,
      hours: Number(otForm.hours) || 1,
      employeeId: emp ? emp.id : 'EMP-01',
      employeeCode: emp ? emp.code : 'SKY-EMP-101',
      department: emp ? emp.department : 'General'
    });
    addToast(`Overtime logged for ${otForm.employeeName}`, 'success');
    setIsOvertimeModalOpen(false);
  };

  const handleSaveHoliday = (e) => {
    e.preventDefault();
    if (!holidayForm.name.trim()) {
      addToast('Please enter holiday name.', 'error');
      return;
    }
    addHoliday(holidayForm);
    addToast(`Holiday "${holidayForm.name}" added to calendar.`, 'success');
    setIsHolidayModalOpen(false);
    setHolidayForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      day: 'Monday',
      type: 'National Holiday',
      description: ''
    });
  };

  // Metrics
  const totalPresentToday = attendance.filter((a) => a.status === 'Present').length;
  const totalAbsentToday = attendance.filter((a) => a.status === 'Absent').length;
  const totalLeavesToday = attendance.filter((a) => a.status === 'Leave' || a.status === 'Half Day').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;

  // Columns for Daily Attendance
  const attendanceColumns = [
    {
      header: 'Date',
      accessor: 'date',
      cellClassName: 'font-mono text-xs text-slate-700 font-semibold',
      width: '110px'
    },
    {
      header: 'Employee Name & Code',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.employeeName}</div>
          <div className="text-xs font-mono text-slate-500">{row.employeeCode} • {row.department}</div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'Present'
              ? 'success'
              : row.status === 'Absent'
              ? 'error'
              : row.status === 'Half Day'
              ? 'warning'
              : 'default'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Check-In',
      accessor: 'checkIn',
      cellClassName: 'text-xs font-mono text-slate-700'
    },
    {
      header: 'Check-Out',
      accessor: 'checkOut',
      cellClassName: 'text-xs font-mono text-slate-700'
    },
    {
      header: 'Total Hours',
      accessor: 'totalHours',
      cellClassName: 'text-xs font-bold text-slate-800'
    },
    {
      header: 'Shift Remarks',
      accessor: 'remarks',
      cellClassName: 'text-xs text-slate-500 truncate max-w-xs'
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => {
            deleteAttendance(row.id);
            addToast('Attendance record deleted.', 'info');
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          title="Delete Record"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  // Columns for Leaves
  const leaveColumns = [
    {
      header: 'Employee Name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500 font-mono">{row.employeeCode}</div>
        </div>
      )
    },
    {
      header: 'Leave Type',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.leaveType}
        </span>
      )
    },
    {
      header: 'From Date',
      accessor: 'fromDate',
      cellClassName: 'text-xs font-mono text-slate-700'
    },
    {
      header: 'To Date',
      accessor: 'toDate',
      cellClassName: 'text-xs font-mono text-slate-700'
    },
    {
      header: 'Days',
      render: (row) => <span className="text-xs font-bold text-slate-900">{row.numDays} Days</span>
    },
    {
      header: 'Reason',
      accessor: 'reason',
      cellClassName: 'text-xs text-slate-600 truncate max-w-xs'
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'Approved'
              ? 'success'
              : row.status === 'Rejected'
              ? 'error'
              : 'warning'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Decision',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'Pending' ? (
            <>
              <button
                onClick={() => {
                  updateLeave(row.id, { status: 'Approved', approvedBy: 'Admin' });
                  addToast(`Leave for ${row.employeeName} Approved`, 'success');
                }}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                title="Approve Leave"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  updateLeave(row.id, { status: 'Rejected', approvedBy: 'Admin' });
                  addToast(`Leave for ${row.employeeName} Rejected`, 'error');
                }}
                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                title="Reject Leave"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Reviewed</span>
          )}
          <button
            onClick={() => {
              deleteLeave(row.id);
              addToast('Leave record removed.', 'info');
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded ml-1"
            title="Delete Leave"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  // Columns for Overtime
  const overtimeColumns = [
    {
      header: 'Employee',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500 font-mono">{row.employeeCode} • {row.department}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      cellClassName: 'text-xs font-mono text-slate-700'
    },
    {
      header: 'Hours',
      render: (row) => <span className="text-xs font-bold text-indigo-700">{row.hours} hrs</span>
    },
    {
      header: 'Reason',
      accessor: 'reason',
      cellClassName: 'text-xs text-slate-600 truncate max-w-sm'
    },
    {
      header: 'Approval Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'Approved'
              ? 'success'
              : row.status === 'Rejected'
              ? 'error'
              : 'warning'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'Pending' && (
            <>
              <button
                onClick={() => {
                  updateOvertime(row.id, { status: 'Approved', approvedBy: 'Admin' });
                  addToast(`Overtime for ${row.employeeName} Approved`, 'success');
                }}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                title="Approve OT"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  updateOvertime(row.id, { status: 'Rejected', approvedBy: 'Admin' });
                  addToast(`Overtime for ${row.employeeName} Rejected`, 'error');
                }}
                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                title="Reject OT"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => {
              deleteOvertime(row.id);
              addToast('Overtime record removed.', 'info');
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            title="Delete OT"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  // Columns for Holidays
  const holidayColumns = [
    {
      header: 'Holiday Name',
      render: (row) => (
        <div className="font-bold text-slate-900">{row.name}</div>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      cellClassName: 'text-xs font-mono font-bold text-brand-700'
    },
    {
      header: 'Day of Week',
      accessor: 'day',
      cellClassName: 'text-xs font-semibold text-slate-700'
    },
    {
      header: 'Holiday Type',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          {row.type}
        </span>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      cellClassName: 'text-xs text-slate-500'
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => {
            deleteHoliday(row.id);
            addToast(`Holiday ${row.name} deleted.`, 'info');
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
          title="Delete Holiday"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance, Leaves & Holiday Management"
        subtitle="Track daily employee presence, process leave applications, manage overtime authorizations, and maintain company holiday schedules."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Attendance & Leaves']}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'daily' && (
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
            )}
            {activeTab === 'leaves' && (
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Apply Leave</span>
              </button>
            )}
            {activeTab === 'overtime' && (
              <button
                onClick={() => setIsOvertimeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log Overtime</span>
              </button>
            )}
            {activeTab === 'holidays' && (
              <button
                onClick={() => setIsHolidayModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Holiday</span>
              </button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Present Today</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{totalPresentToday}</div>
            <span className="text-xs text-slate-500 font-medium">Logged on site / shift</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absent Today</span>
            <div className="text-2xl font-black text-rose-700 mt-1">{totalAbsentToday}</div>
            <span className="text-xs text-slate-500 font-medium">Unexcused absence</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Approved Leave</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{totalLeavesToday}</div>
            <span className="text-xs text-slate-500 font-medium">Casual / Sick leaves</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Leave Req</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">{pendingLeaves}</div>
            <span className="text-xs text-slate-500 font-medium">Awaiting HR approval</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'daily'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>1. Daily Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'leaves'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>2. Leave Management</span>
          {pendingLeaves > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {pendingLeaves}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('overtime')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'overtime'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>3. Overtime Log</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'holidays'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>4. Annual Holidays</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'daily' && (
        <DataTable
          title="Daily-Attendance-Register"
          columns={attendanceColumns}
          data={attendance}
          searchPlaceholder="Search employee, date, status, remarks..."
          filterKey="status"
          filterOptions={['Present', 'Absent', 'Leave', 'Half Day']}
        />
      )}

      {activeTab === 'leaves' && (
        <DataTable
          title="Leave-Applications-Register"
          columns={leaveColumns}
          data={leaves}
          searchPlaceholder="Search employee, leave type, reason..."
          filterKey="status"
          filterOptions={['Pending', 'Approved', 'Rejected']}
        />
      )}

      {activeTab === 'overtime' && (
        <DataTable
          title="Overtime-Duty-Ledger"
          columns={overtimeColumns}
          data={overtimes}
          searchPlaceholder="Search employee, reason, date..."
          filterKey="status"
          filterOptions={['Approved', 'Pending', 'Rejected']}
        />
      )}

      {activeTab === 'holidays' && (
        <DataTable
          title="Official-Holiday-Calendar"
          columns={holidayColumns}
          data={holidays}
          searchPlaceholder="Search holiday name, type, day..."
          filterKey="type"
          filterOptions={['National Holiday', 'Gazetted Holiday', 'Festival Holiday']}
        />
      )}

      {/* 1. Mark Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Log Daily Attendance"
        subtitle="Record shift timings and presence status for employee."
      >
        <form onSubmit={handleSaveAttendance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee *</label>
            <select
              value={attForm.employeeName}
              onChange={(e) => setAttForm({ ...attForm, employeeName: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={attForm.date}
                onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attendance Status *</label>
              <select
                value={attForm.status}
                onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Check-in Time</label>
              <input
                type="text"
                value={attForm.checkIn}
                onChange={(e) => setAttForm({ ...attForm, checkIn: e.target.value })}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Check-out Time</label>
              <input
                type="text"
                value={attForm.checkOut}
                onChange={(e) => setAttForm({ ...attForm, checkOut: e.target.value })}
                placeholder="06:00 PM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shift Remarks</label>
            <input
              type="text"
              value={attForm.remarks}
              onChange={(e) => setAttForm({ ...attForm, remarks: e.target.value })}
              placeholder="e.g. Regular scheduled shift / Site visit"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply Leave Application"
        subtitle="Submit formal leave request for administrative review."
      >
        <form onSubmit={handleSaveLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Employee Name *</label>
            <select
              value={leaveForm.employeeName}
              onChange={(e) => setLeaveForm({ ...leaveForm, employeeName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.fullName}>
                  {emp.fullName} ({emp.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Leave Type *</label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Sick Leave">Sick Leave (SL)</option>
                <option value="Paid Leave">Earned / Paid Leave (PL)</option>
                <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Days *</label>
              <input
                type="number"
                min="1"
                required
                value={leaveForm.numDays}
                onChange={(e) => setLeaveForm({ ...leaveForm, numDays: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">From Date *</label>
              <input
                type="date"
                required
                value={leaveForm.fromDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">To Date *</label>
              <input
                type="date"
                required
                value={leaveForm.toDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={2}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="e.g. Family medical emergency / Outstation travel"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Log Overtime Modal */}
      <Modal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
        title="Log Overtime Duty"
        subtitle="Record additional hours worked beyond regular shift."
      >
        <form onSubmit={handleSaveOvertime} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Employee Name *</label>
            <select
              value={otForm.employeeName}
              onChange={(e) => setOtForm({ ...otForm, employeeName: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={otForm.date}
                onChange={(e) => setOtForm({ ...otForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Overtime Hours *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={otForm.hours}
                onChange={(e) => setOtForm({ ...otForm, hours: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Task Description *</label>
            <input
              type="text"
              required
              value={otForm.reason}
              onChange={(e) => setOtForm({ ...otForm, reason: e.target.value })}
              placeholder="e.g. Tower A slab casting inspection / Expo lead closing"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOvertimeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              Save Overtime Log
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Add Holiday Modal */}
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title="Add Company Holiday"
        subtitle="Add statutory and gazetted holidays to company calendar."
      >
        <form onSubmit={handleSaveHoliday} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Name *</label>
            <input
              type="text"
              required
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              placeholder="e.g. Republic Day"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week *</label>
              <select
                value={holidayForm.day}
                onChange={(e) => setHolidayForm({ ...holidayForm, day: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Type *</label>
            <select
              value={holidayForm.type}
              onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="National Holiday">National Holiday</option>
              <option value="Gazetted Holiday">Gazetted Holiday</option>
              <option value="Festival Holiday">Festival Holiday</option>
              <option value="Optional Holiday">Optional Holiday</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={holidayForm.description}
              onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
              placeholder="e.g. Celebration of national day"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsHolidayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              Save Holiday
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

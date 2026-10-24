import React, { useState } from 'react';
import {
  Plus,
  Users,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Building,
  CreditCard,
  FileText,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const EmployeeManagement = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  const { addToast } = useToast();

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [viewingEmp, setViewingEmp] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeDossierTab, setActiveDossierTab] = useState('profile'); // 'profile', 'salary', 'bank_statutory'

  const initialFormState = {
    fullName: '',
    department: 'Sales & Marketing',
    designation: 'Senior Relationship Manager',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    salaryMonthly: 60000,
    basicSalary: 32000,
    hra: 16000,
    allowances: 12000,
    bankName: 'HDFC Bank',
    accountNo: '',
    ifsc: 'HDFC0001234',
    branch: 'Corporate Finance Branch',
    panNumber: '',
    aadhaarNumber: '',
    uanNo: '',
    esicNo: '',
    commissionRate: '1.5%',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData(initialFormState);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({
      fullName: emp.fullName || '',
      department: emp.department || 'Sales & Marketing',
      designation: emp.designation || '',
      phone: emp.phone || '',
      email: emp.email || '',
      joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
      salaryMonthly: emp.salaryMonthly || 60000,
      basicSalary: emp.salaryStructure?.basicSalary || Math.round((emp.salaryMonthly || 60000) * 0.5),
      hra: emp.salaryStructure?.hra || Math.round((emp.salaryMonthly || 60000) * 0.25),
      allowances: emp.salaryStructure?.allowances || Math.round((emp.salaryMonthly || 60000) * 0.25),
      bankName: emp.bankDetails?.bankName || 'HDFC Bank',
      accountNo: emp.bankDetails?.accountNo || '',
      ifsc: emp.bankDetails?.ifsc || 'HDFC0001234',
      branch: emp.bankDetails?.branch || '',
      panNumber: emp.panNumber || '',
      aadhaarNumber: emp.aadhaarNumber || '',
      uanNo: emp.pfDetails?.uanNo || '',
      esicNo: emp.pfDetails?.esicNo || '',
      commissionRate: emp.commissionRate || '1.0%',
      status: emp.status || 'Active'
    });
    setIsAddEditModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      addToast('Please enter full name, email, and mobile number.', 'error');
      return;
    }

    const payload = {
      fullName: formData.fullName,
      department: formData.department,
      designation: formData.designation,
      phone: formData.phone,
      email: formData.email,
      joinDate: formData.joinDate,
      salaryMonthly: Number(formData.basicSalary) + Number(formData.hra) + Number(formData.allowances),
      salaryStructure: {
        basicSalary: Number(formData.basicSalary) || 0,
        hra: Number(formData.hra) || 0,
        allowances: Number(formData.allowances) || 0
      },
      bankDetails: {
        bankName: formData.bankName,
        accountNo: formData.accountNo || '50100' + Math.floor(100000000 + Math.random() * 900000000),
        ifsc: formData.ifsc,
        branch: formData.branch
      },
      panNumber: formData.panNumber || 'ABCDE1234F',
      aadhaarNumber: formData.aadhaarNumber || '9876-5432-1098',
      pfDetails: {
        uanNo: formData.uanNo || '101234567890',
        esicNo: formData.esicNo || '31000987650001'
      },
      commissionRate: formData.commissionRate,
      status: formData.status
    };

    if (editingEmp) {
      updateEmployee(editingEmp.id, payload);
      addToast(`Employee profile updated for ${formData.fullName}`, 'success');
    } else {
      const created = addEmployee(payload);
      addToast(`Employee ${created.code} (${created.fullName}) added successfully.`, 'success');
    }

    setIsAddEditModalOpen(false);
    setEditingEmp(null);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteEmployee(deletingId);
      addToast('Employee profile removed from CRM roster.', 'info');
      setDeletingId(null);
    }
  };

  const totalActive = employees.filter((e) => e.status === 'Active').length;
  const totalSalaries = employees.reduce((acc, curr) => acc + (curr.salaryMonthly || 0), 0);
  const departments = [...new Set(employees.map((e) => e.department))];

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'code',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '130px'
    },
    {
      header: 'Employee Name & Contact',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.fullName}</div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span>{row.email}</span>
            <span>•</span>
            <span>{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          <Building className="w-3 h-3 text-slate-500" />
          <span>{row.department}</span>
        </span>
      )
    },
    {
      header: 'Designation',
      accessor: 'designation',
      cellClassName: 'text-xs font-medium text-slate-800'
    },
    {
      header: 'Date of Joining',
      accessor: 'joinDate',
      cellClassName: 'text-xs text-slate-600 font-mono'
    },
    {
      header: 'Monthly CTC',
      render: (row) => (
        <span className="text-xs font-bold text-slate-900">
          ₹{row.salaryMonthly?.toLocaleString('en-IN') || '60,000'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'Active'
              ? 'success'
              : row.status === 'On Leave'
              ? 'warning'
              : 'default'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setViewingEmp(row);
              setActiveDossierTab('profile');
            }}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Full Profile Dossier"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
            title="Edit Employee"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Remove Employee"
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
        title="Employee Master & Directory"
        subtitle="Manage complete human resource personnel, designation structures, compensation bands, and statutory banking profiles."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Employee Management']}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{employees.length}</div>
            <span className="text-xs text-emerald-600 font-medium">Registered in HR Master</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Employees</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{totalActive}</div>
            <span className="text-xs text-slate-500 font-medium">On active duty</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departments</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{departments.length}</div>
            <span className="text-xs text-slate-500 font-medium">Functional divisions</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Payroll</span>
            <div className="text-2xl font-black text-brand-700 mt-1">₹{totalSalaries.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 font-medium">Total base monthly CTC</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Employee Table */}
      <DataTable
        title="Employee-Staff-Directory"
        columns={columns}
        data={employees}
        searchPlaceholder="Search by ID, name, email, phone, designation..."
        filterKey="department"
        filterOptions={departments}
      />

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingEmp ? `Update Employee: ${editingEmp.code}` : 'Register New Employee'}
        subtitle="Configure personnel details, salary components, bank account, and statutory numbers."
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-brand-600 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>1. Personal & Employment Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
                <option value="CRM & Customer Relations">CRM & Customer Relations</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Relationship Manager"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Joining *</label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah.j@skylinecrm.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98230 12345"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sales Commission Rate</label>
              <input
                type="text"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                placeholder="e.g. 1.5%"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="text-xs font-bold text-brand-600 uppercase tracking-wider pt-2 pb-1 border-b border-slate-100 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <span>2. Salary Structure (Monthly Components)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Basic Salary (₹)</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">HRA (₹)</label>
              <input
                type="number"
                value={formData.hra}
                onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Allowances (₹)</label>
              <input
                type="number"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Calculated Monthly Gross CTC:</span>
            <span className="text-brand-700 text-sm font-extrabold">
              ₹{(Number(formData.basicSalary) + Number(formData.hra) + Number(formData.allowances)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-xs font-bold text-brand-600 uppercase tracking-wider pt-2 pb-1 border-b border-slate-100 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            <span>3. Bank Account & Statutory Tax Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={formData.accountNo}
                onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                placeholder="e.g. 50100432198765"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g. Main Business District"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                placeholder="e.g. 9876-5432-1098"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PF UAN Number</label>
              <input
                type="text"
                value={formData.uanNo}
                onChange={(e) => setFormData({ ...formData, uanNo: e.target.value })}
                placeholder="e.g. 101234567890"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ESIC IP Number</label>
              <input
                type="text"
                value={formData.esicNo}
                onChange={(e) => setFormData({ ...formData, esicNo: e.target.value })}
                placeholder="e.g. 31000987650001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {editingEmp ? 'Save Changes' : 'Confirm Employee Onboarding'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Full Dossier Modal */}
      {viewingEmp && (
        <Modal
          isOpen={Boolean(viewingEmp)}
          onClose={() => setViewingEmp(null)}
          title={`Employee Master Dossier: ${viewingEmp.code}`}
          subtitle={`${viewingEmp.fullName} — ${viewingEmp.designation}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Tabs within dossier */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveDossierTab('profile')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeDossierTab === 'profile'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Personal & Role
              </button>
              <button
                onClick={() => setActiveDossierTab('salary')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeDossierTab === 'salary'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Salary Structure
              </button>
              <button
                onClick={() => setActiveDossierTab('bank_statutory')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeDossierTab === 'bank_statutory'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Bank & Statutory PAN/PF
              </button>
            </div>

            {activeDossierTab === 'profile' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold">Employee ID:</span>
                    <p className="font-mono font-bold text-brand-700 text-sm mt-0.5">{viewingEmp.code}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Status:</span>
                    <div className="mt-0.5"><Badge>{viewingEmp.status}</Badge></div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Full Legal Name:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{viewingEmp.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Department:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{viewingEmp.department}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Designation:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{viewingEmp.designation}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Date of Joining:</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{viewingEmp.joinDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Official Email:</span>
                    <p className="font-mono text-slate-900 mt-0.5">{viewingEmp.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Mobile Number:</span>
                    <p className="font-mono text-slate-900 mt-0.5">{viewingEmp.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Sales Incentive Commission:</span>
                    <p className="font-bold text-emerald-700 mt-0.5">{viewingEmp.commissionRate || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeDossierTab === 'salary' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Basic Salary:</span>
                    <span className="font-bold text-slate-900">₹{(viewingEmp.salaryStructure?.basicSalary || Math.round((viewingEmp.salaryMonthly || 60000) * 0.5)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">House Rent Allowance (HRA):</span>
                    <span className="font-bold text-slate-900">₹{(viewingEmp.salaryStructure?.hra || Math.round((viewingEmp.salaryMonthly || 60000) * 0.25)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Special / Travel Allowances:</span>
                    <span className="font-bold text-slate-900">₹{(viewingEmp.salaryStructure?.allowances || Math.round((viewingEmp.salaryMonthly || 60000) * 0.25)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-brand-50/80 px-2 rounded-lg border border-brand-200">
                    <span className="text-brand-900 font-extrabold">Total Monthly Fixed CTC:</span>
                    <span className="font-black text-brand-700 text-sm">₹{viewingEmp.salaryMonthly?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

            {activeDossierTab === 'bank_statutory' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold">Bank Name:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{viewingEmp.bankDetails?.bankName || 'HDFC Bank'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Account Number:</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{viewingEmp.bankDetails?.accountNo || '50100432198765'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">IFSC Code:</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{viewingEmp.bankDetails?.ifsc || 'HDFC0001234'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Bank Branch:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{viewingEmp.bankDetails?.branch || 'Main Commercial Branch'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">PAN Card Number:</span>
                    <p className="font-mono font-bold text-indigo-700 mt-0.5">{viewingEmp.panNumber || 'ABCDE1234F'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Aadhaar Card Number:</span>
                    <p className="font-mono font-bold text-indigo-700 mt-0.5">{viewingEmp.aadhaarNumber || '9876-5432-1098'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">PF UAN Number:</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{viewingEmp.pfDetails?.uanNo || '101234567890'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">ESIC IP Number:</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{viewingEmp.pfDetails?.esicNo || '31000987650001'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingEmp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remove Employee Record"
        message="Are you sure you want to remove this employee from the Skyline CRM HR Directory?"
      />
    </div>
  );
};

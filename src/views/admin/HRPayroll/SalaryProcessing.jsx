import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  FileText,
  Building,
  Users,
  CreditCard,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { SalarySlipModal } from './SalarySlipModal';

export const SalaryProcessing = () => {
  const {
    employees,
    salaryProcessing,
    addSalaryProcessing,
    updateSalaryProcessing,
    deleteSalaryProcessing,
    processBatchPayroll,
    addEmployeePayment
  } = useData();
  const { addToast } = useToast();

  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Form State for individual employee payroll adjustment
  const [formState, setFormState] = useState({
    employeeName: employees[0]?.fullName || 'Sarah Jenkins',
    month: 'October 2026',
    basicSalary: 35000,
    hra: 18000,
    incentives: 8000,
    salesCommission: 15000,
    bonus: 5000,
    pf: 4200,
    esic: 608,
    profTax: 200,
    advanceSalary: 0,
    loanRecovery: 0
  });

  const handleRunBatch = () => {
    processBatchPayroll(selectedMonth);
    addToast(`Automated payroll calculated for all active employees (${selectedMonth}).`, 'success');
  };

  const handleSaveProcess = (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x.fullName === formState.employeeName);
    const created = addSalaryProcessing({
      ...formState,
      employeeId: emp ? emp.id : 'EMP-01',
      employeeCode: emp ? emp.code : 'SKY-EMP-101',
      department: emp ? emp.department : 'Sales & Marketing',
      designation: emp ? emp.designation : 'Executive'
    });
    addToast(`Payroll computed for ${created.employeeName} (Net: ₹${created.netSalary?.toLocaleString('en-IN')})`, 'success');
    setIsProcessModalOpen(false);
  };

  const handleDisbursePayment = (row) => {
    const payment = addEmployeePayment({
      salaryMonth: row.month || 'October 2026',
      employeeName: row.employeeName,
      employeeCode: row.employeeCode,
      department: row.department,
      designation: row.designation,
      basicSalary: row.basicSalary,
      hra: row.hra,
      incentives: row.incentives,
      salesCommission: row.salesCommission,
      bonus: row.bonus,
      grossSalary: row.grossSalary,
      deductions: row.deductions,
      totalDeductions: row.totalDeductions,
      netSalary: row.netSalary,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank Transfer',
      paymentStatus: 'Paid',
      referenceNo: 'HDFC-NEFT-' + Math.floor(10000000 + Math.random() * 90000000),
      bankName: 'HDFC Corporate Bank',
      notes: `Salary disbursed for ${row.month}`
    });
    addToast(`Salary disbursed for ${row.employeeName}! Payment Ref: ${payment.referenceNo}`, 'success');
  };

  // Calculations
  const totalGrossPayroll = salaryProcessing.reduce((acc, curr) => acc + (curr.grossSalary || 0), 0);
  const totalNetPayroll = salaryProcessing.reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
  const totalDeductions = salaryProcessing.reduce((acc, curr) => acc + (curr.totalDeductions || 0), 0);

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
      header: 'Month',
      accessor: 'month',
      cellClassName: 'text-xs font-semibold text-slate-700'
    },
    {
      header: 'Basic + HRA',
      render: (row) => (
        <span className="text-xs font-medium text-slate-800 font-mono">
          ₹{((row.basicSalary || 0) + (row.hra || 0)).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Incentives & Comm',
      render: (row) => (
        <span className="text-xs font-bold text-emerald-700 font-mono">
          +₹{((row.incentives || 0) + (row.salesCommission || 0) + (row.bonus || 0)).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Gross Salary',
      render: (row) => (
        <span className="text-xs font-black text-slate-900 font-mono">
          ₹{row.grossSalary?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Total Deductions',
      render: (row) => (
        <span className="text-xs font-bold text-rose-600 font-mono">
          -₹{row.totalDeductions?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Net Payable',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded bg-brand-50 text-brand-800 font-mono font-black text-xs border border-brand-200">
          ₹{row.netSalary?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedSlip(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors border border-brand-200"
            title="Generate & View Salary Slip"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Slip</span>
          </button>
          <button
            onClick={() => handleDisbursePayment(row)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors border border-emerald-200"
            title="Disburse / Pay"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Disburse</span>
          </button>
          <button
            onClick={() => {
              deleteSalaryProcessing(row.id);
              addToast('Salary process entry removed.', 'info');
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            title="Delete Process Record"
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
        title="Salary Processing & Payroll Calculation"
        subtitle="Automated monthly gross salary computation, statutory PF/ESIC deductions, performance incentives, and net payout register."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Salary Processing']}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunBatch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Run Automated Batch Payroll</span>
            </button>
            <button
              onClick={() => setIsProcessModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Salary Calculation</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Payroll</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{totalGrossPayroll.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 font-medium">Earnings before deductions</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Deductions</span>
            <div className="text-2xl font-black text-rose-700 mt-1">₹{totalDeductions.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 font-medium">PF, ESIC, PT, Advances</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Disbursable</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalNetPayroll.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 font-medium">Total take-home payroll</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Calculated</span>
            <div className="text-2xl font-black text-brand-700 mt-1">{salaryProcessing.length}</div>
            <span className="text-xs text-slate-500 font-medium">Active payroll records</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Payroll Table */}
      <DataTable
        title="Monthly-Salary-Processing-Register"
        columns={columns}
        data={salaryProcessing}
        searchPlaceholder="Search employee, department, month..."
        filterKey="month"
        filterOptions={['October 2026', 'September 2026', 'August 2026']}
      />

      {/* Process / Adjust Salary Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title="Compute & Adjust Employee Salary"
        subtitle="Specify basic components, commission, and statutory deductions."
      >
        <form onSubmit={handleSaveProcess} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee *</label>
              <select
                value={formState.employeeName}
                onChange={(e) => {
                  const emp = employees.find((x) => x.fullName === e.target.value);
                  setFormState({
                    ...formState,
                    employeeName: e.target.value,
                    basicSalary: emp?.salaryStructure?.basicSalary || 35000,
                    hra: emp?.salaryStructure?.hra || 18000,
                    pf: Math.round((emp?.salaryStructure?.basicSalary || 35000) * 0.12)
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.fullName}>
                    {emp.fullName} ({emp.code}) — {emp.department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Salary Month *</label>
              <input
                type="text"
                required
                value={formState.month}
                onChange={(e) => setFormState({ ...formState, month: e.target.value })}
                placeholder="October 2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider pt-2 border-b border-slate-100">
            Earnings Components (₹)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Basic Salary</label>
              <input
                type="number"
                value={formState.basicSalary}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setFormState({
                    ...formState,
                    basicSalary: val,
                    pf: Math.round(val * 0.12)
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HRA</label>
              <input
                type="number"
                value={formState.hra}
                onChange={(e) => setFormState({ ...formState, hra: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incentives</label>
              <input
                type="number"
                value={formState.incentives}
                onChange={(e) => setFormState({ ...formState, incentives: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Deal Commission</label>
              <input
                type="number"
                value={formState.salesCommission}
                onChange={(e) => setFormState({ ...formState, salesCommission: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bonus / Perks</label>
              <input
                type="number"
                value={formState.bonus}
                onChange={(e) => setFormState({ ...formState, bonus: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="text-xs font-bold text-rose-700 uppercase tracking-wider pt-2 border-b border-slate-100">
            Deductions Components (₹)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provident Fund (12%)</label>
              <input
                type="number"
                value={formState.pf}
                onChange={(e) => setFormState({ ...formState, pf: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ESIC Contribution</label>
              <input
                type="number"
                value={formState.esic}
                onChange={(e) => setFormState({ ...formState, esic: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Tax</label>
              <input
                type="number"
                value={formState.profTax}
                onChange={(e) => setFormState({ ...formState, profTax: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Salary Deduction</label>
              <input
                type="number"
                value={formState.advanceSalary}
                onChange={(e) => setFormState({ ...formState, advanceSalary: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Recovery</label>
              <input
                type="number"
                value={formState.loanRecovery}
                onChange={(e) => setFormState({ ...formState, loanRecovery: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Live Summary */}
          {(() => {
            const gross =
              Number(formState.basicSalary) +
              Number(formState.hra) +
              Number(formState.incentives) +
              Number(formState.salesCommission) +
              Number(formState.bonus);
            const deduct =
              Number(formState.pf) +
              Number(formState.esic) +
              Number(formState.profTax) +
              Number(formState.advanceSalary) +
              Number(formState.loanRecovery);
            const net = gross - deduct;
            return (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Gross Earnings:</span>
                  <strong className="text-emerald-700 font-black text-sm">₹{gross.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Total Deductions:</span>
                  <strong className="text-rose-700 font-black text-sm">-₹{deduct.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Net Disbursable:</span>
                  <strong className="text-brand-700 font-black text-sm">₹{net.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProcessModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              Compute & Save Process
            </button>
          </div>
        </form>
      </Modal>

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={Boolean(selectedSlip)}
        onClose={() => setSelectedSlip(null)}
        slipData={selectedSlip}
      />
    </div>
  );
};

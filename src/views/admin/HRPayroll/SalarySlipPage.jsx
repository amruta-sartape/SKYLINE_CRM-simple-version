import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Search,
  Building,
  User,
  CheckCircle2,
  Calendar,
  CreditCard,
  Eye
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { SalarySlipModal } from './SalarySlipModal';

export const SalarySlipPage = () => {
  const { employees, employeePayments, salaryProcessing } = useData();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-01');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const paymentRecord = employeePayments.find(
    (p) => p.employeeName === currentEmp?.fullName && p.salaryMonth === selectedMonth
  );
  const processRecord = salaryProcessing.find(
    (sp) => sp.employeeName === currentEmp?.fullName && sp.month === selectedMonth
  );

  // Derive slip figures
  const basic = paymentRecord?.basicSalary ?? processRecord?.basicSalary ?? (currentEmp?.salaryStructure?.basicSalary || 35000);
  const hra = paymentRecord?.hra ?? processRecord?.hra ?? (currentEmp?.salaryStructure?.hra || 18000);
  const inc = paymentRecord?.incentives ?? processRecord?.incentives ?? 8000;
  const comm = paymentRecord?.salesCommission ?? processRecord?.salesCommission ?? (currentEmp?.department.includes('Sales') ? 15000 : 0);
  const bonus = paymentRecord?.bonus ?? processRecord?.bonus ?? 5000;
  const gross = paymentRecord?.grossSalary ?? processRecord?.grossSalary ?? (basic + hra + inc + comm + bonus);

  const pf = paymentRecord?.deductions?.pf ?? processRecord?.deductions?.pf ?? Math.round(basic * 0.12);
  const esic = paymentRecord?.deductions?.esic ?? processRecord?.deductions?.esic ?? (gross < 21000 ? Math.round(gross * 0.0075) : 0);
  const profTax = paymentRecord?.deductions?.profTax ?? processRecord?.deductions?.profTax ?? 200;
  const advance = paymentRecord?.deductions?.advanceSalary ?? processRecord?.deductions?.advanceSalary ?? 0;
  const loan = paymentRecord?.deductions?.loanRecovery ?? processRecord?.deductions?.loanRecovery ?? 0;
  const totalDeduct = paymentRecord?.totalDeductions ?? processRecord?.totalDeductions ?? (pf + esic + profTax + advance + loan);
  const net = paymentRecord?.netSalary ?? processRecord?.netSalary ?? (gross - totalDeduct);

  const activeSlipData = {
    slipNo: paymentRecord?.slipNo || `SLP-2026-10-${currentEmp?.code?.slice(-3) || '101'}`,
    salaryMonth: selectedMonth,
    employeeName: currentEmp?.fullName,
    employeeCode: currentEmp?.code,
    department: currentEmp?.department,
    designation: currentEmp?.designation,
    joinDate: currentEmp?.joinDate,
    basicSalary: basic,
    hra,
    incentives: inc,
    salesCommission: comm,
    bonus,
    grossSalary: gross,
    deductions: {
      pf,
      esic,
      profTax,
      advanceSalary: advance,
      loanRecovery: loan
    },
    totalDeductions: totalDeduct,
    netSalary: net,
    paymentMode: paymentRecord?.paymentMode || 'Bank Transfer',
    paymentStatus: paymentRecord?.paymentStatus || 'Paid',
    referenceNo: paymentRecord?.referenceNo || 'NEFT-HDFC-99238411',
    bankName: currentEmp?.bankDetails?.bankName
      ? `${currentEmp.bankDetails.bankName} (A/C: ...${currentEmp.bankDetails?.accountNo?.slice(-5) || '98765'})`
      : 'HDFC Bank (A/C: ...98765)'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Salary Slips"
        subtitle="Generate, preview, and print formal monthly employee payslips with full earnings and statutory deduction breakdowns."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Salary Slip']}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Full Slip Modal View</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        }
      />

      {/* Selector Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Staff Member
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-slate-800 min-w-[220px]"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Payroll Cycle Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-slate-800 min-w-[160px]"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Salary Slip</span>
          </button>
        </div>
      </div>

      {/* Main Payslip Preview Sheet */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-brand-400 flex items-center justify-center font-black text-2xl shadow-md border border-slate-700">
              SC
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">SKYLINE CRM</h2>
              <p className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                Real Estate Development & Commercial Properties
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Skyline Corporate Towers, Financial Hub, Sector 4 • support@skylinecrm.com
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right sm:border-l sm:border-slate-200 sm:pl-6">
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-800 border border-brand-200 rounded font-black text-xs">
              PAYSLIP / SALARY CERTIFICATE
            </span>
            <p className="text-xs font-mono font-bold text-slate-800 mt-1.5">
              Slip Reference: {activeSlipData.slipNo}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Pay Period: <strong className="text-slate-900">{selectedMonth}</strong>
            </p>
          </div>
        </div>

        {/* Employee Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Employee Name:</span>
            <strong className="text-slate-950 text-sm">{currentEmp?.fullName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Employee Code:</span>
            <strong className="text-brand-700 font-mono text-sm">{currentEmp?.code}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Department:</span>
            <span className="text-slate-900 font-semibold">{currentEmp?.department}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Designation:</span>
            <span className="text-slate-900 font-semibold">{currentEmp?.designation}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Date of Joining:</span>
            <span className="text-slate-900 font-mono">{currentEmp?.joinDate}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Bank Account:</span>
            <span className="text-slate-900 font-mono">{activeSlipData.bankName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">PAN Number:</span>
            <span className="text-slate-900 font-mono font-bold">{currentEmp?.panNumber || 'ABCDE1234F'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">PF UAN No:</span>
            <span className="text-slate-900 font-mono">{currentEmp?.pfDetails?.uanNo || '101234567890'}</span>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <span>1. Earnings Components</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-4 text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Basic Fixed Salary</span>
                <span className="font-mono font-bold text-slate-900">₹{basic.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-mono font-bold text-slate-900">₹{hra.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Performance Incentives</span>
                <span className="font-mono font-bold text-emerald-700">₹{inc.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Sales Deal Commission</span>
                <span className="font-mono font-bold text-emerald-700">₹{comm.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Bonus / Festival Allowance</span>
                <span className="font-mono font-bold text-emerald-700">₹{bonus.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-slate-300 font-bold text-slate-950 text-sm">
                <span>Gross Total Earnings (A)</span>
                <span className="font-black text-emerald-700 text-base">₹{gross.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-rose-50 px-4 py-2.5 border-b border-rose-200 flex justify-between items-center text-xs font-bold text-rose-950 uppercase tracking-wider">
              <span>2. Deductions Components</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-4 text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Provident Fund (PF - 12%)</span>
                <span className="font-mono font-bold text-slate-900">₹{pf.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">ESIC Health Contribution</span>
                <span className="font-mono font-bold text-slate-900">₹{esic.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Professional Tax (PT)</span>
                <span className="font-mono font-bold text-slate-900">₹{profTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Advance Salary Deduction</span>
                <span className="font-mono font-bold text-rose-600">₹{advance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Loan Recovery</span>
                <span className="font-mono font-bold text-rose-600">₹{loan.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-slate-300 font-bold text-slate-950 text-sm">
                <span>Total Deductions (B)</span>
                <span className="font-black text-rose-700 text-base">₹{totalDeduct.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-xs uppercase tracking-wider text-brand-300 font-bold">
              Net Take-Home Salary (A - B)
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              ₹{net.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Payment Mode: {activeSlipData.paymentMode} • Ref No: {activeSlipData.referenceNo}
            </p>
          </div>

          <div className="text-left sm:text-right sm:border-l sm:border-slate-700 sm:pl-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Disbursement Settled</span>
            </span>
            <p className="text-xs text-slate-400 mt-1">Status: Paid</p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
          <div>
            <div className="h-10 border-b border-slate-400 w-48"></div>
            <p className="font-bold text-slate-900 mt-1">Employee Signature</p>
            <p className="text-[11px] text-slate-500">{currentEmp?.fullName}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="h-10 border-b border-slate-400 w-48 text-center text-xs italic font-serif text-brand-900">
              Skyline HR Director
            </div>
            <p className="font-bold text-slate-900 mt-1">Authorized Signatory</p>
            <p className="text-[11px] text-slate-500">Skyline CRM Corporate Payroll Office</p>
          </div>
        </div>
      </div>

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slipData={activeSlipData}
      />
    </div>
  );
};

import React from 'react';
import {
  Printer,
  X,
  Building,
  CheckCircle2,
  DollarSign,
  Download,
  Calendar,
  User,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';

export const SalarySlipModal = ({ isOpen, onClose, slipData }) => {
  if (!slipData) return null;

  const handlePrint = () => {
    window.print();
  };

  const basic = Number(slipData.basicSalary) || 0;
  const hra = Number(slipData.hra) || 0;
  const inc = Number(slipData.incentives) || 0;
  const comm = Number(slipData.salesCommission) || 0;
  const bonus = Number(slipData.bonus) || 0;
  const gross = Number(slipData.grossSalary) || (basic + hra + inc + comm + bonus);

  const pf = Number(slipData.deductions?.pf ?? slipData.pf) || 0;
  const esic = Number(slipData.deductions?.esic ?? slipData.esic) || 0;
  const profTax = Number(slipData.deductions?.profTax ?? slipData.profTax) || 200;
  const advance = Number(slipData.deductions?.advanceSalary ?? slipData.advanceSalary) || 0;
  const loan = Number(slipData.deductions?.loanRecovery ?? slipData.loanRecovery) || 0;
  const totalDeduct = Number(slipData.totalDeductions) || (pf + esic + profTax + advance + loan);
  const net = Number(slipData.netSalary) || (gross - totalDeduct);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Salary Slip Preview"
      subtitle={`Payroll Month: ${slipData.salaryMonth || slipData.month || 'October 2026'}`}
      size="xl"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Printable Payslip Card */}
        <div id="salary-slip-printable" className="p-6 bg-white border border-slate-300 rounded-xl shadow-sm text-slate-800 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-brand-400 flex items-center justify-center font-black text-xl shadow-md border border-slate-700">
                SC
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-950">SKYLINE CRM</h1>
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Real Estate Development & Commercial Properties
                </p>
                <p className="text-[11px] text-slate-400">Skyline Tower, Financial District • support@skylinecrm.com</p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="inline-block px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded font-bold text-xs">
                CONFIDENTIAL PAYSLIP
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                Slip No: {slipData.slipNo || `SLP-2026-10-${slipData.employeeCode?.slice(-3) || '101'}`}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Month: <strong className="text-slate-900">{slipData.salaryMonth || slipData.month || 'October 2026'}</strong>
              </p>
            </div>
          </div>

          {/* Employee Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">Employee Name:</span>
              <strong className="text-slate-950 text-sm">{slipData.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Employee Code:</span>
              <strong className="text-brand-700 font-mono text-sm">{slipData.employeeCode}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Department:</span>
              <span className="text-slate-900 font-semibold">{slipData.department || 'Sales & Operations'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Designation:</span>
              <span className="text-slate-900 font-semibold">{slipData.designation || 'Relationship Manager'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Bank Account:</span>
              <span className="text-slate-900 font-mono">{slipData.bankName || 'HDFC Bank (A/C: ...98765)'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Payment Mode:</span>
              <span className="text-slate-900 font-semibold">{slipData.paymentMode || 'Bank Transfer'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">PAN Number:</span>
              <span className="text-slate-900 font-mono font-bold">ABCDE1234F</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">PF UAN:</span>
              <span className="text-slate-900 font-mono">101234567890</span>
            </div>
          </div>

          {/* Side-by-side Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <span>1. Earnings Components</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-3 text-xs space-y-2">
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
                  <span className="text-slate-600">Quarterly / Festival Bonus</span>
                  <span className="font-mono font-bold text-emerald-700">₹{bonus.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                  <span>Gross Total Earnings (A)</span>
                  <span className="font-black text-emerald-700">₹{gross.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-rose-50 px-3 py-2 border-b border-rose-200 flex justify-between items-center text-xs font-bold text-rose-900 uppercase tracking-wider">
                <span>2. Statutory & Deductions</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-3 text-xs space-y-2">
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
                  <span className="text-slate-600">Company Loan Recovery</span>
                  <span className="font-mono font-bold text-rose-600">₹{loan.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                  <span>Total Deductions (B)</span>
                  <span className="font-black text-rose-700">₹{totalDeduct.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Summary Box */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-300 font-bold">
                Net Disbursed Take-Home Salary (A - B)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                ₹{net.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Mode: {slipData.paymentMode || 'Bank Transfer'} • Ref / UTR: {slipData.referenceNo || 'NEFT-884910291'}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment Disbursed</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Date: {slipData.paymentDate || '2026-10-03'}</p>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
            <div>
              <div className="h-10 border-b border-slate-400 w-48"></div>
              <p className="font-bold text-slate-900 mt-1">Employee Signature</p>
              <p className="text-[11px] text-slate-500">I acknowledge receipt of full salary.</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="h-10 border-b border-slate-400 w-48 text-center text-xs italic font-serif text-brand-900">
                Skyline HR Admin
              </div>
              <p className="font-bold text-slate-900 mt-1">Authorized HR Signatory</p>
              <p className="text-[11px] text-slate-500">Skyline CRM Corporate Payroll</p>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-100">
            This is a system-generated salary slip from Skyline CRM. No physical signature is required.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg"
          >
            Close Preview
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Salary Slip</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  Plus,
  DollarSign,
  FileText,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  Check,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  Clock,
  Send
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { SalarySlipModal } from './SalarySlipModal';

export const EmployeePayment = () => {
  const {
    employees,
    employeePayments,
    addEmployeePayment,
    updateEmployeePayment,
    deleteEmployeePayment
  } = useData();
  const { addToast } = useToast();

  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const initialForm = {
    employeeName: employees[0]?.fullName || 'Sarah Jenkins',
    salaryMonth: 'October 2026',
    basicSalary: 35000,
    hra: 18000,
    incentives: 8000,
    salesCommission: 15000,
    bonus: 5000,
    pf: 4200,
    esic: 608,
    profTax: 200,
    advanceSalary: 0,
    loanRecovery: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    paymentStatus: 'Paid',
    referenceNo: 'HDFC-NEFT-' + Math.floor(10000000 + Math.random() * 90000000),
    bankName: 'HDFC Bank (A/C: ...98765)',
    notes: 'Monthly executive remuneration disbursed'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormData(initialForm);
    setIsAddPaymentModalOpen(true);
  };

  const handleOpenEdit = (pay) => {
    setEditingPayment(pay);
    setFormData({
      employeeName: pay.employeeName,
      salaryMonth: pay.salaryMonth || 'October 2026',
      basicSalary: pay.basicSalary || 35000,
      hra: pay.hra || 18000,
      incentives: pay.incentives || 0,
      salesCommission: pay.salesCommission || 0,
      bonus: pay.bonus || 0,
      pf: pay.deductions?.pf ?? pay.pf ?? 4200,
      esic: pay.deductions?.esic ?? pay.esic ?? 0,
      profTax: pay.deductions?.profTax ?? pay.profTax ?? 200,
      advanceSalary: pay.deductions?.advanceSalary ?? pay.advanceSalary ?? 0,
      loanRecovery: pay.deductions?.loanRecovery ?? pay.loanRecovery ?? 0,
      paymentDate: pay.paymentDate || new Date().toISOString().split('T')[0],
      paymentMode: pay.paymentMode || 'Bank Transfer',
      paymentStatus: pay.paymentStatus || 'Paid',
      referenceNo: pay.referenceNo || '',
      bankName: pay.bankName || 'HDFC Bank',
      notes: pay.notes || ''
    });
    setIsAddPaymentModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x.fullName === formData.employeeName);
    const basic = Number(formData.basicSalary) || 0;
    const hra = Number(formData.hra) || 0;
    const inc = Number(formData.incentives) || 0;
    const comm = Number(formData.salesCommission) || 0;
    const bonus = Number(formData.bonus) || 0;
    const gross = basic + hra + inc + comm + bonus;

    const pf = Number(formData.pf) || 0;
    const esic = Number(formData.esic) || 0;
    const profTax = Number(formData.profTax) || 200;
    const adv = Number(formData.advanceSalary) || 0;
    const loan = Number(formData.loanRecovery) || 0;
    const totalDeduct = pf + esic + profTax + adv + loan;
    const net = gross - totalDeduct;

    const payload = {
      salaryMonth: formData.salaryMonth,
      employeeName: formData.employeeName,
      employeeCode: emp ? emp.code : 'SKY-EMP-101',
      department: emp ? emp.department : 'General',
      designation: emp ? emp.designation : 'Executive',
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
        advanceSalary: adv,
        loanRecovery: loan
      },
      totalDeductions: totalDeduct,
      netSalary: net,
      paymentDate: formData.paymentStatus === 'Paid' ? formData.paymentDate : 'Pending',
      paymentMode: formData.paymentMode,
      paymentStatus: formData.paymentStatus,
      referenceNo: formData.referenceNo || (formData.paymentStatus === 'Paid' ? 'TXN-' + Math.floor(10000000 + Math.random() * 90000000) : '-'),
      bankName: formData.bankName,
      notes: formData.notes
    };

    if (editingPayment) {
      updateEmployeePayment(editingPayment.id, payload);
      addToast(`Payment record updated for ${formData.employeeName}`, 'success');
    } else {
      const created = addEmployeePayment(payload);
      addToast(`Salary disbursement recorded for ${created.employeeName} (₹${net.toLocaleString('en-IN')})`, 'success');
    }

    setIsAddPaymentModalOpen(false);
    setEditingPayment(null);
  };

  const handleQuickPay = (pay) => {
    updateEmployeePayment(pay.id, {
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNo: 'IMPS-' + Math.floor(10000000 + Math.random() * 90000000)
    });
    addToast(`Payment marked as Paid for ${pay.employeeName}!`, 'success');
  };

  // Metrics
  const totalPaidAmount = employeePayments
    .filter((p) => p.paymentStatus === 'Paid')
    .reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
  const totalPendingAmount = employeePayments
    .filter((p) => p.paymentStatus === 'Pending')
    .reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
  const paidCount = employeePayments.filter((p) => p.paymentStatus === 'Paid').length;
  const pendingCount = employeePayments.filter((p) => p.paymentStatus === 'Pending').length;

  const columns = [
    {
      header: 'Pay Slip No',
      accessor: 'slipNo',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '140px'
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
      header: 'Salary Month',
      accessor: 'salaryMonth',
      cellClassName: 'text-xs font-semibold text-slate-700'
    },
    {
      header: 'Gross Salary',
      render: (row) => (
        <span className="text-xs font-bold text-slate-900 font-mono">
          ₹{row.grossSalary?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Net Disbursed',
      render: (row) => (
        <span className="text-xs font-black text-emerald-700 font-mono">
          ₹{row.netSalary?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Payment Mode',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.paymentMode}</span>
        </span>
      )
    },
    {
      header: 'Payment Status',
      render: (row) => (
        <Badge variant={row.paymentStatus === 'Paid' ? 'success' : 'warning'}>
          {row.paymentStatus}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedSlip(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors border border-brand-200"
            title="View Official Salary Slip"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Slip</span>
          </button>
          {row.paymentStatus === 'Pending' && (
            <button
              onClick={() => handleQuickPay(row)}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              title="Disburse / Mark Paid"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded"
            title="Edit Payment Record"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteEmployeePayment(row.id);
              addToast('Payment record removed.', 'info');
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            title="Delete Payment"
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
        title="Employee Payment & Remuneration"
        subtitle="Manage salary disbursements, statutory net settlements, payment modes, and official salary slips."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Employee Payment']}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Disbursed</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalPaidAmount.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 font-medium">{paidCount} Paid salary batches</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payouts</span>
            <div className="text-2xl font-black text-amber-700 mt-1">₹{totalPendingAmount.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 font-medium">{pendingCount} Pending transactions</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{employees.length}</div>
            <span className="text-xs text-slate-500 font-medium">Enrolled in Payroll</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Records</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">{employeePayments.length}</div>
            <span className="text-xs text-slate-500 font-medium">Total logged payment slips</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Payment Table */}
      <DataTable
        title="Employee-Payroll-Disbursement-Ledger"
        columns={columns}
        data={employeePayments}
        searchPlaceholder="Search employee, slip no, mode, reference..."
        filterKey="paymentStatus"
        filterOptions={['Paid', 'Pending']}
      />

      {/* Record / Edit Payment Modal */}
      <Modal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        title={editingPayment ? 'Update Payment Record' : 'Record Salary Payment'}
        subtitle="Enter disbursement details, mode, reference transaction number."
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee Name *</label>
              <select
                value={formData.employeeName}
                onChange={(e) => {
                  const emp = employees.find((x) => x.fullName === e.target.value);
                  setFormData({
                    ...formData,
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
                value={formData.salaryMonth}
                onChange={(e) => setFormData({ ...formData, salaryMonth: e.target.value })}
                placeholder="October 2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Basic Salary (₹)</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HRA (₹)</label>
              <input
                type="number"
                value={formData.hra}
                onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commission/Incentive</label>
              <input
                type="number"
                value={formData.salesCommission}
                onChange={(e) => setFormData({ ...formData, salesCommission: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode *</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="UPI">UPI Payment</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status *</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Ref / UTR No</label>
              <input
                type="text"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                placeholder="e.g. HDFC-NEFT-99238411"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Note</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Salary & commission disbursed via NEFT batch"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPaymentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              {editingPayment ? 'Update Payment' : 'Save & Issue Payment'}
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

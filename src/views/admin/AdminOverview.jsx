import React from 'react';
import {
  PhoneCall,
  CalendarCheck,
  Layers,
  Compass,
  FileSpreadsheet,
  Home,
  Briefcase,
  Users,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

export const AdminOverview = ({ onNavigate }) => {
  const {
    enquiries,
    followups,
    leads,
    siteVisits,
    bookings,
    flatSales,
    employees,
    employeePayments
  } = useData();
  const { users } = useAuth();

  const totalEmployees = employees.length;
  const totalAgents = users.filter((u) => u.role === 'Agent').length;
  const activeFollowups = followups.filter((f) => f.status === 'Pending').length;
  const paidEmployeePayments = employeePayments.filter((p) => p.paymentStatus === 'Paid').length;
  const pendingEmployeePayments = employeePayments.filter((p) => p.paymentStatus === 'Pending').length;

  const totalSalesVolume = flatSales.reduce((acc, curr) => acc + (Number(curr.saleAmount) || Number(curr.salePrice) || 0), 0);
  const totalReceivedVolume = flatSales.reduce((acc, curr) => acc + (Number(curr.receivedAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-2xl p-6 text-white border border-slate-700 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skyline CRM Executive Command Center</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Real Estate Enterprise Executive Dashboard
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Monitor multi-project pipeline, sales velocity, site visits, accounts settlement, and channel partner performances in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('admin-enquiries')}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>View Enquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('admin-finance-dash')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-all"
            >
              Finance Reports
            </button>
          </div>
        </div>
      </div>

      {/* 8 Required Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Key Performance Metrics
          </h3>
          <span className="text-xs text-slate-500 font-medium">Updated live</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Enquiries"
            value={enquiries.length}
            subtitle="Customer enquiries across all channels"
            icon={PhoneCall}
            trend={{ value: '+14%', isPositive: true }}
            color="blue"
            onClick={() => onNavigate('admin-enquiries')}
          />
          <StatCard
            title="Active Follow-ups"
            value={activeFollowups}
            subtitle="Pending calls & scheduled meets"
            icon={CalendarCheck}
            trend={{ value: 'Due Today', isPositive: false }}
            color="amber"
            onClick={() => onNavigate('admin-followups')}
          />
          <StatCard
            title="Leads"
            value={leads.length}
            subtitle="High intent qualified prospects"
            icon={Layers}
            trend={{ value: '+8%', isPositive: true }}
            color="purple"
            onClick={() => onNavigate('admin-leads')}
          />
          <StatCard
            title="Site Visits"
            value={siteVisits.length}
            subtitle="Scheduled and completed tours"
            icon={Compass}
            trend={{ value: '+22%', isPositive: true }}
            color="teal"
            onClick={() => onNavigate('admin-sitevisits')}
          />
          <StatCard
            title="Confirmed Bookings"
            value={bookings.length}
            subtitle="Token & booking amount cleared"
            icon={FileSpreadsheet}
            trend={{ value: '+10%', isPositive: true }}
            color="indigo"
            onClick={() => onNavigate('admin-bookings')}
          />
          <StatCard
            title="Flat Sales"
            value={flatSales.length}
            subtitle={`$${(totalSalesVolume / 1000000).toFixed(2)}M closed volume`}
            icon={Home}
            trend={{ value: '3 Closings', isPositive: true }}
            color="emerald"
            onClick={() => onNavigate('admin-flatsales')}
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            subtitle="Sales, accounts & site staff"
            icon={Briefcase}
            trend={{ value: 'Full Roster', isPositive: true }}
            color="slate"
            onClick={() => onNavigate('admin-employees')}
          />
          <StatCard
            title="Total Agents"
            value={totalAgents}
            subtitle="Registered channel partners"
            icon={Users}
            trend={{ value: 'Active', isPositive: true }}
            color="blue"
            onClick={() => onNavigate('admin-user-display')}
          />
        </div>

        {/* HR & Payroll Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div
            onClick={() => onNavigate('admin-employees')}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Employees</span>
              <div className="text-lg font-black text-slate-900 mt-0.5">{totalEmployees}</div>
            </div>
            <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">Roster</span>
          </div>

          <div
            onClick={() => onNavigate('admin-user-display')}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Agents</span>
              <div className="text-lg font-black text-slate-900 mt-0.5">{totalAgents}</div>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Partners</span>
          </div>

          <div
            onClick={() => onNavigate('admin-employeepay')}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Paid Salary Slips</span>
              <div className="text-lg font-black text-emerald-700 mt-0.5">{paidEmployeePayments}</div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Settled</span>
          </div>

          <div
            onClick={() => onNavigate('admin-employeepay')}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Salary</span>
              <div className="text-lg font-black text-amber-700 mt-0.5">{pendingEmployeePayments}</div>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pending</span>
          </div>
        </div>
      </div>

      {/* Revenue & Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Realization Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Revenue & Collections Overview
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Total contracted sales vs collection realization
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {totalSalesVolume > 0 ? Math.round((totalReceivedVolume / totalSalesVolume) * 100) : 0}% Realized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Gross Contracted Value
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                ${totalSalesVolume.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-700 uppercase">
                Total Received
              </span>
              <div className="text-xl font-bold text-emerald-800 mt-1">
                ${totalReceivedVolume.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <span className="text-xs font-semibold text-amber-700 uppercase">
                Outstanding Balance
              </span>
              <div className="text-xl font-bold text-amber-800 mt-1">
                ${(totalSalesVolume - totalReceivedVolume).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Collection Progress</span>
              <span>${totalReceivedVolume.toLocaleString()} of ${totalSalesVolume.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(totalReceivedVolume / totalSalesVolume) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Lead Stage Conversion Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Lead Stage Pipeline
            </h4>
            <div className="mt-4 space-y-3">
              {[
                { stage: 'Initial Discovery', count: 1, pct: '100%', color: 'bg-sky-500' },
                { stage: 'Proposal Sent', count: 1, pct: '75%', color: 'bg-blue-600' },
                { stage: 'Negotiation', count: 1, pct: '50%', color: 'bg-indigo-600' },
                { stage: 'Documentation', count: 1, pct: '25%', color: 'bg-emerald-600' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.stage}</span>
                    <span className="font-bold text-slate-500">{item.count} Lead</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: item.pct }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin-leads')}
            className="mt-5 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Manage Lead Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Enquiries & Follow-up Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Recent Customer Enquiries
            </h4>
            <button
              onClick={() => onNavigate('admin-enquiries')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {enquiries.slice(0, 3).map((enq) => (
              <div key={enq.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {enq.clientName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {enq.projectInterest} • {enq.unitType}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    Assigned: {enq.assignedTo}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge>{enq.status}</Badge>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium">
                    {enq.enquiryDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Follow-ups */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Active Follow-up Schedule
            </h4>
            <button
              onClick={() => onNavigate('admin-followups')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {followups.slice(0, 3).map((flp) => (
              <div key={flp.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{flp.clientName}</span>
                    <Badge variant={flp.priority}>{flp.priority}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{flp.followupDate} at {flp.time}</span>
                    <span>• {flp.mode}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                    "{flp.notes}"
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge>{flp.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

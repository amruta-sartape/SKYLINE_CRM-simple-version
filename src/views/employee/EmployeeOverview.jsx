import React from 'react';
import {
  PlusCircle,
  PhoneCall,
  CalendarCheck,
  Layers,
  FileSpreadsheet,
  Home,
  Receipt,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

export const EmployeeOverview = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { enquiries, followups, leads, bookings, flatSales, pettyCash } = useData();

  const myFollowups = followups.filter((f) => f.status === 'Pending');
  const myBookings = bookings;
  const mySales = flatSales;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-700 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Employee Operations Workspace</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {currentUser?.firstName || 'Executive'}!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Log new enquiries, execute follow-up schedules, register property bookings, and record flat sales.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('emp-enquiry-entry')}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Enquiry</span>
            </button>
            <button
              onClick={() => onNavigate('emp-booking-entry')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Employee Quick Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Enquiries"
          value={enquiries.length}
          subtitle="Direct inquiries & prospects"
          icon={PhoneCall}
          color="blue"
          onClick={() => onNavigate('emp-enquiry-entry')}
        />
        <StatCard
          title="Pending Follow-ups"
          value={myFollowups.length}
          subtitle="Due for call or meeting"
          icon={CalendarCheck}
          color="amber"
          trend={{ value: 'Action Required', isPositive: false }}
          onClick={() => onNavigate('emp-followup-display')}
        />
        <StatCard
          title="Active Leads"
          value={leads.length}
          subtitle="High intent customer pipeline"
          icon={Layers}
          color="purple"
          onClick={() => onNavigate('emp-lead-display')}
        />
        <StatCard
          title="Confirmed Bookings"
          value={myBookings.length}
          subtitle="Processed booking tokens"
          icon={FileSpreadsheet}
          color="emerald"
          onClick={() => onNavigate('emp-booking-display')}
        />
      </div>

      {/* Quick Action Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
          Quick Operational Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Enquiry Entry', tab: 'emp-enquiry-entry', icon: PhoneCall, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
            { label: 'Follow-up Manager', tab: 'emp-followup-display', icon: CalendarCheck, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
            { label: 'Booking Entry', tab: 'emp-booking-entry', icon: FileSpreadsheet, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
            { label: 'Flat Sales Entry', tab: 'emp-sales-entry', icon: Home, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
            { label: 'Vendor Pay', tab: 'emp-vendor-payment', icon: TrendingUp, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
            { label: 'Petty Cash', tab: 'emp-petty-entry', icon: Receipt, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.tab)}
                className={`p-3.5 rounded-xl border border-transparent transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${item.color}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Follow-up Schedule & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Pending Follow-up Calls
            </h4>
            <button
              onClick={() => onNavigate('emp-followup-display')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Open Manager
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {followups.slice(0, 3).map((flp) => (
              <div key={flp.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">{flp.clientName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{flp.followupDate} • {flp.time} ({flp.mode})</div>
                  <p className="text-[11px] text-slate-600 mt-1 italic">"{flp.notes}"</p>
                </div>
                <Badge variant={flp.priority}>{flp.priority}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Recent Confirmed Bookings
            </h4>
            <button
              onClick={() => onNavigate('emp-booking-display')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View Bookings
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {bookings.slice(0, 3).map((bk) => (
              <div key={bk.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">{bk.clientName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{bk.projectName} — {bk.unitNumber}</div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                    Token: ${bk.bookingAmount?.toLocaleString()} / ${bk.totalCost?.toLocaleString()}
                  </div>
                </div>
                <Badge>{bk.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  PhoneCall,
  CalendarCheck,
  Layers,
  FileSpreadsheet,
  Home,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  Award
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

export const AgentOverview = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { enquiries, followups, leads, bookings, flatSales } = useData();

  const myEnquiries = enquiries.filter(
    (e) => e.source === 'Channel Agent' || e.assignedTo?.toLowerCase().includes('marcus') || e.assignedTo?.toLowerCase().includes('agent')
  );

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-700 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Channel Partner Network Portal</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Agent Portal: {currentUser?.firstName || 'Partner'} {currentUser?.lastName || 'Associate'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Track your property client leads, register direct buyer enquiries, manage booking commissions and deal settlements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('agent-enquiry-entry')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Partner Enquiry</span>
            </button>
            <button
              onClick={() => onNavigate('agent-booking-entry')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Register Booking
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Channel Enquiries"
          value={enquiries.length}
          subtitle="Partner client requests"
          icon={PhoneCall}
          color="teal"
          onClick={() => onNavigate('agent-enquiry-display')}
        />
        <StatCard
          title="Active Follow-ups"
          value={followups.length}
          subtitle="Client inspection calls"
          icon={CalendarCheck}
          color="amber"
          onClick={() => onNavigate('agent-followup-display')}
        />
        <StatCard
          title="Pipeline Leads"
          value={leads.length}
          subtitle="Buyer proposals in negotiation"
          icon={Layers}
          color="purple"
          onClick={() => onNavigate('agent-lead-display')}
        />
        <StatCard
          title="Bookings & Sales"
          value={bookings.length}
          subtitle="Processed partner deals"
          icon={Home}
          color="emerald"
          onClick={() => onNavigate('agent-booking-display')}
        />
      </div>

      {/* Quick Launch Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
          Channel Partner Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Register Enquiry', tab: 'agent-enquiry-entry', icon: PlusCircle, color: 'text-teal-700 bg-teal-50 hover:bg-teal-100' },
            { label: 'All Enquiries', tab: 'agent-enquiry-display', icon: PhoneCall, color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
            { label: 'Booking Entry', tab: 'agent-booking-entry', icon: FileSpreadsheet, color: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' },
            { label: 'Sales Registry', tab: 'agent-sales-display', icon: Home, color: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.tab)}
                className={`p-4 rounded-xl border border-transparent transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${item.color}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Partner Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Active Client Leads
            </h4>
            <button
              onClick={() => onNavigate('agent-lead-display')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              View Leads
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {leads.slice(0, 3).map((l) => (
              <div key={l.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">{l.leadName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{l.project} ({l.budget})</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Handled: {l.handledBy}</div>
                </div>
                <Badge>{l.stage}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Assigned Property Bookings
            </h4>
            <button
              onClick={() => onNavigate('agent-booking-display')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              View Bookings
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {bookings.slice(0, 3).map((b) => (
              <div key={b.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">{b.clientName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.projectName} — {b.unitNumber}</div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">${b.totalCost?.toLocaleString()}</div>
                </div>
                <Badge>{b.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

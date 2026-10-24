import React from 'react';
import {
  Building2,
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  FileSpreadsheet,
  CalendarCheck,
  PhoneCall,
  Compass,
  Home,
  CreditCard,
  Receipt,
  BookOpen,
  PieChart,
  Briefcase,
  DollarSign,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  Shield,
  Layers,
  FileSignature,
  Key,
  Landmark,
  Headphones,
  Tag,
  FolderCheck,
  Sparkles,
  Calculator,
  FileText,
  Calendar,
  Bus,
  Send,
  HelpCircle,
  Building,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Sidebar = ({ activeTab, onSelectTab, isMobileOpen, onCloseMobile }) => {
  const { currentUser } = useAuth();
  const {
    enquiries,
    leadTrack,
    followups,
    properties,
    siteVisits,
    negotiations,
    bookings,
    flatSales,
    clientPayments,
    documentCollections,
    loanProcessings,
    agreements,
    possessions,
    customerSupports,
    agentRequests
  } = useData();

  const role = currentUser?.role || 'Admin';

  // Admin Navigation Structure
  const adminNav = [
    {
      group: 'GENERAL',
      items: [
        { id: 'admin-overview', label: 'Overview', icon: LayoutDashboard }
      ]
    },
    {
      group: 'SALES & LEADS (WORKFLOW)',
      items: [
        { id: 'admin-enquiries', label: '1. Client Enquiry', icon: PhoneCall, badge: enquiries?.length },
        { id: 'admin-leads', label: '2. Lead Qualification', icon: Layers, badge: leadTrack?.length },
        { id: 'admin-followups', label: '3. Follow-up Track', icon: CalendarCheck, badge: followups?.filter(f => f.status === 'Pending').length },
        { id: 'admin-properties', label: '4. Property Selection', icon: Home, badge: properties?.length },
        { id: 'admin-sitevisits', label: '5. Site Visit Track', icon: Compass, badge: siteVisits?.length },
        { id: 'admin-negotiations', label: '6. Price Negotiation', icon: Tag, badge: negotiations?.length },
        { id: 'admin-bookings', label: '7. Booking & Track', icon: FileSpreadsheet, badge: bookings?.length },
        { id: 'admin-flatsales', label: '8. Flat Sale Track', icon: Building2, badge: flatSales?.length },
        { id: 'admin-clientpay', label: '9. Client Payment', icon: DollarSign, badge: clientPayments?.length },
        { id: 'admin-documents', label: '10. Document Collection', icon: FolderCheck, badge: documentCollections?.length },
        { id: 'admin-loans', label: '11. Loan Processing', icon: Landmark, badge: loanProcessings?.length },
        { id: 'admin-agreements', label: '12. Sale Agreement', icon: FileSignature, badge: agreements?.length },
        { id: 'admin-possessions', label: '13. Key Possession', icon: Key, badge: possessions?.length },
        { id: 'admin-support', label: '14. Customer Support', icon: Headphones, badge: customerSupports?.length }
      ]
    },
    {
      group: 'FINANCE & PROCUREMENT',
      items: [
        { id: 'admin-vendor-mgmt', label: 'Vendor Management', icon: Building },
        { id: 'admin-po', label: 'Purchase Orders', icon: ShoppingCart },
        { id: 'admin-vendorpay', label: 'Vendor Payment Track', icon: CreditCard },
        { id: 'admin-pettycash', label: 'Petty Cash Track', icon: Receipt },
        { id: 'admin-clientpay', label: 'Client Payment', icon: DollarSign },
        { id: 'admin-daybook', label: 'Day Book', icon: BookOpen },
        { id: 'admin-finance-dash', label: 'Accounts & Finance Dashboard', icon: PieChart }
      ]
    },
    {
      group: 'HR & PAYROLL',
      items: [
        { id: 'admin-employees', label: 'Employee Master & Roster', icon: Briefcase },
        { id: 'admin-attendance', label: 'Attendance & Leaves', icon: Calendar },
        { id: 'admin-interviews', label: 'Interview Schedule & Hiring', icon: UserCheck },
        { id: 'admin-transport', label: 'Emp Transport Routes', icon: Bus },
        { id: 'admin-meetings', label: 'Meeting Schedule', icon: CalendarCheck },
        { id: 'admin-notice', label: 'Notice Period & Relieving', icon: FileText },
        { id: 'admin-salary-process', label: 'Salary Processing', icon: Calculator },
        { id: 'admin-employeepay', label: 'Employee Payment', icon: DollarSign },
        { id: 'admin-salary-slip', label: 'Official Salary Slips', icon: FileText }
      ]
    },
    {
      group: 'USER MANAGEMENT',
      items: [
        { id: 'admin-user-create', label: 'Create User', icon: UserPlus },
        { id: 'admin-user-display', label: 'Display Directory', icon: Users },
        { id: 'admin-user-update', label: 'Update User Profile', icon: UserCheck },
        { id: 'admin-user-remove', label: 'Remove / Suspend', icon: UserX }
      ]
    }
  ];

  // Employee Navigation Structure
  const employeeNav = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'emp-overview', label: 'Employee Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'CLIENTS & LEADS',
      items: [
        { id: 'emp-enquiry-entry', label: 'Enquiry Entry', icon: PlusCircle },
        { id: 'emp-all-enquiry', label: 'Display All Enquiry', icon: PhoneCall, badge: enquiries?.length },
        { id: 'emp-lead-display', label: 'Lead Qualification', icon: Layers, badge: leadTrack?.length },
        { id: 'emp-client-reg', label: 'Client Registration', icon: UserPlus }
      ]
    },
    {
      group: 'FOLLOW-UPS',
      items: [
        { id: 'emp-followup-display', label: 'Follow-up Display', icon: Eye, badge: followups?.length },
        { id: 'emp-followup-update', label: 'Follow-up Update', icon: Edit },
        { id: 'emp-followup-delete', label: 'Follow-up Delete', icon: Trash2 }
      ]
    },
    {
      group: 'PROPERTY & VISITS',
      items: [
        { id: 'emp-properties', label: 'Property Selection', icon: Home },
        { id: 'emp-sitevisits', label: 'Site Visits', icon: Compass },
        { id: 'emp-negotiations', label: 'Price Negotiation', icon: Tag }
      ]
    },
    {
      group: 'BOOKINGS',
      items: [
        { id: 'emp-booking-entry', label: 'Booking Entry', icon: PlusCircle },
        { id: 'emp-booking-display', label: 'Display Booking', icon: FileSpreadsheet, badge: bookings?.length },
        { id: 'emp-booking-update', label: 'Booking Update', icon: Edit },
        { id: 'emp-booking-delete', label: 'Booking Delete', icon: Trash2 }
      ]
    },
    {
      group: 'SALES & CLIENT PAYMENT',
      items: [
        { id: 'emp-sales-entry', label: 'Flat Sales Entry', icon: PlusCircle },
        { id: 'emp-sales-display', label: 'Sales Display', icon: Building2 },
        { id: 'emp-sales-update', label: 'Sales Update', icon: Edit },
        { id: 'emp-sales-delete', label: 'Sales Delete', icon: Trash2 },
        { id: 'emp-client-pay', label: 'Clients Payment', icon: DollarSign },
        { id: 'emp-client-pay-display', label: 'Display Client Payment', icon: CreditCard },
        { id: 'emp-documents', label: 'Document Collection', icon: FolderCheck },
        { id: 'emp-loans', label: 'Loan Processing', icon: Landmark },
        { id: 'emp-agreements', label: 'Sale Agreement', icon: FileSignature },
        { id: 'emp-possessions', label: 'Possession & Keys', icon: Key },
        { id: 'emp-support', label: 'Customer Support', icon: Headphones }
      ]
    },
    {
      group: 'VENDOR & PROCUREMENT',
      items: [
        { id: 'emp-vendor-enquiry', label: 'Vendor Enquiry', icon: Building },
        { id: 'emp-vendor-reg', label: 'Vendor Registration', icon: PlusCircle },
        { id: 'emp-vendor-payment', label: 'Vendor Payment', icon: CreditCard },
        { id: 'emp-purchase-entry', label: 'Purchase Entry', icon: ShoppingCart },
        { id: 'emp-purchase-display', label: 'Display Purchase Entry', icon: FileSpreadsheet }
      ]
    },
    {
      group: 'PETTY CASH',
      items: [
        { id: 'emp-petty-entry', label: 'Petty Cash Entry', icon: PlusCircle },
        { id: 'emp-petty-display', label: 'Show Petty Cash', icon: Receipt }
      ]
    },
    {
      group: 'SCHEDULE & HR',
      items: [
        { id: 'emp-meeting-schedule', label: 'Meeting Schedule', icon: CalendarCheck },
        { id: 'emp-notice-period', label: 'Notice Period', icon: FileText }
      ]
    }
  ];

  // Agent Navigation Structure
  const agentNav = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'agent-overview', label: 'Agent Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'ENQUIRIES',
      items: [
        { id: 'agent-enquiry-entry', label: 'Enquiry Entry', icon: PlusCircle },
        { id: 'agent-enquiry-display', label: 'Display All Enquiry', icon: PhoneCall, badge: enquiries?.length }
      ]
    },
    {
      group: 'FOLLOW-UPS & LEADS',
      items: [
        { id: 'agent-followup-display', label: 'Follow-up Display', icon: CalendarCheck, badge: followups?.length },
        { id: 'agent-lead-display', label: 'Lead Qualification', icon: Layers, badge: leadTrack?.length }
      ]
    },
    {
      group: 'PROPERTY & VISITS',
      items: [
        { id: 'agent-properties', label: 'Property Selection', icon: Home },
        { id: 'agent-sitevisits', label: 'Site Visit Track', icon: Compass }
      ]
    },
    {
      group: 'BOOKINGS & NEGOTIATION',
      items: [
        { id: 'agent-negotiations', label: 'Price Negotiation', icon: Tag },
        { id: 'agent-booking-entry', label: 'Booking Entry', icon: PlusCircle },
        { id: 'agent-booking-display', label: 'Display Booking', icon: FileSpreadsheet },
        { id: 'agent-booking-update', label: 'Booking Update', icon: Edit },
        { id: 'agent-booking-delete', label: 'Booking Delete', icon: Trash2 }
      ]
    },
    {
      group: 'SALES & POST-SALES',
      items: [
        { id: 'agent-sales-entry', label: 'Sales Entry', icon: PlusCircle },
        { id: 'agent-sales-display', label: 'Display Sales', icon: Building2 },
        { id: 'agent-sales-update', label: 'Sales Update', icon: Edit },
        { id: 'agent-sales-delete', label: 'Sales Delete', icon: Trash2 },
        { id: 'agent-documents', label: 'Document Collection', icon: FolderCheck },
        { id: 'agent-support', label: 'Customer Support', icon: Headphones }
      ]
    },
    {
      group: 'AGENT REQUESTS',
      items: [
        { id: 'agent-request-raise', label: 'Request Raise', icon: Send },
        { id: 'agent-request-display', label: 'Display Request', icon: Eye, badge: agentRequests?.length }
      ]
    }
  ];

  const currentNav =
    role === 'Admin' ? adminNav : role === 'Employee' ? employeeNav : agentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>Skyline</span>
                <span className="text-brand-400">CRM</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Real Estate Enterprise
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {role}
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-6">
          {currentNav.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.group}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer / User Profile summary */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-brand-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {currentUser?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <Shield className="w-3 h-3 text-brand-400 shrink-0" />
                <span>{currentUser?.role} Portal</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

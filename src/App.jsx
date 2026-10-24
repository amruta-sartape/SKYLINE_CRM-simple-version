import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Views
import { LoginPage } from './components/auth/LoginPage';

// Sales & Leads 14 Modules
import {
  ClientEnquiryPage,
  LeadQualificationPage,
  FollowupManagementPage,
  PropertySelectionPage,
  SiteVisitPage,
  NegotiationPage,
  BookingPage,
  FlatSaleTrackPage,
  ClientPaymentPage,
  DocumentCollectionPage,
  LoanProcessingPage,
  AgreementPage,
  PossessionPage,
  CustomerSupportPage
} from './views/sales';

// Admin Views
import { AdminOverview } from './views/admin/AdminOverview';
import { VendorManagement } from './views/admin/Finance/VendorManagement';
import { PurchaseOrderPage } from './views/admin/Finance/PurchaseOrderPage';
import { VendorPaymentTrack } from './views/admin/Finance/VendorPaymentTrack';
import { PettyCashTrack } from './views/admin/Finance/PettyCashTrack';
import { DayBook } from './views/admin/Finance/DayBook';
import { FinanceDashboard } from './views/admin/Finance/FinanceDashboard';
import {
  EmployeeManagement,
  AttendanceSection,
  SalaryProcessing,
  EmployeePayment,
  SalarySlipPage,
  InterviewManager,
  EmpTransport,
  MeetingSchedule,
  NoticePeriod
} from './views/admin/HRPayroll';
import { CreateUser } from './views/admin/UserManagement/CreateUser';
import { DisplayUser } from './views/admin/UserManagement/DisplayUser';
import { UpdateUser } from './views/admin/UserManagement/UpdateUser';
import { RemoveUser } from './views/admin/UserManagement/RemoveUser';

// Employee Views
import { EmployeeOverview } from './views/employee/EmployeeOverview';
import { EnquiryEntry } from './views/employee/EnquiryEntry';
import { FollowupManager } from './views/employee/FollowupManager';
import { BookingManager } from './views/employee/BookingManager';
import { FlatSalesManager } from './views/employee/FlatSalesManager';
import { VendorPayment } from './views/employee/VendorPayment';
import { PettyCashManager } from './views/employee/PettyCashManager';
import { EmployeePurchaseManager } from './views/employee/EmployeePurchaseManager';

// Agent Views
import { AgentOverview } from './views/agent/AgentOverview';
import { AgentEnquiry } from './views/agent/AgentEnquiry';
import { AgentFollowup } from './views/agent/AgentFollowup';
import { AgentLead } from './views/agent/AgentLead';
import { AgentBooking } from './views/agent/AgentBooking';
import { AgentSales } from './views/agent/AgentSales';
import { AgentRequests } from './views/agent/AgentRequests';

import { Loader2 } from 'lucide-react';

const tabLabelMap = {
  // Admin & Sales Pipeline
  'admin-overview': 'Executive Overview',
  'admin-enquiries': '1. Client Enquiry',
  'admin-leads': '2. Lead Qualification Track',
  'admin-followups': '3. Follow-up Management',
  'admin-properties': '4. Property Selection & Inventory',
  'admin-sitevisits': '5. Site Visit Track',
  'admin-negotiations': '6. Price Negotiation',
  'admin-bookings': '7. Booking & Track',
  'admin-flatsales': '8. Flat Sale Track',
  'admin-clientpay': '9. Client Payment',
  'admin-documents': '10. Document Collection & KYC',
  'admin-loans': '11. Bank Loan Processing',
  'admin-agreements': '12. Sale Agreement Registration',
  'admin-possessions': '13. Possession & Key Handover',
  'admin-support': '14. Customer Support Helpdesk',

  // Finance & Procurement
  'admin-vendor-mgmt': 'Vendor Master & Management',
  'admin-po': 'Purchase Orders & Procurement',
  'admin-vendorpay': 'Vendor Payment Track',
  'admin-pettycash': 'Petty Cash Track',
  'admin-daybook': 'Day Book Ledger',
  'admin-finance-dash': 'Accounts & Finance Dashboard',

  // HR & Payroll
  'admin-employees': 'Employee Master & Roster',
  'admin-attendance': 'Attendance & Leaves',
  'admin-interviews': 'Interview Schedule & Hiring',
  'admin-transport': 'Emp Transport Routes',
  'admin-meetings': 'Meeting Schedule',
  'admin-notice': 'Notice Period & Relieving',
  'admin-salary-process': 'Salary Processing',
  'admin-employeepay': 'Employee Payment',
  'admin-salary-slip': 'Official Salary Slips',

  // User Management
  'admin-user-create': 'Create User',
  'admin-user-display': 'Display Directory',
  'admin-user-update': 'Update User Profile',
  'admin-user-remove': 'Remove / Suspend User',

  // Employee
  'emp-overview': 'Employee Dashboard',
  'emp-enquiry-entry': 'Enquiry Entry',
  'emp-all-enquiry': 'Display All Enquiry',
  'emp-lead-display': 'Lead Qualification Display',
  'emp-client-reg': 'Client Registration',
  'emp-followup-display': 'Follow-up Display',
  'emp-followup-update': 'Follow-up Update',
  'emp-followup-delete': 'Follow-up Delete',
  'emp-properties': 'Property Selection',
  'emp-sitevisits': 'Site Visits',
  'emp-negotiations': 'Price Negotiation',
  'emp-booking-entry': 'Booking Entry',
  'emp-booking-display': 'Display Booking',
  'emp-booking-update': 'Booking Update',
  'emp-booking-delete': 'Booking Delete',
  'emp-sales-entry': 'Flat Sales Entry',
  'emp-sales-display': 'Sales Display',
  'emp-sales-update': 'Sales Update',
  'emp-sales-delete': 'Sales Delete',
  'emp-client-pay': 'Clients Payment',
  'emp-client-pay-display': 'Display Client Payment',
  'emp-documents': 'Document Collection',
  'emp-loans': 'Loan Processing',
  'emp-agreements': 'Sale Agreement',
  'emp-possessions': 'Possession & Keys',
  'emp-support': 'Customer Support',
  'emp-vendor-enquiry': 'Vendor Enquiry',
  'emp-vendor-reg': 'Vendor Registration',
  'emp-vendor-payment': 'Vendor Payment',
  'emp-purchase-entry': 'Purchase Entry',
  'emp-purchase-display': 'Display Purchase Entry',
  'emp-petty-entry': 'Petty Cash Entry',
  'emp-petty-display': 'Show Petty Cash',
  'emp-meeting-schedule': 'Meeting Schedule',
  'emp-notice-period': 'Notice Period',

  // Agent
  'agent-overview': 'Agent Dashboard',
  'agent-enquiry-entry': 'Enquiry Entry',
  'agent-enquiry-display': 'Display All Enquiry',
  'agent-followup-display': 'Follow-up Display',
  'agent-lead-display': 'Lead Qualification Display',
  'agent-properties': 'Property Selection',
  'agent-sitevisits': 'Site Visit Track',
  'agent-negotiations': 'Price Negotiation',
  'agent-booking-entry': 'Booking Entry',
  'agent-booking-display': 'Display Booking',
  'agent-booking-update': 'Booking Update',
  'agent-booking-delete': 'Booking Delete',
  'agent-sales-entry': 'Sales Entry',
  'agent-sales-display': 'Display Sales',
  'agent-sales-update': 'Sales Update',
  'agent-sales-delete': 'Sales Delete',
  'agent-documents': 'Document Collection',
  'agent-support': 'Customer Support',
  'agent-request-raise': 'Request Raise',
  'agent-request-display': 'Display Request'
};

const MainAppContent = () => {
  const { currentUser, loadingAuthState } = useAuth();
  const [activeTab, setActiveTab] = useState('admin-overview');
  const [editingUser, setEditingUser] = useState(null);

  // Sync default tab when role switches or user logs in
  useEffect(() => {
    if (currentUser?.role === 'Admin') {
      setActiveTab('admin-overview');
    } else if (currentUser?.role === 'Employee') {
      setActiveTab('emp-overview');
    } else if (currentUser?.role === 'Agent') {
      setActiveTab('agent-overview');
    }
  }, [currentUser?.role]);

  // Loading initial authentication state
  if (loadingAuthState) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
        <p className="text-sm text-slate-400 font-medium">Loading Skyline CRM...</p>
      </div>
    );
  }

  // If not authenticated, render Login Page as first screen
  if (!currentUser) {
    return <LoginPage />;
  }

  // Render appropriate view based on activeTab with Role Security Guard
  const renderCurrentView = () => {
    const userRole = currentUser?.role || 'Admin';

    // Strict Role-Based Security: Prevent unauthorized navigation by URL or state
    if (userRole === 'Employee' && (activeTab.startsWith('admin-') || activeTab.startsWith('agent-'))) {
      return <EmployeeOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
    if (userRole === 'Agent' && (activeTab.startsWith('admin-') || activeTab.startsWith('emp-'))) {
      return <AgentOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }

    switch (activeTab) {
      // --- ADMIN & 14 SALES/LEADS MODULES ---
      case 'admin-overview':
        return <AdminOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case 'admin-enquiries':
        return <ClientEnquiryPage />;
      case 'admin-leads':
        return <LeadQualificationPage />;
      case 'admin-followups':
        return <FollowupManagementPage />;
      case 'admin-properties':
        return <PropertySelectionPage />;
      case 'admin-sitevisits':
        return <SiteVisitPage />;
      case 'admin-negotiations':
        return <NegotiationPage />;
      case 'admin-bookings':
        return <BookingPage />;
      case 'admin-flatsales':
        return <FlatSaleTrackPage />;
      case 'admin-clientpay':
        return <ClientPaymentPage />;
      case 'admin-documents':
        return <DocumentCollectionPage />;
      case 'admin-loans':
        return <LoanProcessingPage />;
      case 'admin-agreements':
        return <AgreementPage />;
      case 'admin-possessions':
        return <PossessionPage />;
      case 'admin-support':
        return <CustomerSupportPage />;

      // --- ADMIN FINANCE & HR ---
      case 'admin-vendor-mgmt':
        return <VendorManagement />;
      case 'admin-po':
        return <PurchaseOrderPage />;
      case 'admin-vendorpay':
        return <VendorPaymentTrack />;
      case 'admin-pettycash':
        return <PettyCashTrack />;
      case 'admin-daybook':
        return <DayBook />;
      case 'admin-finance-dash':
        return <FinanceDashboard />;
      case 'admin-employees':
        return <EmployeeManagement />;
      case 'admin-attendance':
        return <AttendanceSection />;
      case 'admin-interviews':
        return <InterviewManager />;
      case 'admin-transport':
        return <EmpTransport />;
      case 'admin-meetings':
        return <MeetingSchedule />;
      case 'admin-notice':
        return <NoticePeriod />;
      case 'admin-salary-process':
        return <SalaryProcessing />;
      case 'admin-employeepay':
        return <EmployeePayment />;
      case 'admin-salary-slip':
        return <SalarySlipPage />;
      case 'admin-user-create':
        return <CreateUser onNavigateToList={() => setActiveTab('admin-user-display')} />;
      case 'admin-user-display':
        return (
          <DisplayUser
            onNavigateToCreate={() => setActiveTab('admin-user-create')}
            onSelectUserToEdit={(u) => {
              setEditingUser(u);
              setActiveTab('admin-user-update');
            }}
          />
        );
      case 'admin-user-update':
        return (
          <UpdateUser
            selectedUser={editingUser}
            onUpdated={() => setActiveTab('admin-user-display')}
          />
        );
      case 'admin-user-remove':
        return <RemoveUser onUserRemoved={() => setActiveTab('admin-user-display')} />;

      // --- EMPLOYEE VIEWS ---
      case 'emp-overview':
        return <EmployeeOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case 'emp-enquiry-entry':
        return <EnquiryEntry onNavigateToList={() => setActiveTab('emp-all-enquiry')} />;
      case 'emp-all-enquiry':
        return <ClientEnquiryPage />;
      case 'emp-lead-display':
        return <LeadQualificationPage />;
      case 'emp-client-reg':
        return <EnquiryEntry onNavigateToList={() => setActiveTab('emp-all-enquiry')} />;
      case 'emp-followup-display':
        return <FollowupManager initialMode="display" />;
      case 'emp-followup-update':
        return <FollowupManager initialMode="update" />;
      case 'emp-followup-delete':
        return <FollowupManager initialMode="delete" />;
      case 'emp-properties':
        return <PropertySelectionPage />;
      case 'emp-sitevisits':
        return <SiteVisitPage />;
      case 'emp-negotiations':
        return <NegotiationPage />;
      case 'emp-booking-entry':
        return <BookingManager initialMode="entry" />;
      case 'emp-booking-display':
        return <BookingManager initialMode="display" />;
      case 'emp-booking-update':
        return <BookingManager initialMode="update" />;
      case 'emp-booking-delete':
        return <BookingManager initialMode="delete" />;
      case 'emp-sales-entry':
        return <FlatSalesManager initialMode="entry" />;
      case 'emp-sales-display':
        return <FlatSalesManager initialMode="display" />;
      case 'emp-sales-update':
        return <FlatSalesManager initialMode="update" />;
      case 'emp-sales-delete':
        return <FlatSalesManager initialMode="delete" />;
      case 'emp-client-pay':
      case 'emp-client-pay-display':
        return <ClientPaymentPage />;
      case 'emp-documents':
        return <DocumentCollectionPage />;
      case 'emp-loans':
        return <LoanProcessingPage />;
      case 'emp-agreements':
        return <AgreementPage />;
      case 'emp-possessions':
        return <PossessionPage />;
      case 'emp-support':
        return <CustomerSupportPage />;
      case 'emp-vendor-enquiry':
      case 'emp-vendor-reg':
        return <VendorManagement />;
      case 'emp-vendor-payment':
        return <VendorPayment />;
      case 'emp-purchase-entry':
        return <EmployeePurchaseManager initialMode="entry" />;
      case 'emp-purchase-display':
        return <EmployeePurchaseManager initialMode="display" />;
      case 'emp-petty-entry':
        return <PettyCashManager initialMode="entry" />;
      case 'emp-petty-display':
        return <PettyCashManager initialMode="display" />;
      case 'emp-meeting-schedule':
        return <MeetingSchedule />;
      case 'emp-notice-period':
        return <NoticePeriod />;

      // --- AGENT VIEWS ---
      case 'agent-overview':
        return <AgentOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case 'agent-enquiry-entry':
        return <AgentEnquiry initialMode="entry" />;
      case 'agent-enquiry-display':
        return <AgentEnquiry initialMode="display" />;
      case 'agent-followup-display':
        return <AgentFollowup />;
      case 'agent-lead-display':
        return <AgentLead />;
      case 'agent-properties':
        return <PropertySelectionPage />;
      case 'agent-sitevisits':
        return <SiteVisitPage />;
      case 'agent-negotiations':
        return <NegotiationPage />;
      case 'agent-booking-entry':
        return <AgentBooking initialMode="entry" />;
      case 'agent-booking-display':
        return <AgentBooking initialMode="display" />;
      case 'agent-booking-update':
        return <AgentBooking initialMode="update" />;
      case 'agent-booking-delete':
        return <AgentBooking initialMode="delete" />;
      case 'agent-sales-entry':
        return <AgentSales initialMode="entry" />;
      case 'agent-sales-display':
        return <AgentSales initialMode="display" />;
      case 'agent-sales-update':
        return <AgentSales initialMode="update" />;
      case 'agent-sales-delete':
        return <AgentSales initialMode="delete" />;
      case 'agent-documents':
        return <DocumentCollectionPage />;
      case 'agent-support':
        return <CustomerSupportPage />;
      case 'agent-request-raise':
        return <AgentRequests initialMode="raise" />;
      case 'agent-request-display':
        return <AgentRequests initialMode="display" />;

      default:
        return <AdminOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={(tabId) => setActiveTab(tabId)}
      tabLabelMap={tabLabelMap}
    >
      {renderCurrentView()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <MainAppContent />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

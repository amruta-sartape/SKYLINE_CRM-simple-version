import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerRegisterPage } from './pages/CustomerRegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { AppOverviewPage } from './pages/AppOverviewPage';
import { CustomerHomePage } from './pages/CustomerHomePage';
import { CustomerWishlistPage } from './pages/CustomerWishlistPage';
import { CustomerEnquiriesPage } from './pages/CustomerEnquiriesPage';
import { CustomerSiteVisitsPage } from './pages/CustomerSiteVisitsPage';
import { EnquiriesPage } from './pages/EnquiriesPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadPipelinePage } from './pages/LeadPipelinePage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PropertyDiscoveryPage } from './pages/PropertyDiscoveryPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { UnitDetailPage } from './pages/UnitDetailPage';
import { SiteVisitsPage } from './pages/SiteVisitsPage';
import { SiteVisitDetailPage } from './pages/SiteVisitDetailPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { FollowUpDetailPage } from './pages/FollowUpDetailPage';
import { AdminPropertiesPage } from './pages/AdminPropertiesPage';

const isCustomerUser = (user: any) =>
  Boolean(
    user?.roles?.some((r: string) => String(r).toUpperCase().trim() === 'CUSTOMER') ||
    String(user?.role || '').toUpperCase().trim() === 'CUSTOMER'
  );

// Public Route Guard (Redirects already authenticated users to appropriate landing)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    const isCustomer = isCustomerUser(user);
    return <Navigate to={isCustomer ? '/customer' : '/'} replace />;
  }

  return <>{children}</>;
};

// Dynamic Root Router: Renders Customer Portal Home for CUSTOMER role, or CRM Overview for Staff
const RootRoute: React.FC = () => {
  const { user } = useAuth();
  if (isCustomerUser(user)) {
    return <CustomerHomePage />;
  }
  return <AppOverviewPage />;
};

// Enquiries Gateway: Renders My Enquiries for Customer, or CRM Enquiries Management for Staff
const EnquiriesGatewayRoute: React.FC = () => {
  const { user } = useAuth();
  if (isCustomerUser(user)) {
    return <CustomerEnquiriesPage />;
  }
  return <EnquiriesPage />;
};

// Site Visits Gateway: Renders My Site Visits for Customer, or CRM Visits Management for Staff
const SiteVisitsGatewayRoute: React.FC = () => {
  const { user } = useAuth();
  if (isCustomerUser(user)) {
    return <CustomerSiteVisitsPage />;
  }
  return <SiteVisitsPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/customer/login"
        element={
          <PublicRoute>
            <CustomerLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/customer-login"
        element={
          <PublicRoute>
            <CustomerLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/customer/register"
        element={
          <PublicRoute>
            <CustomerRegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/customer-register"
        element={
          <PublicRoute>
            <CustomerRegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Access Denied Route */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Customer Specific Portal Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/home"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerWishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/wishlist"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerWishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-enquiries"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerEnquiriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/enquiries"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerEnquiriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-site-visits"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerSiteVisitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/site-visits"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerSiteVisitsPage />
          </ProtectedRoute>
        }
      />

      {/* Universal Property Discovery & Details (Accessible to Customer, Staff & Public Visitors) */}
      <Route path="/discovery" element={<PropertyDiscoveryPage />} />
      <Route path="/discovery/:propertyId" element={<PropertyDetailPage />} />
      <Route path="/explore" element={<PropertyDiscoveryPage />} />
      <Route path="/explore/:propertyId" element={<PropertyDetailPage />} />

      {/* Enquiries & Visits Gateways (Adapts between Customer and Staff views) */}
      <Route
        path="/enquiries"
        element={
          <ProtectedRoute>
            <EnquiriesGatewayRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-visits"
        element={
          <ProtectedRoute>
            <SiteVisitsGatewayRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-visits/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <SiteVisitDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Internal CRM Management Routes (Staff Only) */}
      <Route
        path="/leads"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/pipeline"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <LeadPipelinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <LeadDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/follow-ups"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <FollowUpsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/follow-ups/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <FollowUpDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPropertiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'AGENT']}>
            <UnitDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Root Route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RootRoute />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <WishlistProvider>
              <AppRoutes />
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

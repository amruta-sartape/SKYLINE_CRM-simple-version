import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { AppOverviewPage } from './pages/AppOverviewPage';
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

// Public Route Guard (Redirects already authenticated users to Dashboard)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // AuthProvider handles splash loading
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
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
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
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

      {/* Access Denied Route */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Phase 2 CRM Core */}
      <Route
        path="/enquiries"
        element={
          <ProtectedRoute>
            <EnquiriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leads/pipeline"
        element={
          <ProtectedRoute>
            <LeadPipelinePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>
            <LeadDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Customer Property Discovery & Catalog */}
      <Route
        path="/discovery"
        element={
          <ProtectedRoute>
            <PropertyDiscoveryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discovery/:propertyId"
        element={
          <ProtectedRoute>
            <PropertyDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <PropertyDiscoveryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore/:propertyId"
        element={
          <ProtectedRoute>
            <PropertyDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Phase 3 Property Catalog & Inventory Management */}
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
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/:id"
        element={
          <ProtectedRoute>
            <UnitDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Phase 4 Site Visit & Follow-Up Management */}
      <Route
        path="/site-visits"
        element={
          <ProtectedRoute>
            <SiteVisitsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/site-visits/:id"
        element={
          <ProtectedRoute>
            <SiteVisitDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/follow-ups"
        element={
          <ProtectedRoute>
            <FollowUpsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/follow-ups/:id"
        element={
          <ProtectedRoute>
            <FollowUpDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Auth Overview & RBAC Live Tester Console */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppOverviewPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/enquiries" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

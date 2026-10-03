import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth.types';
import { Spinner } from '../ui/Spinner';
import { SkylineBrand } from './SkylineBrand';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <SkylineBrand variant="light" size="lg" />
        <div className="mt-8 flex flex-col items-center gap-3">
          <Spinner size="lg" variant="white" />
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            Verifying Security Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const isCustomerTarget = Boolean(
      (allowedRoles && allowedRoles.some((r) => String(r).toUpperCase().trim() === 'CUSTOMER')) ||
      location.pathname.startsWith('/customer') ||
      ['/wishlist', '/my-enquiries', '/my-site-visits'].includes(location.pathname)
    );
    const loginTarget = isCustomerTarget ? '/customer/login' : '/login';
    // Redirect unauthenticated visitor to appropriate login page, preserving return target
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  // Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.some((role) => hasRole(role));
    if (!isAuthorized) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            requiredRoles: allowedRoles,
            userRoles: user.roles,
            attemptedPath: location.pathname,
          }}
          replace
        />
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

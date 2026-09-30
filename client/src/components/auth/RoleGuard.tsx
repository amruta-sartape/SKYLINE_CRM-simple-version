import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth.types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  fallback = null,
  children,
}) => {
  const { hasRole } = useAuth();
  const isAllowed = allowedRoles.some((role) => hasRole(role));

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

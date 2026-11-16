import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Role } from '@/shared/types/api';

interface RequireRoleProps {
  role: Role | Role[];
  children: React.ReactNode;
}

/**
 * RequireRole Guard
 * Protects role-specific routes (e.g., SELLER or ADMIN).
 * Redirects unauthenticated users to /login?returnTo=...
 * Redirects authenticated users without the necessary role to /403.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const { isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  if (!hasRole(role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

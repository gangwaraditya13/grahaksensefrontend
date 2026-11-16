import React from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Role } from '@/shared/types/api';

interface RoleGateProps {
  role: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGate Component
 * Conditionally renders UI elements (buttons, navigation links, badges)
 * depending on whether the current user holds the required role(s).
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  role,
  children,
  fallback = null,
}) => {
  const { hasRole } = useAuthStore();

  if (!hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

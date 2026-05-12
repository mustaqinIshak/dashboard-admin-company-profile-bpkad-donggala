import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  roles: string[];
}

const RoleProtectedRoute: React.FC<Props> = ({ roles }) => {
  const { isAuthenticated, hasAnyRole } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasAnyRole(roles)) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
};

export default RoleProtectedRoute;

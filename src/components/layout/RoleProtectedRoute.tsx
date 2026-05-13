import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Props {
  roles: string[];
}

const RoleProtectedRoute: React.FC<Props> = ({ roles }) => {
  const { isAuthenticated, hasAnyRole, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) return <LoadingSpinner/>; // or a loading spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasAnyRole(roles)) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
};

export default RoleProtectedRoute;

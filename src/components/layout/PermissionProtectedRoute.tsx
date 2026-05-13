/**
 * PermissionProtectedRoute — Route guard berbasis PBAC permission.
 *
 * Gunakan ini untuk melindungi route berdasarkan permission, bukan role.
 * Lebih future-proof: ketika role baru ditambahkan di backend dengan
 * permission yang sama, route ini otomatis terbuka tanpa perubahan kode.
 *
 * @example
 *   // Butuh salah satu permission (anyOf)
 *   <Route element={<PermissionProtectedRoute anyOf={[VIEW_TAMU, MANAGE_TAMU]} />}>
 *     <Route path="/tamu" element={<TamuPage />} />
 *   </Route>
 *
 *   // Butuh permission spesifik
 *   <Route element={<PermissionProtectedRoute permission={MANAGE_ADMIN_USERS} />}>
 *     <Route path="/admin-management" element={<AdminManagementPage />} />
 *   </Route>
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { usePermission } from '../../hooks/usePermission';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { Permission } from '../../lib/permissions';

interface Props {
  /** Butuh tepat satu permission ini */
  permission?: Permission | string;
  /** Butuh setidaknya satu dari permission ini (OR logic) */
  anyOf?: (Permission | string)[];
  /** Butuh semua permission ini (AND logic) */
  allOf?: (Permission | string)[];
}

const PermissionProtectedRoute: React.FC<Props> = ({
  permission,
  anyOf,
  allOf,
}) => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { can, canAny, canAll } = usePermission();

  if (!_hasHydrated) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  let allowed = true;

  if (permission !== undefined) {
    allowed = allowed && can(permission);
  }
  if (anyOf !== undefined && anyOf.length > 0) {
    allowed = allowed && canAny(anyOf);
  }
  if (allOf !== undefined && allOf.length > 0) {
    allowed = allowed && canAll(allOf);
  }

  if (!allowed) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
};

export default PermissionProtectedRoute;

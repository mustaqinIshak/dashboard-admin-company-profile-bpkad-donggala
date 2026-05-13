/**
 * usePermission — Hook untuk permission checking berbasis PBAC.
 *
 * Gunakan hook ini di dalam komponen React untuk memeriksa izin user
 * tanpa perlu bergantung pada nama role. Frontend hanya tahu soal
 * permission, bukan soal role — sehingga penambahan role baru di
 * backend tidak memerlukan perubahan kode frontend.
 *
 * @example
 *   const { can, canAny } = usePermission();
 *
 *   // Tampilkan tombol hanya jika boleh
 *   {can(MANAGE_BERITA) && <Button>Tambah Berita</Button>}
 *
 *   // Tampilkan jika memiliki salah satu permission
 *   {canAny([VIEW_SURAT_KELUAR, MANAGE_SURAT_KELUAR]) && <NavLink to="/surat-keluar" />}
 */

import { useAuthStore } from '../stores/authStore';
import type { Permission } from '../lib/permissions';

interface UsePermissionReturn {
  /** Apakah user memiliki permission ini? */
  can: (permission: Permission | string) => boolean;
  /** Apakah user memiliki setidaknya satu dari permission-permission ini? */
  canAny: (permissions: (Permission | string)[]) => boolean;
  /** Apakah user memiliki semua permission yang diberikan? */
  canAll: (permissions: (Permission | string)[]) => boolean;
  /** Daftar permission yang dimiliki user saat ini */
  permissions: string[];
}

export function usePermission(): UsePermissionReturn {
  const { user, hasPermission, hasAnyPermission } = useAuthStore();
  const permissions = user?.permissions ?? [];

  const can = (permission: Permission | string) =>
    hasPermission(permission);

  const canAny = (perms: (Permission | string)[]) =>
    hasAnyPermission(perms);

  const canAll = (perms: (Permission | string)[]) =>
    perms.every((p) => permissions.includes(p));

  return { can, canAny, canAll, permissions };
}

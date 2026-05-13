/**
 * PermissionGate — Komponen untuk menyembunyikan/menampilkan konten
 * berdasarkan permission PBAC.
 *
 * Lebih ekspresif dari pengecekan inline, dan mudah diganti
 * tanpa menyentuh logika bisnis jika izin berubah.
 *
 * @example
 *   // Tampilkan hanya jika user bisa manage_berita
 *   <PermissionGate permission={MANAGE_BERITA}>
 *     <Button>Tambah Berita</Button>
 *   </PermissionGate>
 *
 *   // Tampilkan jika memiliki salah satu permission (anyOf)
 *   <PermissionGate anyOf={[VIEW_SURAT_MASUK, MANAGE_SURAT_MASUK]}>
 *     <NavLink to="/surat-masuk">Surat Masuk</NavLink>
 *   </PermissionGate>
 *
 *   // Tampilkan fallback jika tidak punya izin
 *   <PermissionGate permission={APPROVE_SURAT_KELUAR} fallback={<p>Akses ditolak</p>}>
 *     <TombolSetujui />
 *   </PermissionGate>
 */

import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import type { Permission } from '../../lib/permissions';

interface PermissionGateProps {
  /** Cek satu permission (AND dengan anyOf jika keduanya diberikan) */
  permission?: Permission | string;
  /** Cek setidaknya satu dari permission yang diberikan (OR logic) */
  anyOf?: (Permission | string)[];
  /** Cek semua permission yang diberikan (AND logic) */
  allOf?: (Permission | string)[];
  /** Konten yang ditampilkan jika izin terpenuhi */
  children: React.ReactNode;
  /** Konten fallback jika izin tidak terpenuhi (default: null) */
  fallback?: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}) => {
  const { can, canAny, canAll } = usePermission();

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

  return allowed ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;

/**
 * Permission-Based Access Control (PBAC) — Konstanta Permission
 *
 * File ini adalah satu-satunya tempat di frontend yang mendefinisikan
 * string permission. Gunakan konstanta ini di mana pun Anda perlu
 * memeriksa izin (routes, sidebar, tombol, dsb.) — JANGAN hard-code
 * string permission secara langsung.
 *
 * Saat role baru ditambahkan di backend (config/permissions.php),
 * frontend otomatis beradaptasi karena ia hanya bergantung pada
 * array `permissions` yang dikembalikan oleh /auth/me.
 */

// ── General ────────────────────────────────────────────────────────────
export const VIEW_DASHBOARD       = 'view_dashboard';
export const MANAGE_OWN_ACCOUNT   = 'manage_own_account';

// ── Konten ──────────────────────────────────────────────────────────────
export const MANAGE_PROFILE       = 'manage_profile';
export const MANAGE_JUMBOTRON     = 'manage_jumbotron';
export const MANAGE_ORGANISASI    = 'manage_organisasi';
export const MANAGE_BERITA        = 'manage_berita';
export const MANAGE_LAYANAN       = 'manage_layanan';

// ── Kontak ──────────────────────────────────────────────────────────────
export const VIEW_KONTAK          = 'view_kontak';
export const MANAGE_KONTAK        = 'manage_kontak';

// ── Tamu Loby ────────────────────────────────────────────────────────────
export const VIEW_TAMU            = 'view_tamu';
export const MANAGE_TAMU          = 'manage_tamu';

// ── Surat Masuk ──────────────────────────────────────────────────────────
export const VIEW_SURAT_MASUK     = 'view_surat_masuk';
export const MANAGE_SURAT_MASUK   = 'manage_surat_masuk';

// ── Disposisi ────────────────────────────────────────────────────────────
export const VIEW_DISPOSISI       = 'view_disposisi';
export const MANAGE_DISPOSISI     = 'manage_disposisi';
export const REPLY_DISPOSISI      = 'reply_disposisi';

// ── Surat Keluar ─────────────────────────────────────────────────────────
export const VIEW_SURAT_KELUAR    = 'view_surat_keluar';
export const MANAGE_SURAT_KELUAR  = 'manage_surat_keluar';
export const APPROVE_SURAT_KELUAR = 'approve_surat_keluar';

// ── Admin Management ─────────────────────────────────────────────────────
export const MANAGE_ADMIN_USERS   = 'manage_admin_users';

/**
 * Semua permission dikelompokkan sebagai object untuk referensi mudah.
 * Berguna untuk autocomplete dan dokumentasi.
 */
export const Permissions = {
  VIEW_DASHBOARD,
  MANAGE_OWN_ACCOUNT,
  MANAGE_PROFILE,
  MANAGE_JUMBOTRON,
  MANAGE_ORGANISASI,
  MANAGE_BERITA,
  MANAGE_LAYANAN,
  VIEW_KONTAK,
  MANAGE_KONTAK,
  VIEW_TAMU,
  MANAGE_TAMU,
  VIEW_SURAT_MASUK,
  MANAGE_SURAT_MASUK,
  VIEW_DISPOSISI,
  MANAGE_DISPOSISI,
  REPLY_DISPOSISI,
  VIEW_SURAT_KELUAR,
  MANAGE_SURAT_KELUAR,
  APPROVE_SURAT_KELUAR,
  MANAGE_ADMIN_USERS,
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

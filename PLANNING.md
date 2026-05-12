# Implementation Plan — Fitur Baru Admin Dashboard BPKAD

Stack: **React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Zustand + TanStack Query + Axios**

Dokumen ini adalah panduan implementasi lengkap untuk menambahkan tiga fitur baru:
1. **RBAC** — Role-based access control (menu & route tersembunyi berdasarkan role)
2. **Manajemen Tamu Loby** — Registrasi, antrian, tracking kunjungan tamu
3. **Persuratan** — Surat masuk, surat keluar, disposisi (ala Srikandi)
4. **Admin Management** — Kelola akun admin dan role

---

## Catatan Penting: Backend Change

`/auth/login` dan `/auth/me` sekarang mengembalikan field `roles`:

```json
{
  "token": "...",
  "admin": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@bpkad-donggala.go.id",
    "roles": [
      { "id": 1, "name": "super_admin", "display_name": "Super Administrator" }
    ]
  }
}
```

---

## Daftar Role & Akses Menu

| Role | Menu yang Bisa Diakses |
|------|------------------------|
| `super_admin` | Semua menu + Admin Management |
| `admin` | Dashboard, Konten, Kontak, Akun |
| `resepsionis` | Dashboard, Tamu Loby, Kontak, Akun |
| `petugas_surat` | Dashboard, Surat Masuk, Surat Keluar, Disposisi, Akun |
| `pimpinan` | Dashboard, Surat Masuk (read), Surat Keluar (setujui), Disposisi, Akun |

---

## Checklist Implementasi

### Phase 1 — Type System (src/types/index.ts)

- [ ] Ubah `AuthUser.role: string` → `roles: Role[]`
- [ ] Tambah interface `Role` (dengan `admins_count?: number`)
- [ ] Tambah interface `RoleWithAdmins`
- [ ] Tambah interface `AdminUser` (untuk admin management)
- [ ] Tambah interface `Tamu`
- [ ] Tambah interface `SuratMasuk` + `SuratMasukPagination`
- [ ] Tambah interface `SuratKeluar` + `SuratKeluarPagination`
- [ ] Tambah interface `Disposisi`
- [ ] Tambah interface `TamuPagination`

### Phase 2 — Auth Store (src/stores/authStore.ts)

- [ ] Update `AuthUser` reference → gunakan tipe baru dengan `roles: Role[]`
- [ ] Tambah helper `hasRole(role: string): boolean`
- [ ] Tambah helper `hasAnyRole(roles: string[]): boolean`

### Phase 3 — API Layer (src/api/index.ts)

- [ ] Tambah `tamuApi` (register, getAll, getById, updateStatus, checkout, delete)
- [ ] Tambah `suratMasukApi` (getAll, create, getById, update, updateStatus, delete)
- [ ] Tambah `suratKeluarApi` (getAll, create, getById, update, ajukan, setujui, kirim, arsip, delete)
- [ ] Tambah `disposisiApi` (getAll, create, getById, updateStatus, balas, delete)
- [ ] Tambah `roleManagementApi` (getAll, create, getById, update, delete)
- [ ] Tambah `adminManagementApi` (getAll, create, getById, update, syncRoles, delete)

### Phase 4 — Role-Based Route Guard (src/components/layout/RoleProtectedRoute.tsx)

- [ ] Buat komponen `RoleProtectedRoute` yang menerima prop `roles: string[]`
- [ ] Redirect ke `/forbidden` (403) jika user tidak punya role yang diperlukan
- [ ] Buat halaman `src/pages/ForbiddenPage.tsx`

### Phase 5 — Sidebar Role-Aware (src/components/layout/Sidebar.tsx)

- [ ] Tambah properti `roles?: string[]` pada tiap nav item (opsional = semua role)
- [ ] Filter nav items berdasarkan `useAuthStore().user.roles`
- [ ] Tambah nav item baru:
  - **Loby Tamu** (resepsionis, admin, super_admin): `/tamu`
  - **Surat Masuk** (petugas_surat, pimpinan, admin, super_admin): `/surat-masuk`
  - **Surat Keluar** (petugas_surat, pimpinan, admin, super_admin): `/surat-keluar`
  - **Admin Management** (super_admin): `/admin-management`

### Phase 6 — Layout Updates (src/components/layout/Layout.tsx)

- [ ] Tambah `pageTitles` untuk semua path baru

### Phase 7 — Halaman Baru

#### 7a. Tamu Loby

- [x] `src/pages/tamu/TamuPage.tsx`
  - Tabel tamu dengan filter tanggal, status, search
  - Badge status berwarna (menunggu=yellow, diterima=green, ditolak=red, selesai=gray)
  - Tombol **Daftarkan Tamu** → buka `TamuFormDialog`
  - Tombol "Terima" / "Tolak" di baris tamu berstatus `menunggu`
  - Tombol "Checkout" di baris tamu berstatus `diterima`
  - Klik baris → buka `TamuDetailDialog`

- [x] `src/pages/tamu/TamuFormDialog.tsx` *(Dialog)*
  - Form pendaftaran tamu baru oleh resepsionis
  - Field wajib: **Nama**, **Keperluan**, **Nama yang Dituju**
  - Field opsional: Instansi Asal, No. Identitas (+ jenis: KTP/SIM/Paspor/Lainnya), Jabatan yang Dituju, Foto (upload gambar, maks 2 MB)
  - Submit → `tamuApi.register(FormData)` → panggil endpoint public `POST /tamu`
  - Setelah berhasil: tampilkan **nomor antrian** yang diterima dari response, tutup dialog, refresh tabel

- [x] `src/pages/tamu/TamuDetailDialog.tsx` *(Dialog atau Modal)*
  - Info lengkap tamu, foto (jika ada), nomor antrian
  - Tombol aksi: Terima / Tolak (jika menunggu), Checkout (jika diterima), Hapus

#### 7b. Surat Masuk

- [ ] `src/pages/surat-masuk/SuratMasukPage.tsx`
  - Tabel dengan filter status, tahun, search
  - Badge status (baru=blue, diproses=yellow, selesai=green, arsip=gray)
  - Tombol Tambah Surat Masuk

- [ ] `src/pages/surat-masuk/SuratMasukFormPage.tsx`
  - Form: pengirim, instansi_pengirim, perihal, tanggal_surat, tanggal_terima
  - Upload file surat (PDF/DOC/DOCX, maks 10MB)
  - Digunakan untuk tambah & edit

- [ ] `src/pages/surat-masuk/SuratMasukDetailPage.tsx`
  - Info surat masuk + badge status
  - Bagian disposisi:
    - List disposisi dengan status masing-masing
    - Tombol "Buat Disposisi" (form: pilih penerima admin, instruksi)
    - Penerima disposisi bisa balas (catatan_balasan)
    - Update status disposisi: belum_diproses → sedang_diproses → selesai

#### 7c. Surat Keluar

- [ ] `src/pages/surat-keluar/SuratKeluarPage.tsx`
  - Tabel dengan filter status, tahun, search
  - Badge status (draft=gray, menunggu_persetujuan=yellow, disetujui=blue, dikirim=green, arsip=gray)
  - Tombol Buat Surat Keluar

- [ ] `src/pages/surat-keluar/SuratKeluarFormPage.tsx`
  - Form: perihal, tujuan, instansi_tujuan, tanggal_surat (opsional)
  - Upload file surat
  - Hanya bisa edit surat berstatus `draft`

- [ ] `src/pages/surat-keluar/SuratKeluarDetailPage.tsx`
  - Info surat + badge status
  - Tombol aksi sesuai status & role:
    - `draft` + petugas_surat/admin: tombol **Ajukan ke Pimpinan**
    - `menunggu_persetujuan` + pimpinan/super_admin: tombol **Setujui** (form: nomor_surat, tanggal_surat)
    - `disetujui` + petugas_surat/admin: tombol **Tandai Terkirim**
    - tombol **Arsipkan** (setelah dikirim)

#### 7d. Admin Management

- [ ] `src/pages/admin-management/AdminManagementPage.tsx`
  - Tabel admin: nama, email, roles (badge per role)
  - Filter: search, role
  - Tombol Tambah Admin, Edit, Hapus
  - Tab kedua: **Kelola Role** (daftar role + admins_count, tombol Tambah Role, Edit, Hapus)

- [ ] `src/pages/admin-management/AdminFormPage.tsx` *(atau Dialog)*
  - Form: nama, email, password (opsional saat edit)
  - Multi-select roles (dari `roleManagementApi.getAll()`)
  - **⚠ Roles wajib dipilih minimal 1** — backend menolak request tanpa roles (422)
  - Digunakan untuk tambah & edit

- [ ] `src/pages/admin-management/RoleFormDialog.tsx` *(Dialog)*
  - Form tambah role baru: `name` (lowercase+underscore), `display_name`, `description`
  - Form edit role: hanya `display_name` dan `description` (field `name` di-disable/readonly)
  - Tombol hapus role hanya aktif jika `admins_count === 0`

### Phase 8 — App.tsx Routes

- [ ] Tambah semua route baru di dalam `<Route element={<Layout />}>`
- [ ] Bungkus route sensitif dalam `RoleProtectedRoute`:
  - `/tamu` → roles: `resepsionis, admin, super_admin`
  - `/surat-masuk`, `/surat-masuk/*` → roles: `petugas_surat, pimpinan, admin, super_admin`
  - `/surat-keluar`, `/surat-keluar/*` → roles: `petugas_surat, pimpinan, admin, super_admin`
  - `/admin-management`, `/admin-management/*` → roles: `super_admin`

---

## Detail Implementasi Per File

### `src/types/index.ts` — Perubahan

```ts
// Tambah / update:

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  admins_count?: number;   // tersedia di GET /admin/roles
}

export interface RoleWithAdmins extends Role {
  admins_count: number;
  admins: Pick<AdminUser, 'id' | 'name' | 'email'>[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: Role[];    // ← ganti dari role: string
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  created_at: string;
}

export interface Tamu {
  id: number;
  nama: string;
  instansi_asal?: string;
  no_identitas?: string;
  jenis_identitas?: 'ktp' | 'sim' | 'paspor' | 'lainnya';
  keperluan: string;
  nama_yang_dituju: string;
  jabatan_yang_dituju?: string;
  foto?: string;
  foto_url?: string;
  nomor_antrian: string;
  tanggal_kunjungan: string;
  waktu_masuk: string;
  waktu_keluar?: string;
  status: 'menunggu' | 'diterima' | 'ditolak' | 'selesai';
  catatan?: string;
}

export interface SuratMasuk {
  id: number;
  no_agenda: string;
  nomor_surat?: string;
  pengirim: string;
  instansi_pengirim: string;
  perihal: string;
  tanggal_surat: string;
  tanggal_terima: string;
  file_surat?: string;
  file_url?: string;
  status: 'baru' | 'diproses' | 'selesai' | 'arsip';
  catatan?: string;
  diterima_oleh?: number;
  diterimaOleh?: { id: number; name: string };
  disposisis?: Disposisi[];
}

export interface SuratKeluar {
  id: number;
  no_agenda: string;
  nomor_surat?: string;
  perihal: string;
  tujuan: string;
  instansi_tujuan: string;
  tanggal_surat?: string;
  tanggal_kirim?: string;
  file_surat?: string;
  file_url?: string;
  status: 'draft' | 'menunggu_persetujuan' | 'disetujui' | 'dikirim' | 'arsip';
  catatan?: string;
  dibuat_oleh: number;
  dibuatOleh?: { id: number; name: string };
  disetujui_oleh?: number;
  disetujuiOleh?: { id: number; name: string };
}

export interface Disposisi {
  id: number;
  surat_masuk_id: number;
  dari_admin_id: number;
  kepada_admin_id: number;
  instruksi: string;
  catatan_balasan?: string;
  status: 'belum_diproses' | 'sedang_diproses' | 'selesai';
  tanggal_disposisi: string;
  tanggal_selesai?: string;
  dariAdmin?: { id: number; name: string };
  kepadaAdmin?: { id: number; name: string };
}

// Tambah pagination generics:
export interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
```

---

### `src/stores/authStore.ts` — Perubahan

```ts
// Tambah helper ke state & actions:

hasRole: (role: string) => boolean;
hasAnyRole: (roles: string[]) => boolean;

// Implementasi:
hasRole: (role) => get().user?.roles?.some(r => r.name === role) ?? false,
hasAnyRole: (roles) => get().user?.roles?.some(r => roles.includes(r.name)) ?? false,
```

---

### `src/api/index.ts` — Tambahan

```ts
export const tamuApi = {
  // POST /tamu — endpoint PUBLIC, tidak butuh Bearer token
  // Dipanggil oleh resepsionis dari dashboard untuk mendaftarkan tamu
  register: (data: FormData) =>
    api.post('/tamu', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getAll: (params?: { tanggal?: string; status?: string; search?: string; per_page?: number; page?: number }) =>
    api.get('/admin/tamu', { params }),
  getById: (id: number) => api.get(`/admin/tamu/${id}`),
  updateStatus: (id: number, data: { status: string; catatan?: string }) =>
    api.patch(`/admin/tamu/${id}/status`, data),
  checkout: (id: number) => api.patch(`/admin/tamu/${id}/checkout`),
  delete: (id: number) => api.delete(`/admin/tamu/${id}`),
};

export const suratMasukApi = {
  getAll: (params?: { status?: string; tahun?: number; search?: string; per_page?: number; page?: number }) =>
    api.get('/admin/surat-masuk', { params }),
  create: (data: FormData) =>
    api.post('/admin/surat-masuk', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id: number) => api.get(`/admin/surat-masuk/${id}`),
  update: (id: number, data: FormData) =>
    api.post(`/admin/surat-masuk/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id: number, data: { status: string; catatan?: string }) =>
    api.patch(`/admin/surat-masuk/${id}/status`, data),
  delete: (id: number) => api.delete(`/admin/surat-masuk/${id}`),
};

export const disposisiApi = {
  getAll: (suratMasukId: number) =>
    api.get(`/admin/surat-masuk/${suratMasukId}/disposisi`),
  create: (suratMasukId: number, data: { kepada_admin_id: number; instruksi: string; tanggal_disposisi?: string }) =>
    api.post(`/admin/surat-masuk/${suratMasukId}/disposisi`, data),
  getById: (suratMasukId: number, id: number) =>
    api.get(`/admin/surat-masuk/${suratMasukId}/disposisi/${id}`),
  updateStatus: (suratMasukId: number, id: number, data: { status: string }) =>
    api.patch(`/admin/surat-masuk/${suratMasukId}/disposisi/${id}/status`, data),
  balas: (suratMasukId: number, id: number, data: { catatan_balasan: string }) =>
    api.patch(`/admin/surat-masuk/${suratMasukId}/disposisi/${id}/balas`, data),
  delete: (suratMasukId: number, id: number) =>
    api.delete(`/admin/surat-masuk/${suratMasukId}/disposisi/${id}`),
};

export const suratKeluarApi = {
  getAll: (params?: { status?: string; tahun?: number; search?: string; per_page?: number; page?: number }) =>
    api.get('/admin/surat-keluar', { params }),
  create: (data: FormData) =>
    api.post('/admin/surat-keluar', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id: number) => api.get(`/admin/surat-keluar/${id}`),
  update: (id: number, data: FormData) =>
    api.post(`/admin/surat-keluar/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  ajukan: (id: number) => api.patch(`/admin/surat-keluar/${id}/ajukan`),
  setujui: (id: number, data: { nomor_surat: string; tanggal_surat: string; catatan?: string }) =>
    api.patch(`/admin/surat-keluar/${id}/setujui`, data),
  kirim: (id: number) => api.patch(`/admin/surat-keluar/${id}/kirim`),
  arsip: (id: number) => api.patch(`/admin/surat-keluar/${id}/arsip`),
  delete: (id: number) => api.delete(`/admin/surat-keluar/${id}`),
};

// ── Role Management (GET /admin/roles sudah ada, tambah CRUD lengkap) ──
export const roleManagementApi = {
  // GET /admin/roles — daftar semua role + admins_count
  getAll: () => api.get<{ data: Role[] }>('/admin/roles'),

  // POST /admin/roles — buat role baru
  // name: lowercase + underscore saja, contoh: "kepala_bidang"
  create: (data: { name: string; display_name: string; description?: string }) =>
    api.post('/admin/roles', data),

  // GET /admin/roles/{id} — detail role + daftar admin yang memakainya
  getById: (id: number) => api.get<{ data: RoleWithAdmins }>(`/admin/roles/${id}`),

  // PUT /admin/roles/{id} — update display_name / description saja
  // ⚠ name (slug) tidak bisa diubah
  update: (id: number, data: { display_name: string; description?: string }) =>
    api.put(`/admin/roles/${id}`, data),

  // DELETE /admin/roles/{id} — gagal (422) jika masih ada admin yang memakai role ini
  delete: (id: number) => api.delete(`/admin/roles/${id}`),
};

export const adminManagementApi = {
  /** @deprecated gunakan roleManagementApi.getAll() */
  getRoles: () => api.get('/admin/roles'),
  getAll: (params?: { search?: string; role?: string; per_page?: number; page?: number }) =>
    api.get('/admin/admins', { params }),
  // ⚠ roles wajib diisi minimal 1 id, jika tidak server menolak (422)
  create: (data: { name: string; email: string; password: string; roles: number[] }) =>
    api.post('/admin/admins', data),
  getById: (id: number) => api.get(`/admin/admins/${id}`),
  update: (id: number, data: { name?: string; email?: string; password?: string }) =>
    api.post(`/admin/admins/${id}`, data),
  syncRoles: (id: number, data: { roles: number[] }) =>
    api.put(`/admin/admins/${id}/roles`, data),
  delete: (id: number) => api.delete(`/admin/admins/${id}`),
};
```

---

### `src/components/layout/RoleProtectedRoute.tsx` — File Baru

```tsx
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
```

---

### `src/components/layout/Sidebar.tsx` — Perubahan

Tambah `roles?: string[]` ke tiap nav item, dan filter berdasarkan `user.roles`.

```tsx
// Nav items baru yang perlu ditambahkan di Sidebar:

// Group "Loby" — untuk resepsionis, admin, super_admin:
{ to: '/tamu', label: 'Tamu Loby', icon: UserCheck, roles: ['resepsionis', 'admin', 'super_admin'] },

// Group "Persuratan" — untuk petugas_surat, pimpinan, admin, super_admin:
{ to: '/surat-masuk', label: 'Surat Masuk', icon: MailOpen, roles: ['petugas_surat', 'pimpinan', 'admin', 'super_admin'] },
{ to: '/surat-keluar', label: 'Surat Keluar', icon: Send, roles: ['petugas_surat', 'pimpinan', 'admin', 'super_admin'] },

// Group "Sistem" — hanya super_admin:
{ to: '/admin-management', label: 'Kelola Admin', icon: UserCog, roles: ['super_admin'] },
```

---

### `src/App.tsx` — Perubahan Routes

```tsx
// Import halaman baru:
import TamuPage from './pages/tamu/TamuPage';
import SuratMasukPage from './pages/surat-masuk/SuratMasukPage';
import SuratMasukFormPage from './pages/surat-masuk/SuratMasukFormPage';
import SuratMasukDetailPage from './pages/surat-masuk/SuratMasukDetailPage';
import SuratKeluarPage from './pages/surat-keluar/SuratKeluarPage';
import SuratKeluarFormPage from './pages/surat-keluar/SuratKeluarFormPage';
import SuratKeluarDetailPage from './pages/surat-keluar/SuratKeluarDetailPage';
import AdminManagementPage from './pages/admin-management/AdminManagementPage';
import ForbiddenPage from './pages/ForbiddenPage';

// Tambah di dalam <Route element={<Layout />}>:
<Route element={<RoleProtectedRoute roles={['resepsionis', 'admin', 'super_admin']} />}>
  <Route path="/tamu" element={<TamuPage />} />
</Route>

<Route element={<RoleProtectedRoute roles={['petugas_surat', 'pimpinan', 'admin', 'super_admin']} />}>
  <Route path="/surat-masuk" element={<SuratMasukPage />} />
  <Route path="/surat-masuk/tambah" element={<SuratMasukFormPage />} />
  <Route path="/surat-masuk/:id" element={<SuratMasukDetailPage />} />
  <Route path="/surat-masuk/:id/edit" element={<SuratMasukFormPage />} />
  <Route path="/surat-keluar" element={<SuratKeluarPage />} />
  <Route path="/surat-keluar/tambah" element={<SuratKeluarFormPage />} />
  <Route path="/surat-keluar/:id" element={<SuratKeluarDetailPage />} />
  <Route path="/surat-keluar/:id/edit" element={<SuratKeluarFormPage />} />
</Route>

<Route element={<RoleProtectedRoute roles={['super_admin']} />}>
  <Route path="/admin-management" element={<AdminManagementPage />} />
</Route>

// Di luar Layout:
<Route path="/forbidden" element={<ForbiddenPage />} />
```

---

## Urutan Pengerjaan yang Disarankan

```
1. types/index.ts          ← Update types dulu, TS error akan guide implementasi
2. stores/authStore.ts     ← Tambah hasRole/hasAnyRole
3. api/index.ts            ← Tambah semua api functions (roleManagementApi + adminManagementApi)
4. RoleProtectedRoute.tsx  ← Guard route
5. ForbiddenPage.tsx       ← Halaman 403
6. Sidebar.tsx             ← Update navigasi role-aware
7. App.tsx                 ← Daftarkan semua route baru
8. Halaman Tamu            ← TamuPage (paling sederhana, mulai dari sini)
9. Halaman Surat Masuk     ← SuratMasukPage → Form → Detail+Disposisi
10. Halaman Surat Keluar   ← SuratKeluarPage → Form → Detail+Aksi
11. Admin Management       ← AdminManagementPage + AdminFormPage
12. Role Management        ← Tab di AdminManagementPage + RoleFormDialog
```

---

## Komponen UI yang Akan Dibutuhkan (shadcn/ui)

Pastikan sudah di-install via `npx shadcn@latest add <component>`:

```bash
npx shadcn@latest add dialog        # Modal form tambah/edit
npx shadcn@latest add select        # Dropdown filter status, tipe, dll
npx shadcn@latest add badge         # Badge status
npx shadcn@latest add tabs          # Di halaman detail surat masuk (info | disposisi)
npx shadcn@latest add textarea      # Form instruksi, catatan
npx shadcn@latest add date-picker   # Filter tanggal, input tanggal surat
npx shadcn@latest add alert-dialog  # Konfirmasi hapus
```

---

## Status Badge Reference

```tsx
// Tamu
const tamuStatusConfig = {
  menunggu:  { label: 'Menunggu',  variant: 'yellow' },
  diterima:  { label: 'Diterima',  variant: 'green' },
  ditolak:   { label: 'Ditolak',   variant: 'red' },
  selesai:   { label: 'Selesai',   variant: 'gray' },
};

// Surat Masuk
const suratMasukStatusConfig = {
  baru:      { label: 'Baru',      variant: 'blue' },
  diproses:  { label: 'Diproses',  variant: 'yellow' },
  selesai:   { label: 'Selesai',   variant: 'green' },
  arsip:     { label: 'Arsip',     variant: 'gray' },
};

// Surat Keluar
const suratKeluarStatusConfig = {
  draft:                  { label: 'Draft',               variant: 'gray' },
  menunggu_persetujuan:   { label: 'Menunggu Persetujuan', variant: 'yellow' },
  disetujui:              { label: 'Disetujui',           variant: 'blue' },
  dikirim:                { label: 'Dikirim',             variant: 'green' },
  arsip:                  { label: 'Arsip',               variant: 'gray' },
};

// Disposisi
const disposisiStatusConfig = {
  belum_diproses:  { label: 'Belum Diproses', variant: 'yellow' },
  sedang_diproses: { label: 'Sedang Diproses', variant: 'blue' },
  selesai:         { label: 'Selesai',         variant: 'green' },
};
```


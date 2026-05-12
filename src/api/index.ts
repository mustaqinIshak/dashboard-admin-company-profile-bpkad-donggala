import api from '../lib/axios';
import type {
  AuthResponse,
  LoginCredentials,
  AuthUser,
  ChangePasswordData,
} from '../types';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<AuthUser>('/auth/me'),

  changePassword: (data: ChangePasswordData) =>
    api.post('/auth/change-password', data),
};

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: FormData) =>
    api.post('/admin/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const jumbotronApi = {
  getAll: () => api.get('/jumbotron'),
  create: (data: FormData) =>
    api.post('/admin/jumbotron', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post(`/admin/jumbotron/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/admin/jumbotron/${id}`),
  toggle: (id: number) => api.patch(`/admin/jumbotron/${id}/toggle`),
};

export const organisasiApi = {
  getAll: () => api.get('/organisasi'),
  getByBidang: (bidang: string) => api.get(`/organisasi/bidang/${bidang}`),
  getJabatan: (id: number) => api.get(`/organisasi/${id}/jabatan`),
  updateBidang: (bidang: string, data: { deskripsi?: string }) =>
    api.put(`/admin/organisasi/bidang/${bidang}`, data),
  addJabatan: (bidangId: number, data: FormData) =>
    api.post(`/admin/organisasi/${bidangId}/jabatan`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateJabatan: (bidangId: number, jabId: number, data: FormData) =>
    api.post(`/admin/organisasi/${bidangId}/jabatan/${jabId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteJabatan: (bidangId: number, jabId: number) =>
    api.delete(`/admin/organisasi/${bidangId}/jabatan/${jabId}`),
};

export const beritaApi = {
  getAll: (page = 1) => api.get(`/berita?page=${page}`),
  getById: (id: number) => api.get(`/berita/${id}`),
  create: (data: FormData) =>
    api.post('/admin/berita', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post(`/admin/berita/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/admin/berita/${id}`),
};

export const layananApi = {
  getAll: () => api.get('/layanan'),
  getById: (id: number) => api.get(`/layanan/${id}`),
  create: (data: FormData) =>
    api.post('/admin/layanan', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post(`/admin/layanan/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/admin/layanan/${id}`),
};

export const kontakApi = {
  getAll: () => api.get('/admin/kontak'),
  getById: (id: number) => api.get(`/admin/kontak/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/admin/kontak/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/admin/kontak/${id}`),
};

export const tamuApi = {
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
  updateStatus: (id: number, data: { status: string; catatan?: string; alasan_penolakan?: string }) =>
    api.patch(`/admin/surat-keluar/${id}/status`, data),
  delete: (id: number) => api.delete(`/admin/surat-keluar/${id}`),
};

export const roleManagementApi = {
  getAll: () => api.get('/admin/roles'),
  create: (data: { name: string; display_name: string; description?: string }) =>
    api.post('/admin/roles', data),
  getById: (id: number) => api.get(`/admin/roles/${id}`),
  update: (id: number, data: { display_name: string; description?: string }) =>
    api.put(`/admin/roles/${id}`, data),
  delete: (id: number) => api.delete(`/admin/roles/${id}`),
};

export const adminManagementApi = {
  getAll: (params?: { search?: string; role?: string; per_page?: number; page?: number }) =>
    api.get('/admin/admins', { params }),
  create: (data: { name: string; email: string; password: string; roles: number[] }) =>
    api.post('/admin/admins', data),
  getById: (id: number) => api.get(`/admin/admins/${id}`),
  update: (id: number, data: { name?: string; email?: string; password?: string }) =>
    api.post(`/admin/admins/${id}`, data),
  syncRoles: (id: number, data: { roles: number[] }) =>
    api.put(`/admin/admins/${id}/roles`, data),
  delete: (id: number) => api.delete(`/admin/admins/${id}`),
};

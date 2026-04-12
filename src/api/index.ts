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
  updateBidang: (bidang: string, data: FormData) =>
    api.put(`/admin/organisasi/bidang/${bidang}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
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

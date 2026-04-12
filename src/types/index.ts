// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Profile Types
export interface Profile {
  id: number;
  nama: string;
  singkatan?: string;
  visi?: string;
  misi?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo?: string;
  deskripsi?: string;
}

// Jumbotron Types
export interface Jumbotron {
  id: number;
  judul: string;
  subjudul?: string;
  gambar?: string;
  urutan: number;
  aktif: boolean;
}

// Organisasi Types
export interface Bidang {
  id: number;
  nama: string;
  kode: string;
  deskripsi?: string;
  foto?: string;
}

export interface Jabatan {
  id: number;
  nama: string;
  nama_pejabat?: string;
  foto?: string;
  urutan: number;
  bidang_id: number;
}

// Berita Types
export interface Berita {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  ringkasan?: string;
  gambar?: string;
  kategori?: string;
  diterbitkan: boolean;
  created_at: string;
  updated_at: string;
  penulis?: string;
}

export interface BeritaPagination {
  data: Berita[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Layanan Types
export interface Layanan {
  id: number;
  nama: string;
  deskripsi?: string;
  ikon?: string;
  gambar?: string;
  urutan: number;
  aktif: boolean;
}

// Kontak Types
export interface Kontak {
  id: number;
  nama: string;
  email: string;
  telepon?: string;
  subjek?: string;
  pesan: string;
  status: 'belum_dibaca' | 'sudah_dibaca' | 'diproses';
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Change Password
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

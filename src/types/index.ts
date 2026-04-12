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
  nama_instansi: string;
  visi?: string;
  misi?: string;
  sejarah?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo?: string;
  struktur_organisasi?: string;
}

// Jumbotron Types
export interface Jumbotron {
  id: number;
  judul?: string;
  deskripsi?: string;
  gambar?: string;
  urutan: number;
  is_active: boolean;
}

// Organisasi Types
export interface Organisasi {
  id: number;
  bidang: string;
  deskripsi?: string;
  jabatans: Jabatan[];
}

export interface Jabatan {
  id: number;
  organisasi_id: number;
  nama_jabatan: string;
  nama_pejabat: string;
  nip?: string;
  foto?: string;
  tugas_fungsi?: string[];
}

// Berita Types
export interface Berita {
  id: number;
  judul: string;
  slug: string;
  isi: string;
  gambar?: string;
  kategori?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
  tipe: string;
  judul: string;
  deskripsi?: string;
  tahun_apbd: number;
  file_dokumen?: string;
}

// Kontak Types
export interface Kontak {
  id: number;
  nama: string;
  email: string;
  no_telepon?: string;
  subjek: string;
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

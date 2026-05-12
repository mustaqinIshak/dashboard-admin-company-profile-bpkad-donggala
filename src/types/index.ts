// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  admins_count?: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Pagination Types
export interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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

// Tamu Types
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

// Surat Masuk Types
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

// Surat Keluar Types
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
  status: 'draft' | 'menunggu_persetujuan' | 'disetujui' | 'ditolak' | 'dikirim' | 'terkirim' | 'arsip';
  catatan?: string;
  dibuat_oleh: number;
  dibuatOleh?: { id: number; name: string };
  disetujui_oleh?: number;
  disetujuiOleh?: { id: number; name: string };
    alasan_penolakan?: string;
    tanggal_surat_keluar?: string;
    keterangan?: string;
    created_at?: string;
}

// Change Password
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

# Admin Dashboard - BPKAD Donggala

Dashboard admin untuk mengelola company profile **Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD) Kabupaten Donggala**.

## Screenshot

### Halaman Login
![Login](https://github.com/user-attachments/assets/b4f7c2a5-54bc-4fbb-9b85-ea659692f825)

### Dashboard Utama
![Dashboard](https://github.com/user-attachments/assets/d31995c7-d5c4-4385-8c60-68b0fe703b2d)

### Manajemen Jumbotron
![Jumbotron](https://github.com/user-attachments/assets/127d07e3-2e80-4d80-ae41-3d1c1f7bccb2)

## Fitur

- 🔐 **Autentikasi** - Login, logout, ubah password
- 📊 **Dashboard** - Overview statistik konten
- 🏢 **Profil Instansi** - Edit informasi dan logo BPKAD
- 🖼️ **Jumbotron** - Kelola slide banner (tambah, edit, hapus, aktif/nonaktif)
- 👥 **Organisasi** - Kelola data bidang dan jabatan pejabat
- 📰 **Berita** - Manajemen berita dengan paginasi
- 🛎️ **Layanan** - Kelola daftar layanan instansi
- 📬 **Pesan Masuk** - Lihat dan kelola pesan kontak dari masyarakat
- ⚙️ **Akun Saya** - Kelola profil dan password admin

## Teknologi

| Package | Kegunaan |
|---------|----------|
| [React 19](https://react.dev/) + [Vite](https://vite.dev/) | Framework utama |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| [React Router v7](https://reactrouter.com/) | Routing |
| [TanStack Query v5](https://tanstack.com/query) | Data fetching & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form validation |
| [Axios](https://axios-http.com/) | HTTP client |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

## Cara Memulai

### Prasyarat

- Node.js >= 18
- npm >= 9
- Backend API berjalan (lihat daftar endpoint di bawah)

### Instalasi

```bash
# Clone repository
git clone <url-repo>
cd dashboard-admin-company-profile-bpkad-donggala

# Install dependencies
npm install

# Salin file environment
cp .env.example .env

# Edit .env sesuai URL backend API Anda
# VITE_API_URL=http://localhost:8000/api

# Jalankan development server
npm run dev
```

### Build untuk Production

```bash
npm run build
```

## Konfigurasi Environment

```env
VITE_API_URL=http://localhost:8000/api
```

## REST API Endpoints

| Method | URL | Deskripsi |
|--------|-----|-----------|
| `POST` | `/auth/login` | Login admin |
| `GET` | `/auth/me` | Info admin login |
| `POST` | `/auth/change-password` | Ubah password |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/profile` | Profil instansi |
| `POST` | `/admin/profile` | Update profil instansi |
| `GET` | `/jumbotron` | Daftar slide jumbotron |
| `POST` | `/admin/jumbotron` | Tambah slide |
| `POST` | `/admin/jumbotron/{id}` | Update slide |
| `DELETE` | `/admin/jumbotron/{id}` | Hapus slide |
| `PATCH` | `/admin/jumbotron/{id}/toggle` | Toggle aktif/nonaktif |
| `GET` | `/organisasi` | Daftar semua bidang organisasi |
| `GET` | `/organisasi/bidang/{bidang}` | Bidang tertentu |
| `GET` | `/organisasi/{id}/jabatan` | Jabatan dalam suatu bidang |
| `PUT` | `/admin/organisasi/bidang/{bidang}` | Simpan data bidang |
| `POST` | `/admin/organisasi/{id}/jabatan` | Tambah jabatan |
| `POST` | `/admin/organisasi/{id}/jabatan/{jabId}` | Update jabatan |
| `DELETE` | `/admin/organisasi/{id}/jabatan/{jabId}` | Hapus jabatan |
| `GET` | `/berita` | Daftar berita (paginasi) |
| `GET` | `/berita/{id}` | Detail berita |
| `POST` | `/admin/berita` | Tambah berita |
| `POST` | `/admin/berita/{id}` | Update berita |
| `DELETE` | `/admin/berita/{id}` | Hapus berita |
| `GET` | `/layanan` | Daftar layanan |
| `GET` | `/layanan/{id}` | Detail layanan |
| `POST` | `/admin/layanan` | Tambah layanan |
| `POST` | `/admin/layanan/{id}` | Update layanan |
| `DELETE` | `/admin/layanan/{id}` | Hapus layanan |
| `GET` | `/admin/kontak` | Daftar pesan masuk |
| `GET` | `/admin/kontak/{id}` | Detail pesan |
| `PATCH` | `/admin/kontak/{id}/status` | Update status pesan |
| `DELETE` | `/admin/kontak/{id}` | Hapus pesan |

## Struktur Project

```
src/
├── api/          # API service functions
├── components/
│   ├── layout/   # Layout, Sidebar, Navbar, ProtectedRoute
│   └── ui/       # Reusable UI components
├── lib/          # Axios instance
├── pages/        # Page components
│   ├── auth/     # Login page
│   ├── dashboard/ # Dashboard
│   ├── profile/  # Profil instansi
│   ├── jumbotron/ # Jumbotron management
│   ├── organisasi/ # Organisasi management
│   ├── berita/   # Berita management
│   ├── layanan/  # Layanan management
│   ├── kontak/   # Pesan masuk
│   └── akun/     # Akun & ubah password
├── stores/       # Zustand stores
├── types/        # TypeScript types
└── utils/        # Utility functions
```

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PermissionProtectedRoute from './components/layout/PermissionProtectedRoute';
import ForbiddenPage from './pages/ForbiddenPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import JumbotronPage from './pages/jumbotron/JumbotronPage';
import OrganisasiPage from './pages/organisasi/OrganisasiPage';
import BeritaPage from './pages/berita/BeritaPage';
import LayananPage from './pages/layanan/LayananPage';
import KontakPage from './pages/kontak/KontakPage';
import AkunPage from './pages/akun/AkunPage';

// Halaman Baru
import TamuPage from './pages/tamu/TamuPage';
import SuratMasukPage from './pages/surat-masuk/SuratMasukPage';
import SuratMasukFormPage from './pages/surat-masuk/SuratMasukFormPage';
import SuratMasukDetailPage from './pages/surat-masuk/SuratMasukDetailPage';
import SuratKeluarPage from './pages/surat-keluar/SuratKeluarPage';
import SuratKeluarFormPage from './pages/surat-keluar/SuratKeluarFormPage';
import SuratKeluarDetailPage from './pages/surat-keluar/SuratKeluarDetailPage';
import AdminManagementPage from './pages/admin-management/AdminManagementPage';

// Permission constants
import {
  MANAGE_PROFILE,
  MANAGE_JUMBOTRON,
  MANAGE_ORGANISASI,
  MANAGE_BERITA,
  MANAGE_LAYANAN,
  VIEW_KONTAK,
  VIEW_TAMU,
  VIEW_SURAT_MASUK,
  VIEW_SURAT_KELUAR,
  MANAGE_ADMIN_USERS,
} from './lib/permissions';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/akun" element={<AkunPage />} />

              {/* ── Konten (permission-based) ─────────────────────────── */}
              <Route element={<PermissionProtectedRoute permission={MANAGE_PROFILE} />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route element={<PermissionProtectedRoute permission={MANAGE_JUMBOTRON} />}>
                <Route path="/jumbotron" element={<JumbotronPage />} />
              </Route>
              <Route element={<PermissionProtectedRoute permission={MANAGE_ORGANISASI} />}>
                <Route path="/organisasi" element={<OrganisasiPage />} />
              </Route>
              <Route element={<PermissionProtectedRoute permission={MANAGE_BERITA} />}>
                <Route path="/berita" element={<BeritaPage />} />
              </Route>
              <Route element={<PermissionProtectedRoute permission={MANAGE_LAYANAN} />}>
                <Route path="/layanan" element={<LayananPage />} />
              </Route>

              {/* ── Kontak ───────────────────────────────────────────── */}
              <Route element={<PermissionProtectedRoute permission={VIEW_KONTAK} />}>
                <Route path="/kontak" element={<KontakPage />} />
              </Route>

              {/* ── Tamu Loby ─────────────────────────────────────────── */}
              <Route element={<PermissionProtectedRoute permission={VIEW_TAMU} />}>
                <Route path="/tamu" element={<TamuPage />} />
              </Route>

              {/* ── Persuratan ────────────────────────────────────────── */}
              <Route element={<PermissionProtectedRoute permission={VIEW_SURAT_MASUK} />}>
                <Route path="/surat-masuk" element={<SuratMasukPage />} />
                <Route path="/surat-masuk/tambah" element={<SuratMasukFormPage />} />
                <Route path="/surat-masuk/:id" element={<SuratMasukDetailPage />} />
                <Route path="/surat-masuk/:id/edit" element={<SuratMasukFormPage />} />
              </Route>
              <Route element={<PermissionProtectedRoute permission={VIEW_SURAT_KELUAR} />}>
                <Route path="/surat-keluar" element={<SuratKeluarPage />} />
                <Route path="/surat-keluar/tambah" element={<SuratKeluarFormPage />} />
                <Route path="/surat-keluar/:id" element={<SuratKeluarDetailPage />} />
                <Route path="/surat-keluar/:id/edit" element={<SuratKeluarFormPage />} />
              </Route>

              {/* ── Admin Management ──────────────────────────────────── */}
              <Route element={<PermissionProtectedRoute permission={MANAGE_ADMIN_USERS} />}>
                <Route path="/admin-management" element={<AdminManagementPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleProtectedRoute from './components/layout/RoleProtectedRoute';
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
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/jumbotron" element={<JumbotronPage />} />
              <Route path="/organisasi" element={<OrganisasiPage />} />
              <Route path="/berita" element={<BeritaPage />} />
              <Route path="/layanan" element={<LayananPage />} />
              <Route path="/kontak" element={<KontakPage />} />
              <Route path="/akun" element={<AkunPage />} />

              {/* Role Protected Routes */}
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

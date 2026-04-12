import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import JumbotronPage from './pages/jumbotron/JumbotronPage';
import OrganisasiPage from './pages/organisasi/OrganisasiPage';
import BeritaPage from './pages/berita/BeritaPage';
import LayananPage from './pages/layanan/LayananPage';
import KontakPage from './pages/kontak/KontakPage';
import AkunPage from './pages/akun/AkunPage';

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
            </Route>
          </Route>
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

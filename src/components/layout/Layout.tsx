import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/profile': 'Profil Instansi',
  '/jumbotron': 'Jumbotron',
  '/organisasi': 'Manajemen Organisasi',
  '/berita': 'Manajemen Berita',
  '/layanan': 'Manajemen Layanan',
  '/kontak': 'Pesan Masuk',
  '/akun': 'Akun Saya',
};

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

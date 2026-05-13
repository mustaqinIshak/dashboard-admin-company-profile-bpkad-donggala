import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Image,
  Users,
  Newspaper,
  Briefcase,
  MessageSquare,
  Settings,
  X,
  UserCheck,
  MailOpen,
  Send,
  UserCog,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePermission } from '../../hooks/usePermission';
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
} from '../../lib/permissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Setiap nav item dapat memiliki:
 *  - `permissions`: tampilkan jika user punya SALAH SATU dari permission ini (OR)
 *  - Tanpa `permissions`: selalu tampil (misal Dashboard, Akun Saya)
 *
 * Menambahkan menu baru cukup tambahkan entri di sini dengan permission
 * yang sesuai — tidak perlu mengubah kode lain.
 */
const navItems = [
  {
    group: 'Utama',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Konten',
    items: [
      { to: '/profile',    label: 'Profil Instansi', icon: Building2, permissions: [MANAGE_PROFILE] },
      { to: '/jumbotron',  label: 'Jumbotron',       icon: Image,     permissions: [MANAGE_JUMBOTRON] },
      { to: '/organisasi', label: 'Organisasi',       icon: Users,     permissions: [MANAGE_ORGANISASI] },
      { to: '/berita',     label: 'Berita',           icon: Newspaper, permissions: [MANAGE_BERITA] },
      { to: '/layanan',    label: 'Layanan',          icon: Briefcase, permissions: [MANAGE_LAYANAN] },
    ],
  },
  {
    group: 'Loby',
    items: [
      { to: '/tamu', label: 'Tamu Loby', icon: UserCheck, permissions: [VIEW_TAMU] },
    ],
  },
  {
    group: 'Persuratan',
    items: [
      { to: '/surat-masuk',  label: 'Surat Masuk',  icon: MailOpen, permissions: [VIEW_SURAT_MASUK] },
      { to: '/surat-keluar', label: 'Surat Keluar', icon: Send,     permissions: [VIEW_SURAT_KELUAR] },
    ],
  },
  {
    group: 'Sistem',
    items: [
      { to: '/admin-management', label: 'Kelola Admin', icon: UserCog, permissions: [MANAGE_ADMIN_USERS] },
    ],
  },
  {
    group: 'Manajemen',
    items: [
      { to: '/kontak',  label: 'Pesan Masuk', icon: MessageSquare, permissions: [VIEW_KONTAK] },
      { to: '/akun',    label: 'Akun Saya',   icon: Settings },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { canAny } = usePermission();
  
  // Filter nav groups dan items berdasarkan permissions (PBAC)
  const filteredNavItems = navItems.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !item.permissions || canAny(item.permissions)
    ),
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white z-40 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-blue-700">
          <div>
            <h1 className="font-bold text-lg leading-tight">BPKAD</h1>
            <p className="text-blue-300 text-xs">Donggala Admin</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-blue-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredNavItems.map((group) => (
            <div key={group.group}>
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
                {group.group}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'text-blue-200 hover:bg-white/10 hover:text-white'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-700">
          <p className="text-xs text-blue-400 text-center">
            © 2024 BPKAD Donggala
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

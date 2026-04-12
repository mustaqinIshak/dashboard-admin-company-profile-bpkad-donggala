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
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      { to: '/profile', label: 'Profil Instansi', icon: Building2 },
      { to: '/jumbotron', label: 'Jumbotron', icon: Image },
      { to: '/organisasi', label: 'Organisasi', icon: Users },
      { to: '/berita', label: 'Berita', icon: Newspaper },
      { to: '/layanan', label: 'Layanan', icon: Briefcase },
    ],
  },
  {
    group: 'Manajemen',
    items: [
      { to: '/kontak', label: 'Pesan Masuk', icon: MessageSquare },
      { to: '/akun', label: 'Akun Saya', icon: Settings },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
          {navItems.map((group) => (
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

import { Menu, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api';

interface NavbarProps {
  onMenuClick: () => void;
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, title }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate('/login');
      toast.success('Berhasil logout');
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-500">
            Badan Pengelolaan Keuangan dan Aset Daerah
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import { useQuery } from '@tanstack/react-query';
import {
  Newspaper,
  Briefcase,
  MessageSquare,
  Image,
  Users,
  TrendingUp,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { beritaApi, kontakApi, jumbotronApi, layananApi } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDateTime } from '../../utils';

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  link: string;
}> = ({ label, value, icon, color, link }) => (
  <Link to={link}>
    <div className={`card hover:shadow-md transition-shadow group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 group-hover:gap-2 transition-all">
        <span>Lihat detail</span>
        <ArrowRight className="h-3 w-3" />
      </div>
    </div>
  </Link>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const { data: beritaData, isLoading: beritaLoading } = useQuery({
    queryKey: ['berita'],
    queryFn: () => beritaApi.getAll(1),
  });

  const { data: kontakData, isLoading: kontakLoading } = useQuery({
    queryKey: ['kontak'],
    queryFn: () => kontakApi.getAll(),
  });

  const { data: jumbotronData, isLoading: jumbotronLoading } = useQuery({
    queryKey: ['jumbotron'],
    queryFn: () => jumbotronApi.getAll(),
  });

  const { data: layananData, isLoading: layananLoading } = useQuery({
    queryKey: ['layanan'],
    queryFn: () => layananApi.getAll(),
  });

  const isLoading =
    beritaLoading || kontakLoading || jumbotronLoading || layananLoading;

  const berita = beritaData?.data?.data || beritaData?.data || [];
  const kontak = kontakData?.data?.data || kontakData?.data || [];
  const jumbotron = jumbotronData?.data?.data || jumbotronData?.data || [];
  const layanan = layananData?.data?.data || layananData?.data || [];

  const unreadKontak = Array.isArray(kontak)
    ? kontak.filter((k: { status: string }) => k.status === 'belum_dibaca').length
    : 0;
  const recentKontak = Array.isArray(kontak) ? kontak.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Selamat datang, {user?.name || 'Admin'}! 👋
            </h2>
            <p className="text-blue-100 mt-1 text-sm">
              Ini adalah panel admin untuk mengelola company profile BPKAD
              Kabupaten Donggala.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-3">
            <TrendingUp className="h-5 w-5" />
            <div>
              <p className="text-xs text-blue-100">Status Sistem</p>
              <p className="font-semibold text-sm">Aktif & Normal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <LoadingSpinner text="Memuat statistik..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Berita"
            value={
              beritaData?.data?.total || (Array.isArray(berita) ? berita.length : 0)
            }
            icon={<Newspaper className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50"
            link="/berita"
          />
          <StatCard
            label="Layanan"
            value={Array.isArray(layanan) ? layanan.length : 0}
            icon={<Briefcase className="h-5 w-5 text-green-600" />}
            color="bg-green-50"
            link="/layanan"
          />
          <StatCard
            label="Slide Jumbotron"
            value={Array.isArray(jumbotron) ? jumbotron.length : 0}
            icon={<Image className="h-5 w-5 text-purple-600" />}
            color="bg-purple-50"
            link="/jumbotron"
          />
          <StatCard
            label="Pesan Belum Dibaca"
            value={unreadKontak}
            icon={<MessageSquare className="h-5 w-5 text-orange-600" />}
            color="bg-orange-50"
            link="/kontak"
          />
        </div>
      )}

      {/* Recent Messages & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Pesan Terbaru</h3>
            <Link
              to="/kontak"
              className="text-sm text-blue-600 hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          {recentKontak.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Mail className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tidak ada pesan masuk</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentKontak.map((k: {
                id: number;
                nama: string;
                email: string;
                subjek?: string;
                status: string;
                created_at: string;
              }) => (
                <div
                  key={k.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">
                      {k.nama?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {k.nama}
                      </p>
                      <span
                        className={`badge flex-shrink-0 ${
                          k.status === 'belum_dibaca'
                            ? 'badge-blue'
                            : k.status === 'diproses'
                            ? 'badge-yellow'
                            : 'badge-green'
                        }`}
                      >
                        {k.status === 'belum_dibaca'
                          ? 'Baru'
                          : k.status === 'diproses'
                          ? 'Diproses'
                          : 'Dibaca'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {k.subjek || k.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(k.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Akses Cepat</h3>
          <div className="space-y-2">
            {[
              { to: '/profile', label: 'Edit Profil Instansi', icon: Users, color: 'text-blue-600 bg-blue-50' },
              { to: '/berita', label: 'Tambah Berita Baru', icon: Newspaper, color: 'text-green-600 bg-green-50' },
              { to: '/jumbotron', label: 'Kelola Jumbotron', icon: Image, color: 'text-purple-600 bg-purple-50' },
              { to: '/layanan', label: 'Tambah Layanan', icon: Briefcase, color: 'text-orange-600 bg-orange-50' },
              { to: '/kontak', label: 'Cek Pesan Masuk', icon: MessageSquare, color: 'text-red-600 bg-red-50' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {item.label}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Edit, Trash2, Eye, FileText, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { suratKeluarApi } from '../../api';
import type { SuratKeluar } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../utils/cn';

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText className="w-3 h-3" /> },
  menunggu_persetujuan: { label: 'Menunggu Persetujuan', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <CheckCircle className="w-3 h-3" /> },
  disetujui: { label: 'Disetujui', bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
  ditolak: { label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
  terkirim: { label: 'Terkirim', bg: 'bg-blue-100', text: 'text-blue-800', icon: <Send className="w-3 h-3" /> },
  arsip: { label: 'Arsip', bg: 'bg-gray-100', text: 'text-gray-800', icon: <FileText className="w-3 h-3" /> },
};

const SuratKeluarPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const isAdminAtauAdminSurat = hasRole('admin') || hasRole('super_admin');

  // Filter States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [perPage] = useState(10);

  // Debounce search state
  const [debouncedSearch, setDebouncedSearch] = useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['surat-keluar', { page, per_page: perPage, search: debouncedSearch, status: statusFilter, tahun: yearFilter }],
    queryFn: () => suratKeluarApi.getAll({
      page,
      per_page: perPage,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      tahun: yearFilter ? parseInt(yearFilter) : undefined
    }).then(res => res.data.data),
  });

  // Delete Mutation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suratKeluarApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-keluar'] });
      toast.success('Surat keluar berhasil dihapus');
      setDeleteConfirmOpen(false);
      setSelectedIdToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menghapus surat keluar');
    }
  });

  const handleDeleteClick = (id: number) => {
    setSelectedIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surat Keluar</h1>
          <p className="text-gray-500">Manajemen pengajuan dan arsip surat keluar</p>
        </div>
        
        {isAdminAtauAdminSurat && (
          <Link to="/surat-keluar/tambah">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Surat Keluar
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cari perihal, tujuan, atau nomor surat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative w-40">
            <select
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="menunggu_persetujuan">Menunggu</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="terkirim">Terkirim</option>
              <option value="arsip">Arsip</option>
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div className="w-32">
            <select
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Tahun</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">Terjadi kesalahan saat memuat data</div>
        ) : !data?.data?.length ? (
          <EmptyState
            icon={<FileText className="w-12 h-12 text-gray-300" />}
            title="Tidak Ada Data Surat Keluar"
            description="Belum ada surat keluar yang dicatat atau tidak ada data yang cocok dengan filter pencarian"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tujuan / Instansi</th>
                  <th className="px-6 py-4 font-semibold">Perihal</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal Surat</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((item: SuratKeluar) => {
                  const sConf = statusConfig[item.status] || statusConfig.draft;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.tujuan}</div>
                        <div className="text-xs text-gray-500">{item.instansi_tujuan}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 line-clamp-2">{item.perihal}</div>
                        {item.nomor_surat && (
                          <div className="text-xs font-mono text-blue-600 mt-1">{item.nomor_surat}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {item.tanggal_surat_keluar || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          sConf.bg, sConf.text
                        )}>
                          {sConf.icon} {sConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/surat-keluar/${item.id}`}>
                            <Button variant="outline" size="sm" className="p-1.5 h-auto text-blue-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          {(item.status === 'draft' || item.status === 'ditolak') && isAdminAtauAdminSurat && (
                            <>
                              <Link to={`/surat-keluar/${item.id}/edit`}>
                                <Button variant="outline" size="sm" className="p-1.5 h-auto text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="p-1.5 h-auto text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteClick(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Info & Controls */}
        {data?.meta && data.meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{(page - 1) * perPage + 1}</span> hingga{' '}
              <span className="font-semibold text-gray-900">
                {Math.min(page * perPage, data.meta.total)}
              </span>{' '}
              dari <span className="font-semibold text-gray-900">{data.meta.total}</span> data
            </span>
            
            <Pagination 
              currentPage={page}
              lastPage={data.meta.last_page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => selectedIdToDelete && deleteMutation.mutate(selectedIdToDelete)}
        title="Hapus Surat Keluar"
        message="Apakah Anda yakin ingin menghapus surat keluar ini? Aksi ini tidak dapat dibatalkan dan file lampiran akan ikut terhapus."
        confirmText="Hapus Surat"
        cancelText="Batal"
        type="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default SuratKeluarPage;

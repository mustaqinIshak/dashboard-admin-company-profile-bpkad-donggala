import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { suratMasukApi } from '../../api';
import type { SuratMasuk, Pagination } from '../../types';
import { cn } from '../../utils/cn';

// UI Components
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import PaginationComponent from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  baru: { label: 'Baru', bg: 'bg-blue-100', text: 'text-blue-800' },
  diproses: { label: 'Diproses', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  selesai: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-800' },
  arsip: { label: 'Arsip', bg: 'bg-gray-100', text: 'text-gray-800' },
};

const SuratMasukPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tahunFilter, setTahunFilter] = useState(new Date().getFullYear().toString());
  const [page, setPage] = useState(1);

  // Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<SuratMasuk | null>(null);

  // Fetch Data
  const { data, isLoading } = useQuery<{ data: Pagination<SuratMasuk> }>({
    queryKey: ['surat-masuk', page, search, statusFilter, tahunFilter],
    queryFn: () =>
      suratMasukApi.getAll({
        page,
        search,
        status: statusFilter,
        tahun: tahunFilter ? parseInt(tahunFilter, 10) : undefined,
      }).then(res => res.data),
  });

  const pagination = data?.data;
  const suratList = pagination?.data || [];

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => suratMasukApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-masuk'] });
      toast.success('Surat masuk berhasil dihapus');
      setIsDeleteOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menghapus surat masuk');
    },
  });

  const handleDelete = () => {
    if (selectedSurat) {
      deleteMutation.mutate(selectedSurat.id);
    }
  };

  const openDeleteDialog = (surat: SuratMasuk) => {
    setSelectedSurat(surat);
    setIsDeleteOpen(true);
  };

  // Filter handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleTahunChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTahunFilter(e.target.value);
    setPage(1);
  };

  // Generate Year Options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surat Masuk</h1>
          <p className="text-gray-500">Manajemen pencatatan surat masuk dan disposisi</p>
        </div>
        <Link to="/surat-masuk/tambah">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Tambah Surat Masuk
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari perihal, pengirim, no agenda..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          <option value="baru">Baru</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="arsip">Arsip</option>
        </select>
        <select
          value={tahunFilter}
          onChange={handleTahunChange}
          className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Tahun</option>
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : suratList.length === 0 ? (
          <EmptyState
            title="Tidak ada surat masuk"
            description="Belum ada data surat masuk untuk filter ini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">No. Agenda/Surat</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Pengirim</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Perihal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tanggal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suratList.map((surat) => {
                  const statusConf = statusConfig[surat.status] || statusConfig.baru;
                  return (
                    <tr key={surat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-blue-600">{surat.no_agenda}</div>
                        <div className="text-xs text-gray-500 mt-1">{surat.nomor_surat || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{surat.pengirim}</div>
                        <div className="text-sm text-gray-500">{surat.instansi_pengirim}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">{surat.perihal}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="text-gray-900">Terima: <span className="font-medium text-gray-700">{surat.tanggal_terima}</span></div>
                        <div className="text-xs">Surat: {surat.tanggal_surat}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2.5 py-1 text-xs font-medium rounded-full',
                            statusConf.bg,
                            statusConf.text
                          )}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link to={`/surat-masuk/${surat.id}`}>
                          <Button variant="outline" size="sm" title="Detail">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        
                        {(surat.status === 'baru' || surat.status === 'diproses') && (
                          <Link to={`/surat-masuk/${surat.id}/edit`}>
                            <Button variant="secondary" size="sm" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteDialog(surat)}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-6 flex justify-center">
          <PaginationComponent
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Surat Masuk"
        message={`Apakah Anda yakin ingin menghapus surat dari ${selectedSurat?.pengirim} dengan perihal "${selectedSurat?.perihal}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
        type="danger"
      />
    </div>
  );
};

export default SuratMasukPage;

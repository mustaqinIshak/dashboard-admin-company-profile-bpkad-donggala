import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle, XCircle, LogOut, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { tamuApi } from '../../api';
import type { Tamu, Pagination } from '../../types';
import { cn } from '../../utils/cn';

// UI Components
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import PaginationComponent from '../../components/ui/Pagination';
import TamuFormDialog from './TamuFormDialog';

const tamuStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  menunggu: { label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  diterima: { label: 'Diterima', bg: 'bg-green-100', text: 'text-green-800' },
  ditolak: { label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-800' },
  selesai: { label: 'Selesai', bg: 'bg-gray-100', text: 'text-gray-800' },
};

const TamuPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedTamu, setSelectedTamu] = useState<Tamu | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Data
  const { data, isLoading } = useQuery<{ data: Pagination<Tamu> }>({
    queryKey: ['tamu', page, search, statusFilter, dateFilter],
    queryFn: () =>
      tamuApi.getAll({
        page,
        search,
        status: statusFilter,
        tanggal: dateFilter,
      }).then(res => res.data),
  });

  const pagination = data?.data;
  const tamuList = pagination?.data || [];

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, catatan }: { id: number; status: string; catatan?: string }) =>
      tamuApi.updateStatus(id, { status, catatan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamu'] });
      toast.success('Status tamu berhasil diperbarui');
      setIsRejectOpen(false);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal memperbarui status');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: number) => tamuApi.checkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamu'] });
      toast.success('Tamu berhasil di-checkout (Selesai)');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal checkout tamu');
    },
  });

  // Actions
  const handleTerima = (tamu: Tamu) => {
    updateStatusMutation.mutate({ id: tamu.id, status: 'diterima' });
  };

  const handleTolakClick = (tamu: Tamu) => {
    setSelectedTamu(tamu);
    setIsRejectOpen(true);
  };

  const handeTolakSubmit = () => {
    if (selectedTamu) {
      updateStatusMutation.mutate({
        id: selectedTamu.id,
        status: 'ditolak',
        catatan: rejectReason,
      });
    }
  };

  const handleCheckout = (tamu: Tamu) => {
    if (window.confirm('Yakin ingin menyelesaikan kunjungan tamu ini?')) {
      checkoutMutation.mutate(tamu.id);
    }
  };

  const openDetail = (tamu: Tamu) => {
    setSelectedTamu(tamu);
    setIsDetailOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loby Tamu</h1>
          <p className="text-gray-500">Manajemen antrian dan kunjungan tamu</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Daftarkan Tamu
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama, instansi, atau nomor antrian..."
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
          <option value="menunggu">Menunggu</option>
          <option value="diterima">Diterima</option>
          <option value="ditolak">Ditolak</option>
          <option value="selesai">Selesai</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={handleDateChange}
          className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : tamuList.length === 0 ? (
          <EmptyState
            title="Tidak ada data tamu"
            description="Belum ada data kunjungan tamu untuk filter ini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">No. Antrian</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nama & Instansi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tujuan</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Waktu</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tamuList.map((tamu) => {
                  const statusConf = tamuStatusConfig[tamu.status] || tamuStatusConfig.selesai;
                  return (
                    <tr key={tamu.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-blue-600">{tamu.nomor_antrian}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tamu.nama}</div>
                        <div className="text-sm text-gray-500">{tamu.instansi_asal || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{tamu.nama_yang_dituju}</div>
                        <div className="text-xs text-gray-500">{tamu.jabatan_yang_dituju || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(tamu.waktu_masuk).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(tamu)}
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {tamu.status === 'menunggu' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleTerima(tamu)}
                              title="Terima"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleTolakClick(tamu)}
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {tamu.status === 'diterima' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCheckout(tamu)}
                            title="Checkout (Selesai)"
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
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

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handeTolakSubmit}
        title="Tolak Tamu"
        message={`Anda yakin ingin menolak tamu ${selectedTamu?.nama}? Silakan masukkan alasan (opsional).`}
        confirmText="Tolak Tamu"
        type="danger"
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alasan Penolakan (Opsional)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            placeholder="Contoh: Pegawai yang dituju sedang dinas luar..."
          />
        </div>
      </ConfirmDialog>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Kunjungan Tamu"
        size="lg"
      >
        {selectedTamu && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedTamu.nama}</h3>
                <p className="text-gray-500 text-sm">{selectedTamu.instansi_asal || 'Personal / Umum'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">No. Antrian</div>
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {selectedTamu.nomor_antrian}
                </div>
              </div>
            </div>

            {selectedTamu.foto_url && (
              <div className="flex justify-center mb-6 bg-gray-50 rounded-lg border p-2">
                <img
                  src={selectedTamu.foto_url}
                  alt={`Foto ${selectedTamu.nama}`}
                  className="max-h-64 max-w-full object-contain rounded shadow-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Identitas</p>
                <p className="font-medium">
                  {selectedTamu.jenis_identitas ? selectedTamu.jenis_identitas.toUpperCase() : '-'} 
                  {selectedTamu.no_identitas ? ` - ${selectedTamu.no_identitas}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full inline-block mt-1',
                    (tamuStatusConfig[selectedTamu.status] || tamuStatusConfig.selesai).bg,
                    (tamuStatusConfig[selectedTamu.status] || tamuStatusConfig.selesai).text
                  )}
                >
                  {(tamuStatusConfig[selectedTamu.status] || tamuStatusConfig.selesai).label}
                </span>
              </div>

              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-500">Tujuan Kunjungan</p>
                <p className="font-medium text-gray-900">{selectedTamu.nama_yang_dituju}</p>
                <p className="text-sm text-gray-600">{selectedTamu.jabatan_yang_dituju}</p>
              </div>

              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-500">Keperluan</p>
                <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-md mt-1">
                  {selectedTamu.keperluan}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Waktu Masuk</p>
                <p className="font-medium">
                  {new Date(selectedTamu.waktu_masuk).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Waktu Keluar</p>
                <p className="font-medium">
                  {selectedTamu.waktu_keluar ? new Date(selectedTamu.waktu_keluar).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '-'}
                </p>
              </div>
              {selectedTamu.catatan && (
                <div className="col-span-1 md:col-span-2 border-t pt-4">
                  <p className="text-sm text-gray-500">Catatan Admin/Petugas</p>
                  <p className="font-medium text-gray-900 text-sm mt-1 text-red-600">
                    {selectedTamu.catatan}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t gap-2">
              {selectedTamu.status === 'menunggu' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleTolakClick(selectedTamu);
                    }}
                  >
                    Tolak
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleTerima(selectedTamu);
                      setIsDetailOpen(false);
                    }}
                  >
                    Terima
                  </Button>
                </>
              )}
              {selectedTamu.status === 'diterima' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleCheckout(selectedTamu);
                    setIsDetailOpen(false);
                  }}
                >
                  Checkout (Selesai)
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Pendaftaran */}
      <TamuFormDialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

export default TamuPage;


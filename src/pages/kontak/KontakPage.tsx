import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Mail,
  Trash2,
  Eye,
  Clock,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { kontakApi } from '../../api';
import { formatDateTime, truncate } from '../../utils';
import type { Kontak } from '../../types';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_OPTIONS = [
  { value: 'belum_dibaca', label: 'Belum Dibaca', color: 'badge-blue' },
  { value: 'sudah_dibaca', label: 'Sudah Dibaca', color: 'badge-green' },
  { value: 'diproses', label: 'Diproses', color: 'badge-yellow' },
];

const KontakPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewItem, setViewItem] = useState<Kontak | null>(null);
  const [deleteItem, setDeleteItem] = useState<Kontak | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['kontak'],
    queryFn: () => kontakApi.getAll(),
  });

  const items: Kontak[] = data?.data?.data || data?.data || [];

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.subjek?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const unread = items.filter((i) => i.status === 'belum_dibaca').length;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      kontakApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kontak'] });
    },
    onError: () => toast.error('Gagal memperbarui status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => kontakApi.delete(id),
    onSuccess: () => {
      toast.success('Pesan dihapus');
      setDeleteItem(null);
      queryClient.invalidateQueries({ queryKey: ['kontak'] });
    },
    onError: () => toast.error('Gagal menghapus pesan'),
  });

  const openView = (item: Kontak) => {
    setViewItem(item);
    if (item.status === 'belum_dibaca') {
      updateStatusMutation.mutate({ id: item.id, status: 'sudah_dibaca' });
    }
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((o) => o.value === status);
    return <span className={`badge ${s?.color || 'badge-gray'}`}>{s?.label || status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">Pesan Masuk</h3>
          <p className="text-sm text-gray-500">
            {unread > 0 && (
              <span className="text-blue-600 font-medium">{unread} pesan belum dibaca • </span>
            )}
            Total {items.length} pesan
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pesan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner text="Memuat pesan..." />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Tidak ada pesan"
            description={
              search || filterStatus
                ? 'Tidak ada pesan yang sesuai filter'
                : 'Belum ada pesan masuk dari pengunjung website'
            }
            icon={<Mail className="h-12 w-12 text-gray-300" />}
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Pengirim
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                    Subjek / Pesan
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                    Waktu
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      item.status === 'belum_dibaca' ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {item.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p
                            className={`font-medium text-gray-800 ${
                              item.status === 'belum_dibaca' ? 'font-semibold' : ''
                            }`}
                          >
                            {item.nama}
                          </p>
                          <p className="text-xs text-gray-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-medium text-gray-700 text-xs">
                        {item.subjek || '(Tanpa Subjek)'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {truncate(item.pesan, 50)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Lihat"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {item.status !== 'diproses' && (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: item.id,
                                status: 'diproses',
                              })
                            }
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md"
                            title="Tandai Diproses"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <Modal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          title="Detail Pesan"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label">Nama Pengirim</p>
                <p className="text-gray-800 font-medium">{viewItem.nama}</p>
              </div>
              <div>
                <p className="label">Email</p>
                <p className="text-gray-800">{viewItem.email}</p>
              </div>
              {viewItem.telepon && (
                <div>
                  <p className="label">Telepon</p>
                  <p className="text-gray-800">{viewItem.telepon}</p>
                </div>
              )}
              <div>
                <p className="label">Waktu Kirim</p>
                <p className="text-gray-800">{formatDateTime(viewItem.created_at)}</p>
              </div>
            </div>
            {viewItem.subjek && (
              <div>
                <p className="label">Subjek</p>
                <p className="text-gray-800 font-medium">{viewItem.subjek}</p>
              </div>
            )}
            <div>
              <p className="label">Pesan</p>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {viewItem.pesan}
              </div>
            </div>
            <div>
              <p className="label">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => {
                      updateStatusMutation.mutate({ id: viewItem.id, status: o.value });
                      setViewItem({ ...viewItem, status: o.value as Kontak['status'] });
                    }}
                    className={`badge cursor-pointer hover:opacity-80 transition-opacity ${o.color} ${
                      viewItem.status === o.value ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        title="Hapus Pesan"
        message={`Hapus pesan dari "${deleteItem?.nama}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default KontakPage;

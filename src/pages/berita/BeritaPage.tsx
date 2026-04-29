import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { beritaApi } from '../../api';
import { getImageUrl, getValidationErrors, formatDate, truncate, extractItems, extractPagination } from '../../utils';
import type { Berita } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const schema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi'),
  isi: z.string().min(1, 'Isi berita wajib diisi'),
  kategori: z.string().optional(),
  is_published: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const BeritaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Berita | null>(null);
  const [deleteItem, setDeleteItem] = useState<Berita | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['berita', page],
    queryFn: () => beritaApi.getAll(page),
  });

  const items: Berita[] = extractItems<Berita>(data);
  const { lastPage, total } = extractPagination(data);

  const filtered = items.filter(
    (item) =>
      !search ||
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(search.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  const openAdd = () => {
    setEditItem(null);
    reset({ judul: '', isi: '', kategori: '', is_published: true });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: Berita) => {
    setEditItem(item);
    reset({
      judul: item.judul,
      isi: item.isi,
      kategori: item.kategori || '',
      is_published: item.is_published,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (formData: FormData) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (typeof v === 'boolean') {
          fd.append(k, v ? '1' : '0');
        } else {
          fd.append(k, String(v));
        }
      });
      if (imageFile) fd.append('gambar', imageFile);
      if (editItem) return beritaApi.update(editItem.id, fd);
      return beritaApi.create(fd);
    },
    onSuccess: () => {
      toast.success(editItem ? 'Berita diperbarui' : 'Berita ditambahkan');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['berita'] });
    },
    onError: (e) => getValidationErrors(e).forEach((m) => toast.error(m)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => beritaApi.delete(id),
    onSuccess: () => {
      toast.success('Berita dihapus');
      setDeleteItem(null);
      queryClient.invalidateQueries({ queryKey: ['berita'] });
    },
    onError: () => toast.error('Gagal menghapus berita'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">Daftar Berita</h3>
          <p className="text-sm text-gray-500">
            Total {total} berita terdaftar
          </p>
        </div>
        <Button onClick={openAdd} icon={<Plus className="h-4 w-4" />}>
          Tambah Berita
        </Button>
      </div>

      {/* Search */}
      <div className="card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner text="Memuat berita..." />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Belum ada berita"
            description="Mulai tambahkan berita untuk ditampilkan di website"
            action={openAdd}
            actionLabel="Tambah Berita"
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Berita</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.gambar ? (
                          <img
                            src={getImageUrl(item.gambar) || undefined}
                            alt={item.judul}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{truncate(item.judul, 40)}</p>
                          <p className="text-xs text-gray-400 hidden sm:block">/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      <span className="badge badge-blue">{item.kategori || 'Umum'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${item.is_published ? 'badge-green' : 'badge-gray'}`}>
                        {item.is_published ? 'Diterbitkan' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
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
          {lastPage > 1 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Berita' : 'Tambah Berita'}
        size="xl"
      >
        <form
          onSubmit={handleSubmit((d) => saveMutation.mutate(d as FormData))}
          className="space-y-4"
        >
          <ImageUpload
            label="Gambar Berita"
            currentImage={editItem?.gambar ? getImageUrl(editItem.gambar) || undefined : undefined}
            onChange={setImageFile}
          />
          <Input
            label="Judul Berita"
            required
            error={errors.judul?.message}
            {...register('judul')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kategori"
              placeholder="Pengumuman, Berita, dll"
              {...register('kategori')}
            />
            <div className="space-y-1">
              <label className="label">Status Publikasi</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded text-blue-600"
                  {...register('is_published')}
                />
                <span className="text-sm text-gray-700">Terbitkan sekarang</span>
              </label>
            </div>
          </div>
          <Textarea
            label="Isi Berita"
            required
            error={errors.isi?.message}
            rows={8}
            placeholder="Tulis isi berita di sini..."
            {...register('isi')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editItem ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        title="Hapus Berita"
        message={`Hapus berita "${deleteItem?.judul}"? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default BeritaPage;

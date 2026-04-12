import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { layananApi } from '../../api';
import { getImageUrl, getValidationErrors, truncate } from '../../utils';
import type { Layanan } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const schema = z.object({
  nama: z.string().min(1, 'Nama layanan wajib diisi'),
  deskripsi: z.string().optional(),
  ikon: z.string().optional(),
  urutan: z.coerce.number().min(1),
  aktif: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const LayananPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Layanan | null>(null);
  const [deleteItem, setDeleteItem] = useState<Layanan | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['layanan'],
    queryFn: () => layananApi.getAll(),
  });

  const items: Layanan[] = data?.data?.data || data?.data || [];

  const filtered = items.filter(
    (item) =>
      !search || item.nama.toLowerCase().includes(search.toLowerCase())
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
    reset({ nama: '', deskripsi: '', ikon: '', urutan: items.length + 1, aktif: true });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: Layanan) => {
    setEditItem(item);
    reset({
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      ikon: item.ikon || '',
      urutan: item.urutan,
      aktif: item.aktif,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append('gambar', imageFile);
      if (editItem) return layananApi.update(editItem.id, fd);
      return layananApi.create(fd);
    },
    onSuccess: () => {
      toast.success(editItem ? 'Layanan diperbarui' : 'Layanan ditambahkan');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['layanan'] });
    },
    onError: (e) => getValidationErrors(e).forEach((m) => toast.error(m)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => layananApi.delete(id),
    onSuccess: () => {
      toast.success('Layanan dihapus');
      setDeleteItem(null);
      queryClient.invalidateQueries({ queryKey: ['layanan'] });
    },
    onError: () => toast.error('Gagal menghapus layanan'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">Daftar Layanan</h3>
          <p className="text-sm text-gray-500">
            {items.length} layanan terdaftar
          </p>
        </div>
        <Button onClick={openAdd} icon={<Plus className="h-4 w-4" />}>
          Tambah Layanan
        </Button>
      </div>

      {/* Search */}
      <div className="card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner text="Memuat layanan..." />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Belum ada layanan"
            description="Tambahkan layanan yang disediakan oleh instansi"
            action={openAdd}
            actionLabel="Tambah Layanan"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow p-0 overflow-hidden">
              {item.gambar && (
                <img
                  src={getImageUrl(item.gambar) || undefined}
                  alt={item.nama}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {item.nama}
                  </h4>
                  <span
                    className={`badge flex-shrink-0 ${
                      item.aktif ? 'badge-green' : 'badge-gray'
                    }`}
                  >
                    {item.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {item.deskripsi && (
                  <p className="text-xs text-gray-500 mb-3">
                    {truncate(item.deskripsi, 80)}
                  </p>
                )}
                {item.ikon && (
                  <p className="text-xs text-gray-400 mb-3">
                    Ikon: <code className="bg-gray-100 px-1 rounded">{item.ikon}</code>
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="badge badge-blue text-xs">#{item.urutan}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Layanan' : 'Tambah Layanan'}
      >
        <form
          onSubmit={handleSubmit((d) => saveMutation.mutate(d as FormData))}
          className="space-y-4"
        >
          <ImageUpload
            label="Gambar Layanan"
            currentImage={editItem?.gambar ? getImageUrl(editItem.gambar) || undefined : undefined}
            onChange={setImageFile}
          />
          <Input
            label="Nama Layanan"
            required
            error={errors.nama?.message}
            {...register('nama')}
          />
          <Textarea
            label="Deskripsi"
            rows={3}
            {...register('deskripsi')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ikon (class name)"
              placeholder="e.g. fa-file-alt"
              {...register('ikon')}
            />
            <Input
              label="Urutan"
              type="number"
              min={1}
              {...register('urutan')}
            />
          </div>
          <div className="space-y-1">
            <label className="label">Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-blue-600"
                {...register('aktif')}
              />
              <span className="text-sm text-gray-700">Aktifkan layanan</span>
            </label>
          </div>
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
        title="Hapus Layanan"
        message={`Hapus layanan "${deleteItem?.nama}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LayananPage;

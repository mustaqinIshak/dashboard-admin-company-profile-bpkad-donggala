import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Power, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { jumbotronApi } from '../../api';
import { getImageUrl, getValidationErrors, extractItems } from '../../utils';
import type { Jumbotron } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const schema = z.object({
  judul: z.string().optional(),
  deskripsi: z.string().optional(),
  urutan: z.coerce.number().min(0).optional(),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const JumbotronPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Jumbotron | null>(null);
  const [deleteItem, setDeleteItem] = useState<Jumbotron | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['jumbotron'],
    queryFn: () => jumbotronApi.getAll(),
  });

  const items: Jumbotron[] = extractItems<Jumbotron>(data);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  const openAdd = () => {
    setEditItem(null);
    reset({ judul: '', deskripsi: '', urutan: items.length + 1, is_active: true });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: Jumbotron) => {
    setEditItem(item);
    reset({ judul: item.judul || '', deskripsi: item.deskripsi || '', urutan: item.urutan, is_active: item.is_active });
    setImageFile(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append('gambar', imageFile);
      if (editItem) {
        return jumbotronApi.update(editItem.id, fd);
      }
      return jumbotronApi.create(fd);
    },
    onSuccess: () => {
      toast.success(editItem ? 'Slide diperbarui' : 'Slide ditambahkan');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['jumbotron'] });
    },
    onError: (error) => {
      getValidationErrors(error).forEach((m) => toast.error(m));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jumbotronApi.delete(id),
    onSuccess: () => {
      toast.success('Slide dihapus');
      setDeleteItem(null);
      queryClient.invalidateQueries({ queryKey: ['jumbotron'] });
    },
    onError: () => toast.error('Gagal menghapus slide'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => jumbotronApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jumbotron'] });
    },
    onError: () => toast.error('Gagal mengubah status'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">Daftar Slide Jumbotron</h3>
          <p className="text-sm text-gray-500">
            Kelola slide banner yang ditampilkan di halaman utama website
          </p>
        </div>
        <Button onClick={openAdd} icon={<Plus className="h-4 w-4" />}>
          Tambah Slide
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner text="Memuat data..." />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Belum ada slide"
            description="Tambahkan slide jumbotron pertama untuk ditampilkan di website"
            action={openAdd}
            actionLabel="Tambah Slide"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card group overflow-hidden p-0">
              <div className="relative">
                {item.gambar ? (
                  <img
                    src={getImageUrl(item.gambar) || undefined}
                    alt={item.judul ?? 'Slide'}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-400 text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="badge badge-blue">#{item.urutan}</span>
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`}
                  >
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 truncate">
                  {item.judul || '(Tanpa Judul)'}
                </h4>
                {item.deskripsi && (
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {item.deskripsi}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleMutation.mutate(item.id)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                      item.is_active
                        ? 'text-green-700 bg-green-50 hover:bg-green-100'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <GripVertical className="h-4 w-4 text-gray-300" />
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
        title={editItem ? 'Edit Slide' : 'Tambah Slide'}
      >
        <form
          onSubmit={handleSubmit((d) => saveMutation.mutate(d as FormData))}
          className="space-y-4"
        >
          <ImageUpload
            label="Gambar Slide"
            currentImage={editItem?.gambar ? getImageUrl(editItem.gambar) || undefined : undefined}
            onChange={setImageFile}
          />
          <Input
            label="Judul"
            placeholder="Judul slide (opsional)"
            error={errors.judul?.message}
            {...register('judul')}
          />
          <Textarea label="Deskripsi" rows={2} placeholder="Deskripsi slide (opsional)" {...register('deskripsi')} />
          <Input
            label="Urutan"
            type="number"
            min={0}
            error={errors.urutan?.message}
            {...register('urutan')}
          />
          <div className="space-y-1">
            <label className="label">Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-blue-600"
                {...register('is_active')}
              />
              <span className="text-sm text-gray-700">Aktifkan slide</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editItem ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        title="Hapus Slide"
        message={`Apakah Anda yakin ingin menghapus slide "${deleteItem?.judul}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default JumbotronPage;

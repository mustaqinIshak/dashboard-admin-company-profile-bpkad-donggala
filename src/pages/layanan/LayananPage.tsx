import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import { layananApi } from '../../api';
import { getValidationErrors, truncate, extractItems } from '../../utils';
import type { Layanan } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

// Tipe layanan sesuai Layanan::TIPE_LIST di backend
const TIPE_OPTIONS = [
  { value: 'apbd', label: 'APBD' },
  { value: 'apbd_p', label: 'APBD Perubahan' },
  { value: 'lkpd', label: 'LKPD' },
  { value: 'rka', label: 'RKA' },
  { value: 'dpa', label: 'DPA' },
  { value: 'laporan', label: 'Laporan Keuangan' },
];

const schema = z.object({
  tipe: z.string().min(1, 'Tipe layanan wajib dipilih'),
  judul: z.string().min(1, 'Judul layanan wajib diisi'),
  deskripsi: z.string().optional(),
  tahun_apbd: z.coerce
    .number()
    .min(2000, 'Tahun minimal 2000')
    .max(2100, 'Tahun maksimal 2100'),
});

type FormData = z.infer<typeof schema>;

const LayananPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Layanan | null>(null);
  const [deleteItem, setDeleteItem] = useState<Layanan | null>(null);
  const [dokumenFile, setDokumenFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['layanan'],
    queryFn: () => layananApi.getAll(),
  });

  const items: Layanan[] = extractItems<Layanan>(data);

  const filtered = items.filter(
    (item) =>
      !search ||
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      String(item.tahun_apbd).includes(search)
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  const currentYear = new Date().getFullYear();

  const openAdd = () => {
    setEditItem(null);
    reset({ tipe: '', judul: '', deskripsi: '', tahun_apbd: currentYear });
    setDokumenFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: Layanan) => {
    setEditItem(item);
    reset({
      tipe: item.tipe,
      judul: item.judul,
      deskripsi: item.deskripsi || '',
      tahun_apbd: item.tahun_apbd,
    });
    setDokumenFile(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData();
      fd.append('tipe', data.tipe);
      fd.append('judul', data.judul);
      if (data.deskripsi) fd.append('deskripsi', data.deskripsi);
      fd.append('tahun_apbd', String(data.tahun_apbd));
      if (dokumenFile) fd.append('file_dokumen', dokumenFile);
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

  const getTipeLabel = (tipe: string) =>
    TIPE_OPTIONS.find((o) => o.value === tipe)?.label || tipe.toUpperCase();

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
            placeholder="Cari layanan atau tahun..."
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
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-800 text-sm leading-snug">
                      {item.judul}
                    </h4>
                    <span className="badge badge-blue flex-shrink-0">{item.tahun_apbd}</span>
                  </div>
                  <span className="badge badge-gray mt-1">{getTipeLabel(item.tipe)}</span>
                </div>
              </div>
              {item.deskripsi && (
                <p className="text-xs text-gray-500 mb-3">
                  {truncate(item.deskripsi, 80)}
                </p>
              )}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {item.file_dokumen && (
                  <a
                    href={item.file_dokumen}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md hover:bg-green-100"
                  >
                    <Download className="h-3 w-3" />
                    Unduh
                  </a>
                )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="label">
                Tipe Layanan <span className="text-red-500">*</span>
              </label>
              <select
                className={`input-field ${errors.tipe ? 'input-field-error' : ''}`}
                {...register('tipe')}
              >
                <option value="">-- Pilih Tipe --</option>
                {TIPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.tipe && (
                <p className="text-xs text-red-500">{errors.tipe.message}</p>
              )}
            </div>
            <Input
              label="Tahun APBD"
              required
              type="number"
              min={2000}
              max={2100}
              error={errors.tahun_apbd?.message}
              {...register('tahun_apbd')}
            />
          </div>
          <Input
            label="Judul Layanan"
            required
            error={errors.judul?.message}
            {...register('judul')}
          />
          <Textarea
            label="Deskripsi"
            rows={3}
            {...register('deskripsi')}
          />
          <div className="space-y-1">
            <label className="label">File Dokumen</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => setDokumenFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-xs text-gray-400">Format: PDF, Word, Excel, PowerPoint. Maks. 20MB.</p>
            {editItem?.file_dokumen && !dokumenFile && (
              <p className="text-xs text-green-600">✓ Sudah ada file dokumen tersimpan</p>
            )}
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
        message={`Hapus layanan "${deleteItem?.judul}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LayananPage;

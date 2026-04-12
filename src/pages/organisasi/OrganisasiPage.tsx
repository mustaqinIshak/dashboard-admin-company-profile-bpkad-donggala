import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { organisasiApi } from '../../api';
import { getImageUrl, getValidationErrors, extractItems } from '../../utils';
import type { Jabatan, Organisasi } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const BIDANG_OPTIONS = [
  { kode: 'sekretariat', label: 'Sekretariat' },
  { kode: 'aset', label: 'Bidang Aset' },
  { kode: 'perbendaharaan', label: 'Bidang Perbendaharaan' },
  { kode: 'akuntansi', label: 'Bidang Akuntansi' },
  { kode: 'anggaran', label: 'Bidang Anggaran' },
];

const bidangSchema = z.object({
  deskripsi: z.string().optional(),
});

const jabatanSchema = z.object({
  nama_jabatan: z.string().min(1, 'Nama jabatan wajib diisi'),
  nama_pejabat: z.string().min(1, 'Nama pejabat wajib diisi'),
  nip: z.string().optional(),
  tugas_fungsi: z.string().optional(), // textarea: newline-separated list
});

type BidangFormData = z.infer<typeof bidangSchema>;
type JabatanFormData = z.infer<typeof jabatanSchema>;

const OrganisasiPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeBidang, setActiveBidang] = useState(BIDANG_OPTIONS[0].kode);
  const [bidangModalOpen, setBidangModalOpen] = useState(false);
  const [jabatanModalOpen, setJabatanModalOpen] = useState(false);
  const [editJabatan, setEditJabatan] = useState<Jabatan | null>(null);
  const [deleteJabatan, setDeleteJabatan] = useState<Jabatan | null>(null);
  const [jabatanFotoFile, setJabatanFotoFile] = useState<File | null>(null);

  const { data: bidangData, isLoading: bidangLoading } = useQuery({
    queryKey: ['organisasi', 'bidang', activeBidang],
    queryFn: () => organisasiApi.getByBidang(activeBidang),
  });

  const bidang: Organisasi | null = bidangData?.data?.data || bidangData?.data || null;

  const { data: jabatanData, isLoading: jabatanLoading } = useQuery({
    queryKey: ['jabatan', bidang?.id],
    queryFn: () => organisasiApi.getJabatan(bidang!.id),
    enabled: !!bidang?.id,
  });

  const jabatanList: Jabatan[] = extractItems<Jabatan>(jabatanData);

  const bidangForm = useForm<BidangFormData>({ resolver: zodResolver(bidangSchema) });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jabatanForm = useForm<JabatanFormData>({ resolver: zodResolver(jabatanSchema) as any });

  const openBidangEdit = () => {
    bidangForm.reset({
      deskripsi: bidang?.deskripsi || '',
    });
    setBidangModalOpen(true);
  };

  const openJabatanAdd = () => {
    setEditJabatan(null);
    jabatanForm.reset({ nama_jabatan: '', nama_pejabat: '', nip: '', tugas_fungsi: '' });
    setJabatanFotoFile(null);
    setJabatanModalOpen(true);
  };

  const openJabatanEdit = (jab: Jabatan) => {
    setEditJabatan(jab);
    jabatanForm.reset({
      nama_jabatan: jab.nama_jabatan,
      nama_pejabat: jab.nama_pejabat,
      nip: jab.nip || '',
      tugas_fungsi: jab.tugas_fungsi?.join('\n') || '',
    });
    setJabatanFotoFile(null);
    setJabatanModalOpen(true);
  };

  const saveBidangMutation = useMutation({
    mutationFn: (data: BidangFormData) =>
      organisasiApi.updateBidang(activeBidang, { deskripsi: data.deskripsi }),
    onSuccess: () => {
      toast.success('Data bidang disimpan');
      setBidangModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['organisasi', 'bidang', activeBidang] });
    },
    onError: (e) => getValidationErrors(e).forEach((m) => toast.error(m)),
  });

  const saveJabatanMutation = useMutation({
    mutationFn: (data: JabatanFormData) => {
      const fd = new FormData();
      fd.append('nama_jabatan', data.nama_jabatan);
      fd.append('nama_pejabat', data.nama_pejabat);
      if (data.nip) fd.append('nip', data.nip);
      // Convert newline-separated textarea into array items
      const tugasList = (data.tugas_fungsi || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      tugasList.forEach((t) => fd.append('tugas_fungsi[]', t));
      if (jabatanFotoFile) fd.append('foto', jabatanFotoFile);
      if (editJabatan) {
        return organisasiApi.updateJabatan(bidang!.id, editJabatan.id, fd);
      }
      return organisasiApi.addJabatan(bidang!.id, fd);
    },
    onSuccess: () => {
      toast.success(editJabatan ? 'Jabatan diperbarui' : 'Jabatan ditambahkan');
      setJabatanModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['jabatan', bidang?.id] });
    },
    onError: (e) => getValidationErrors(e).forEach((m) => toast.error(m)),
  });

  const deleteJabatanMutation = useMutation({
    mutationFn: (jabId: number) => organisasiApi.deleteJabatan(bidang!.id, jabId),
    onSuccess: () => {
      toast.success('Jabatan dihapus');
      setDeleteJabatan(null);
      queryClient.invalidateQueries({ queryKey: ['jabatan', bidang?.id] });
    },
    onError: () => toast.error('Gagal menghapus jabatan'),
  });

  return (
    <div className="space-y-6">
      {/* Bidang Tabs */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3">Pilih Bidang</h3>
        <div className="flex flex-wrap gap-2">
          {BIDANG_OPTIONS.map((opt) => (
            <button
              key={opt.kode}
              onClick={() => setActiveBidang(opt.kode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeBidang === opt.kode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {opt.label}
              {activeBidang === opt.kode && (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bidang Detail */}
      {bidangLoading ? (
        <LoadingSpinner text="Memuat data bidang..." />
      ) : (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">
                {BIDANG_OPTIONS.find(b => b.kode === activeBidang)?.label}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {bidang?.deskripsi || 'Belum ada deskripsi'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openBidangEdit}
              icon={<Pencil className="h-3.5 w-3.5" />}
            >
              Edit Bidang
            </Button>
          </div>
        </div>
      )}

      {/* Jabatan Section */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Daftar Jabatan</h3>
            <p className="text-sm text-gray-500">
              Pejabat dalam{' '}
              {BIDANG_OPTIONS.find((b) => b.kode === activeBidang)?.label}
            </p>
          </div>
          <Button
            size="sm"
            onClick={openJabatanAdd}
            disabled={!bidang?.id}
            icon={<Plus className="h-4 w-4" />}
          >
            Tambah Jabatan
          </Button>
        </div>

        {jabatanLoading ? (
          <LoadingSpinner text="Memuat jabatan..." />
        ) : jabatanList.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada jabatan di bidang ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {jabatanList.map((jab) => (
              <div
                key={jab.id}
                className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {jab.foto ? (
                    <img
                      src={getImageUrl(jab.foto) || undefined}
                      alt={jab.nama_pejabat}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {jab.nama_pejabat?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {jab.nama_pejabat}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{jab.nama_jabatan}</p>
                    {jab.nip && (
                      <p className="text-xs text-gray-400 truncate">NIP: {jab.nip}</p>
                    )}
                  </div>
                </div>
                {jab.tugas_fungsi && jab.tugas_fungsi.length > 0 && (
                  <ul className="mb-2 space-y-0.5">
                    {jab.tugas_fungsi.slice(0, 2).map((t, i) => (
                      <li key={i} className="text-xs text-gray-500 truncate">• {t}</li>
                    ))}
                    {jab.tugas_fungsi.length > 2 && (
                      <li className="text-xs text-gray-400">+{jab.tugas_fungsi.length - 2} lainnya</li>
                    )}
                  </ul>
                )}
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openJabatanEdit(jab)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteJabatan(jab)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bidang Edit Modal */}
      <Modal
        isOpen={bidangModalOpen}
        onClose={() => setBidangModalOpen(false)}
        title="Edit Bidang"
      >
        <form
          onSubmit={bidangForm.handleSubmit((d) => saveBidangMutation.mutate(d))}
          className="space-y-4"
        >
          <Textarea
            label="Deskripsi"
            rows={4}
            placeholder="Deskripsi singkat bidang..."
            {...bidangForm.register('deskripsi')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setBidangModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saveBidangMutation.isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Jabatan Modal */}
      <Modal
        isOpen={jabatanModalOpen}
        onClose={() => setJabatanModalOpen(false)}
        title={editJabatan ? 'Edit Jabatan' : 'Tambah Jabatan'}
      >
        <form
          onSubmit={jabatanForm.handleSubmit((d) => saveJabatanMutation.mutate(d as JabatanFormData))}
          className="space-y-4"
        >
          <ImageUpload
            label="Foto Pejabat"
            currentImage={editJabatan?.foto ? getImageUrl(editJabatan.foto) || undefined : undefined}
            onChange={setJabatanFotoFile}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Jabatan"
              required
              placeholder="Kepala Bidang"
              error={jabatanForm.formState.errors.nama_jabatan?.message}
              {...jabatanForm.register('nama_jabatan')}
            />
            <Input
              label="Nama Pejabat"
              required
              placeholder="Nama lengkap pejabat"
              error={jabatanForm.formState.errors.nama_pejabat?.message}
              {...jabatanForm.register('nama_pejabat')}
            />
          </div>
          <Input
            label="NIP"
            placeholder="Nomor Induk Pegawai (opsional)"
            {...jabatanForm.register('nip')}
          />
          <Textarea
            label="Tugas & Fungsi"
            rows={4}
            placeholder="Tulis satu tugas per baris..."
            {...jabatanForm.register('tugas_fungsi')}
          />
          <p className="text-xs text-gray-400 -mt-2">Tulis satu tugas/fungsi per baris.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setJabatanModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saveJabatanMutation.isPending}>
              {editJabatan ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteJabatan}
        onClose={() => setDeleteJabatan(null)}
        onConfirm={() =>
          deleteJabatan && deleteJabatanMutation.mutate(deleteJabatan.id)
        }
        title="Hapus Jabatan"
        message={`Hapus jabatan "${deleteJabatan?.nama_jabatan}"?`}
        loading={deleteJabatanMutation.isPending}
      />
    </div>
  );
};

export default OrganisasiPage;

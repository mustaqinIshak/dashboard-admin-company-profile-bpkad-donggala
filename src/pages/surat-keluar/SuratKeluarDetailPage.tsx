import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, FileText, Send, Archive, Edit } from 'lucide-react';
import { toast } from 'sonner';

import { suratKeluarApi } from '../../api';
import type { SuratKeluar } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../utils/cn';

import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-800' },
  menunggu_persetujuan: { label: 'Menunggu Persetujuan', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  disetujui: { label: 'Disetujui', bg: 'bg-green-100', text: 'text-green-800' },
  ditolak: { label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-800' },
  terkirim: { label: 'Terkirim', bg: 'bg-blue-100', text: 'text-blue-800' },
  arsip: { label: 'Arsip', bg: 'bg-gray-100', text: 'text-gray-800' },
};

const SuratKeluarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const suratId = Number(id);
  // Removed unused navigate
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  
  const isPimpinan = hasRole('pimpinan') || hasRole('super_admin');
  const isAdminAtauAdminSurat = hasRole('admin') || hasRole('super_admin');

  const [tolakModalOpen, setTolakModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');

  const [arsipModalOpen, setArsipModalOpen] = useState(false);
  const [fileTtd, setFileTtd] = useState<File | null>(null);
  const [nomorSuratFix, setNomorSuratFix] = useState('');

  // Fetch Data
  const { data: suratData, isLoading } = useQuery({
    queryKey: ['surat-keluar', suratId],
    queryFn: () => suratKeluarApi.getById(suratId).then(res => res.data.data as SuratKeluar),
  });

  const invalidateAndToast = (msg: string) => {
    queryClient.invalidateQueries({ queryKey: ['surat-keluar'] });
    toast.success(msg);
  };

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (payload: { status: string, alasan_penolakan?: string }) => 
      suratKeluarApi.updateStatus(suratId, payload),
    onSuccess: (_, variables) => {
      if (variables.status === 'ditolak') setTolakModalOpen(false);
      invalidateAndToast('Status surat berhasil diperbarui');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal mengubah status')
  });

  const arsipkanMutation = useMutation({
    mutationFn: (formData: FormData) => suratKeluarApi.update(suratId, formData), // Upload final signed file
    onSuccess: () => {
      // Then mark as sent/archived
      suratKeluarApi.updateStatus(suratId, { status: 'arsip' }).then(() => {
        setArsipModalOpen(false);
        invalidateAndToast('Surat berhasil diarsipkan dengan dokumen final');
      });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal mengarsipkan surat')
  });

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>;
  if (!suratData) return <div className="p-6 text-center text-gray-500">Surat tidak ditemukan</div>;

  const statConf = statusConfig[suratData.status] || statusConfig.draft;

  const handleTolak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanPenolakan.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }
    updateStatusMutation.mutate({ status: 'ditolak', alasan_penolakan: alasanPenolakan });
  };

  const handleArsipkan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSuratFix) {
      toast.error('Nomor surat wajib diisi sebelum diarsipkan');
      return;
    }
    if (!fileTtd) {
      toast.error('File dokumen final bercap/ttd wajib diunggah');
      return;
    }

    const fd = new FormData();
    fd.append('nomor_surat', nomorSuratFix);
    fd.append('status', 'arsip');
    fd.append('file_surat', fileTtd);

    arsipkanMutation.mutate(fd);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to="/surat-keluar" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Detail Surat Keluar
            <span className={cn('px-3 py-1 text-sm font-medium rounded-full', statConf.bg, statConf.text)}>
              {statConf.label}
            </span>
          </h1>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2">
          {suratData.status === 'draft' && isAdminAtauAdminSurat && (
            <>
              <Link to={`/surat-keluar/${suratData.id}/edit`}>
                <Button variant="outline" className="flex items-center gap-2"><Edit className="w-4 h-4" /> Edit Draft</Button>
              </Link>
              <Button 
                className="bg-blue-600 flex items-center gap-2"
                onClick={() => updateStatusMutation.mutate({ status: 'menunggu_persetujuan' })}
                isLoading={updateStatusMutation.isPending}
              >
                Ajukan ke Pimpinan
              </Button>
            </>
          )}

          {suratData.status === 'menunggu_persetujuan' && isPimpinan && (
            <>
              <Button 
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => setTolakModalOpen(true)}
              >
                <XCircle className="w-4 h-4" /> Tolak
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                onClick={() => updateStatusMutation.mutate({ status: 'disetujui' })}
                isLoading={updateStatusMutation.isPending}
              >
                <CheckCircle className="w-4 h-4" /> Setujui
              </Button>
            </>
          )}

          {suratData.status === 'ditolak' && isAdminAtauAdminSurat && (
            <Link to={`/surat-keluar/${suratData.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2"><Edit className="w-4 h-4" /> Revisi & Edit</Button>
            </Link>
          )}

          {suratData.status === 'disetujui' && isAdminAtauAdminSurat && (
            <>
              <Button 
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                onClick={() => updateStatusMutation.mutate({ status: 'terkirim' })}
                isLoading={updateStatusMutation.isPending}
              >
                <Send className="w-4 h-4" /> Tandai Terkirim
              </Button>
              <Button 
                className="bg-gray-800 hover:bg-gray-900 flex items-center gap-2"
                onClick={() => setArsipModalOpen(true)}
              >
                <Archive className="w-4 h-4" /> Finalisasi & Arsipkan
              </Button>
            </>
          )}

          {suratData.status === 'terkirim' && isAdminAtauAdminSurat && (
            <Button 
              className="bg-gray-800 hover:bg-gray-900 flex items-center gap-2"
              onClick={() => setArsipModalOpen(true)}
            >
              <Archive className="w-4 h-4" /> Finalisasi & Arsipkan
            </Button>
          )}
        </div>
      </div>

      {suratData.status === 'ditolak' && suratData.alasan_penolakan && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <h3 className="text-red-800 font-bold flex items-center gap-2"><XCircle className="w-5 h-5"/> Ditolak oleh Pimpinan</h3>
          <p className="text-red-700 mt-1 whitespace-pre-wrap">{suratData.alasan_penolakan}</p>
        </div>
      )}

      {suratData.status === 'disetujui' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
          <h3 className="text-green-800 font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Telah Disetujui Pimpinan</h3>
          <p className="text-green-700 mt-1">Silakan unduh dokumen, ambil nomor surat yang valid, mintakan tanda tangan pimpinan, kemudian arsipkan hasil scan final pada sistem.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Detail Surat Keluar</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Perihal / Ringkasan</label>
                <p className="mt-1 text-base text-gray-900 font-medium">{suratData.perihal}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tujuan</label>
                  <p className="font-medium text-gray-900">{suratData.tujuan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Instansi Tujuan</label>
                  <p className="font-medium text-gray-900">{suratData.instansi_tujuan}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Surat Asli</label>
                  <p className="font-mono text-blue-600 font-medium">{suratData.nomor_surat || '(Belum Diterbitkan)'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Surat</label>
                  <p className="font-medium text-gray-900">{suratData.tanggal_surat_keluar || '(Draft)'}</p>
                </div>
              </div>

              {suratData.keterangan && (
                <div className="pt-4 mt-2 border-t">
                  <label className="text-sm font-medium text-gray-500">Keterangan Tambahan Pembuat</label>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{suratData.keterangan}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">File Dokumen</h2>
            
            {suratData.file_url ? (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                <FileText className="w-12 h-12 text-blue-400 mb-3" />
                <p className="text-sm font-medium text-blue-900 text-center mb-4 truncate w-full px-2" title={suratData.file_url.split('/').pop()}>
                  Voume Dokumen Final
                </p>
                <a href={suratData.file_url} target="_blank" rel="noreferrer" className="w-full">
                  <Button variant="primary" className="w-full justify-center gap-2">
                    Unduh / Lihat Limit
                  </Button>
                </a>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                Belum ada file dokumen lampiran
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-sm text-gray-500 mb-2">Dibuat Oleh</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex justify-center items-center font-bold text-gray-600">
                {suratData.dibuatOleh?.name ? suratData.dibuatOleh.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{suratData.dibuatOleh?.name || 'Administrator'}</p>
                <p className="text-xs text-gray-500">{new Date(suratData.created_at || new Date()).toLocaleString('id-ID')}</p>
              </div>
            </div>

            {suratData.disetujuiOleh && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h2 className="text-sm text-gray-500 mb-2 line-clamp-1">Diperiksa/Disetujui Oleh</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex justify-center items-center font-bold text-green-700">
                    {suratData.disetujuiOleh.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{suratData.disetujuiOleh.name}</p>
                    <p className="text-xs text-green-600 font-medium">Validasi Sistem ✔</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tolak */}
      <Modal isOpen={tolakModalOpen} onClose={() => setTolakModalOpen(false)} title="Tolak Pengajuan Surat">
        <form onSubmit={handleTolak} className="space-y-4">
          <Textarea
            label="Alasan Penolakan"
            required
            rows={4}
            value={alasanPenolakan}
            onChange={(e) => setAlasanPenolakan(e.target.value)}
            placeholder="Jelaskan alasan mengapa surat ini ditolak atau butuh revisi..."
          />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setTolakModalOpen(false)}>Batal</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" isLoading={updateStatusMutation.isPending}>Tolak Surat</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Finalisasi / Arsip */}
      <Modal isOpen={arsipModalOpen} onClose={() => setArsipModalOpen(false)} title="Finalisasi & Arsipkan Surat">
        <form onSubmit={handleArsipkan} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Tahap ini menandakan surat telah dicetak, ditandatangani, dan diberikan stempel instansi.
          </p>

          <Input
            label="Nomor Surat Resmi"
            required
            value={nomorSuratFix}
            onChange={(e) => setNomorSuratFix(e.target.value)}
            placeholder="Contoh: 123/BPKAD/2026"
            defaultValue={suratData.nomor_surat || ''}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Scan Final (Bertanda tangan) <span className="text-red-500">*</span>
            </label>
            <input 
              type="file" 
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md p-2"
              accept=".pdf"
              onChange={(e) => e.target.files && setFileTtd(e.target.files[0])}
            />
            <p className="text-xs text-gray-500 mt-1">Gunakan format PDF (maks. 10MB) yang berisi scan dokumen fisik setelah di TTD.</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setArsipModalOpen(false)}>Batal</Button>
            <Button type="submit" className="bg-gray-800 hover:bg-gray-900" isLoading={arsipkanMutation.isPending}>Simpan Arsip Final</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuratKeluarDetailPage;

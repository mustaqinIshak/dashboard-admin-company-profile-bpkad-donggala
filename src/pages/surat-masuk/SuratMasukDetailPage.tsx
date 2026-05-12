import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, ExternalLink, Calendar, Building, User, Mail, MessageSquare, Reply } from 'lucide-react';
import { toast } from 'sonner';

import { suratMasukApi, disposisiApi, adminManagementApi } from '../../api';
import type { SuratMasuk, Disposisi } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../utils/cn';

// UI Components
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  baru: { label: 'Baru', bg: 'bg-blue-100', text: 'text-blue-800' },
  diproses: { label: 'Diproses', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  selesai: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-800' },
  arsip: { label: 'Arsip', bg: 'bg-gray-100', text: 'text-gray-800' },
};

const disposisiStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  belum_diproses: { label: 'Belum Diproses', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  sedang_diproses: { label: 'Sedang Diproses', bg: 'bg-blue-100', text: 'text-blue-800' },
  selesai: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-800' },
};

const SuratMasukDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const suratId = Number(id);
  const queryClient = useQueryClient();
  const { user, hasAnyRole } = useAuthStore();
  const canDisposisi = hasAnyRole(['pimpinan', 'super_admin', 'admin']);

  const [activeTab, setActiveTab] = useState<'info' | 'disposisi'>('info');
  
  // Modal states
  const [isDisposisiModalOpen, setIsDisposisiModalOpen] = useState(false);
  const [isBalasModalOpen, setIsBalasModalOpen] = useState(false);
  
  // Form states
  const [kepadaAdminId, setKepadaAdminId] = useState('');
  const [instruksi, setInstruksi] = useState('');
  
  const [selectedDisposisi, setSelectedDisposisi] = useState<Disposisi | null>(null);
  const [catatanBalasan, setCatatanBalasan] = useState('');

  // Fetch Data Surat
  const { data: suratData, isLoading: isLoadingSurat } = useQuery({
    queryKey: ['surat-masuk', suratId],
    queryFn: () => suratMasukApi.getById(suratId).then(res => res.data.data as SuratMasuk),
  });

  // Fetch Data Disposisi
  const { data: disposisiData, isLoading: isLoadingDisposisi } = useQuery({
    queryKey: ['disposisi', suratId],
    queryFn: () => disposisiApi.getAll(suratId).then(res => res.data.data as Disposisi[]),
    enabled: activeTab === 'disposisi' || !!suratData,
  });

  // Fetch List Admins for Disposisi (exclude self)
  const { data: adminsData } = useQuery({
    queryKey: ['admins-for-disposisi'],
    queryFn: () => adminManagementApi.getAll({ per_page: 100 }).then(res => res.data.data.data as any[]),
    enabled: isDisposisiModalOpen,
  });
  
  const admins = adminsData?.filter(a => a.id !== user?.id) || [];

  // Mutations
  const createDisposisiMutation = useMutation({
    mutationFn: () => disposisiApi.create(suratId, { 
      kepada_admin_id: Number(kepadaAdminId), 
      instruksi 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposisi', suratId] });
      queryClient.invalidateQueries({ queryKey: ['surat-masuk', suratId] });
      toast.success('Disposisi berhasil dibuat');
      setIsDisposisiModalOpen(false);
      setKepadaAdminId('');
      setInstruksi('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal membuat disposisi');
    },
  });

  const updateDisposisiStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      disposisiApi.updateStatus(suratId, id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposisi', suratId] });
      toast.success('Status disposisi diperbarui');
    },
  });

  const balasDisposisiMutation = useMutation({
    mutationFn: () => disposisiApi.balas(suratId, selectedDisposisi!.id, { catatan_balasan: catatanBalasan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposisi', suratId] });
      toast.success('Balasan disposisi dikirim');
      setIsBalasModalOpen(false);
      setCatatanBalasan('');
      setSelectedDisposisi(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal membalas disposisi');
    },
  });

  const updateSuratStatusMutation = useMutation({
    mutationFn: (status: string) => suratMasukApi.updateStatus(suratId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-masuk', suratId] });
      toast.success('Status surat masuk diperbarui');
    },
  });

  if (isLoadingSurat) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!suratData) {
    return <div className="p-6 text-center text-gray-500">Surat tidak ditemukan</div>;
  }

  const statConf = statusConfig[suratData.status] || statusConfig.baru;

  const handleCreateDisposisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kepadaAdminId || !instruksi) {
      toast.error('Penerima dan instruksi wajib diisi');
      return;
    }
    createDisposisiMutation.mutate();
  };

  const openBalasModal = (disposisi: Disposisi) => {
    setSelectedDisposisi(disposisi);
    setCatatanBalasan(disposisi.catatan_balasan || '');
    setIsBalasModalOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link to="/surat-masuk" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Detail Surat Masuk
            <span className={cn('px-3 py-1 text-sm font-medium rounded-full', statConf.bg, statConf.text)}>
              {statConf.label}
            </span>
          </h1>
        </div>
        
        <div className="flex gap-2">
          {(suratData.status === 'baru' || suratData.status === 'diproses') && (
            <Link to={`/surat-masuk/${suratData.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </Link>
          )}
          
          <div className="h-10 border-l border-gray-300 mx-1 hidden md:block"></div>

          {suratData.status !== 'selesai' && suratData.status !== 'arsip' && (
            <Button
              variant="outline"
              className="text-green-600 hover:bg-green-50 border-green-200"
              onClick={() => updateSuratStatusMutation.mutate('selesai')}
              isLoading={updateSuratStatusMutation.isPending}
            >
              Tandai Selesai
            </Button>
          )}
          
          {(suratData.status === 'selesai' || suratData.status === 'diproses') && (
            <Button
              variant="outline"
              className="text-gray-600 hover:bg-gray-100"
              onClick={() => updateSuratStatusMutation.mutate('arsip')}
              isLoading={updateSuratStatusMutation.isPending}
            >
              Arsipkan
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 font-medium text-sm">
        <button
          className={cn(
            'px-6 py-3 border-b-2 transition-colors',
            activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
          onClick={() => setActiveTab('info')}
        >
          Informasi Surat
        </button>
        <button
          className={cn(
            'px-6 py-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'disposisi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
          onClick={() => setActiveTab('disposisi')}
        >
          Disposisi 
          {disposisiData?.length ? (
            <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{disposisiData.length}</span>
          ) : null}
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Detail Informasi</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Perihal / Ringkasan</label>
                  <p className="mt-1 text-base text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                    {suratData.perihal}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4" /> Nomor Agenda
                    </label>
                    <p className="font-mono text-blue-600 font-medium">{suratData.no_agenda}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1">Nomor Surat Asli</label>
                    <p className="font-mono text-gray-900">{suratData.nomor_surat || '-'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" /> Pengirim
                    </label>
                    <p className="font-medium text-gray-900">{suratData.pengirim}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4" /> Instansi Pengirim
                    </label>
                    <p className="font-medium text-gray-900">{suratData.instansi_pengirim}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" /> Tanggal Surat
                    </label>
                    <p className="font-medium text-gray-900">{suratData.tanggal_surat}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-green-600" /> Diterima Tanggal
                    </label>
                    <p className="font-medium text-gray-900">{suratData.tanggal_terima}</p>
                  </div>
                </div>

                {suratData.catatan && (
                  <div className="pt-4 mt-2 border-t">
                    <label className="text-sm font-medium text-gray-500">Catatan Administratif</label>
                    <p className="mt-1 text-sm text-gray-700 italic border-l-4 border-yellow-400 pl-3 py-1">
                      {suratData.catatan}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">File Lampiran</h2>
              
              {suratData.file_url ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                  <ExternalLink className="w-12 h-12 text-blue-400 mb-3" />
                  <p className="text-sm font-medium text-blue-900 text-center mb-4">
                    Terdapat lampiran dokumen<br/>(PDF/DOCX)
                  </p>
                  <div className="flex gap-2 w-full">
                    <a href={suratData.file_url} target="_blank" rel="noreferrer" className="flex-1">
                      <Button variant="primary" className="w-full justify-center gap-2">
                        <ExternalLink className="w-4 h-4" /> Lihat
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                  Tidak ada dile lampiran
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-sm text-gray-500 mb-2">Pencatat</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex justify-center items-center font-bold text-blue-700">
                  {suratData.diterimaOleh?.name ? suratData.diterimaOleh.name.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{suratData.diterimaOleh?.name || 'Administrator'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'disposisi' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div>
              <h3 className="font-semibold text-blue-900">Alur Disposisi Surat</h3>
              <p className="text-sm text-blue-700">Teruskan tugas dan instruksi kepada pihak terkait.</p>
            </div>
            {canDisposisi && suratData.status !== 'arsip' && (
              <Button onClick={() => setIsDisposisiModalOpen(true)}>Buat Disposisi Baru</Button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingDisposisi ? (
              <div className="p-8 flex justify-center"><LoadingSpinner size="md" /></div>
            ) : disposisiData?.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">Belum ada disposisi</p>
                <p className="text-sm mt-1">Surat ini belum diteruskan ke siapapun.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {disposisiData?.map((disp) => {
                  const dispStatus = disposisiStatusConfig[disp.status];
                  const isMyDisposisi = disp.kepada_admin_id === user?.id;

                  return (
                    <div key={disp.id} className="p-6">
                      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex justify-center items-center text-gray-500 shrink-0">
                            {disp.dariAdmin?.name.substring(0, 1)}
                            <ArrowLeft className="w-3 h-3 mx-0.5 transform rotate-[135deg]" />
                            {disp.kepadaAdmin?.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center flex-wrap gap-2 text-sm md:text-base">
                              <span className="text-gray-600">Dari:</span> {disp.dariAdmin?.name}
                              <span className="text-gray-400 mx-1">→</span>
                              <span className="text-gray-600">Kepada:</span> 
                              <span className={isMyDisposisi ? 'font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded' : ''}>
                                {disp.kepadaAdmin?.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Waktu: {new Date(disp.tanggal_disposisi).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 md:items-center self-start md:self-auto">
                          <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full text-center', dispStatus.bg, dispStatus.text)}>
                            {dispStatus.label}
                          </span>
                          
                          {/* Owner actions (if the logged-in user is the receiver) */}
                          {isMyDisposisi && disp.status !== 'selesai' && (
                            <div className="flex gap-2">
                              {disp.status === 'belum_diproses' && (
                                <Button 
                                  size="sm" variant="outline" className="text-blue-600"
                                  onClick={() => updateDisposisiStatusMutation.mutate({ id: disp.id, status: 'sedang_diproses' })}
                                >
                                  Proses
                                </Button>
                              )}
                              <Button 
                                size="sm" variant="outline" className="text-green-600"
                                onClick={() => openBalasModal(disp)}
                              >
                                Selesaikan / Balas
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 ml-0 md:ml-14">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                          Instruksi / Pesan:
                        </label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{disp.instruksi}</p>
                      </div>

                      {disp.catatan_balasan && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 ml-0 md:ml-14 mt-3">
                          <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2 block flex items-center gap-1">
                            <Reply className="w-3 h-3" /> Balasan / Hasil:
                          </label>
                          <p className="text-sm text-blue-900 whitespace-pre-wrap">{disp.catatan_balasan}</p>
                          {disp.tanggal_selesai && (
                            <div className="text-xs text-blue-600 mt-2">
                              Selesai pada: {new Date(disp.tanggal_selesai).toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Disposisi */}
      <Modal 
        isOpen={isDisposisiModalOpen} 
        onClose={() => setIsDisposisiModalOpen(false)}
        title="Buat Disposisi Baru"
      >
        <form onSubmit={handleCreateDisposisi} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diteruskan Kepada <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={kepadaAdminId}
              onChange={(e) => setKepadaAdminId(e.target.value)}
            >
              <option value="" disabled>-- Pilih Penerima --</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} ({admin.roles?.map((r:any) => r.display_name).join(', ')})
                </option>
              ))}
            </select>
          </div>
          
          <Textarea
            label="Instruksi / Pesan"
            required
            rows={4}
            value={instruksi}
            onChange={(e) => setInstruksi(e.target.value)}
            placeholder="Tuliskan arahan tugas atau pesan spesifik untuk penerima..."
          />
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsDisposisiModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={createDisposisiMutation.isPending}>Kirim Disposisi</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Balas Disposisi */}
      <Modal 
        isOpen={isBalasModalOpen} 
        onClose={() => setIsBalasModalOpen(false)}
        title="Selesaikan & Balas Disposisi"
      >
        <form onSubmit={(e) => { e.preventDefault(); balasDisposisiMutation.mutate(); }} className="space-y-4">
          <p className="text-sm text-gray-500 mb-2">Tandai disposisi ini sebagai selesai dan tambahkan catatan hasil pelaksanaan tugas.</p>
          
          <Textarea
            label="Catatan Balasan / Laporan Hasil"
            required
            rows={4}
            value={catatanBalasan}
            onChange={(e) => setCatatanBalasan(e.target.value)}
            placeholder="Contoh: Sudah ditindaklanjuti dengan membalas surat tersebut..."
          />
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsBalasModalOpen(false)}>Batal</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" isLoading={balasDisposisiMutation.isPending}>
              Simpan & Selesaikan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuratMasukDetailPage;

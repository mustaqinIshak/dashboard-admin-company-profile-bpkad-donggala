import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { suratMasukApi } from '../../api';
import type { SuratMasuk } from '../../types';

// UI Components
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const SuratMasukFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nomor_surat: '',
    pengirim: '',
    instansi_pengirim: '',
    perihal: '',
    tanggal_surat: '',
    tanggal_terima: new Date().toISOString().split('T')[0], // Default today
    catatan: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  // Fetch data if edit mode
  const { isLoading: isFetching } = useQuery<{ data: SuratMasuk }>({
    queryKey: ['surat-masuk', id],
    queryFn: () => suratMasukApi.getById(Number(id)).then(res => res.data),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode) {
      // Accessing cached data after query finishes
      const cachedData = queryClient.getQueryData<{ data: SuratMasuk }>(['surat-masuk', id]);
      if (cachedData?.data) {
        const surat = cachedData.data;
        setFormData({
          nomor_surat: surat.nomor_surat || '',
          pengirim: surat.pengirim || '',
          instansi_pengirim: surat.instansi_pengirim || '',
          perihal: surat.perihal || '',
          tanggal_surat: surat.tanggal_surat || '',
          tanggal_terima: surat.tanggal_terima || '',
          catatan: surat.catatan || '',
        });
        if (surat.file_url) setExistingFileUrl(surat.file_url);
      }
    }
  }, [isEditMode, id, queryClient]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEditMode) {
        return suratMasukApi.update(Number(id), data);
      }
      return suratMasukApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-masuk'] });
      toast.success(isEditMode ? 'Surat Masuk berhasil diperbarui' : 'Surat Masuk berhasil ditambahkan');
      navigate('/surat-masuk');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menyimpan surat masuk');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Size check (e.g. 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal adalah 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && !file) {
      toast.error('Mohon unggah file surat');
      return;
    }

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      payload.append(key, formData[key as keyof typeof formData]);
    });

    if (file) {
      payload.append('file_surat', file);
    }
    // If edit mode and no new file, backend should keep the old one

    mutation.mutate(payload);
  };

  if (isFetching) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/surat-masuk" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Surat Masuk' : 'Tambah Surat Masuk'}
          </h1>
          <p className="text-gray-500">
            {isEditMode ? 'Perbarui informasi surat masuk' : 'Catat informasi surat masuk baru ke dalam sistem'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <Input
                label="Perihal / Ringkasan Surat"
                name="perihal"
                value={formData.perihal}
                onChange={handleInputChange}
                required
                placeholder="Contoh: Undangan Rapat Koordinasi..."
              />
            </div>

            <Input
              label="Nomor Surat"
              name="nomor_surat"
              value={formData.nomor_surat}
              onChange={handleInputChange}
              placeholder="Nomor surat (jika ada)"
            />

            <Input
              label="Tanggal Surat"
              name="tanggal_surat"
              type="date"
              value={formData.tanggal_surat}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Pengirim (Nama/Jabatan)"
              name="pengirim"
              value={formData.pengirim}
              onChange={handleInputChange}
              required
              placeholder="Bupati Donggala / Kepala Dinas..."
            />

            <Input
              label="Instansi Pengirim"
              name="instansi_pengirim"
              value={formData.instansi_pengirim}
              onChange={handleInputChange}
              required
              placeholder="Sekretariat Daerah Kab. Donggala..."
            />

            <Input
              label="Tanggal Surat Diterima"
              name="tanggal_terima"
              type="date"
              value={formData.tanggal_terima}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Surat (PDF/DOC/DOCX, Maks 10MB) {isEditMode ? '' : <span className="text-red-500">*</span>}
              </label>
              
              {!file && existingFileUrl && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-between">
                  <div className="flex items-center text-sm text-blue-800">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>File saat ini telah tersimpan (Biarkan kosong jika tidak ingin mengubah)</span>
                  </div>
                  <a href={existingFileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                    Lihat File
                  </a>
                </div>
              )}

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Pilih file</span> atau tarik dan lepas file di sini
                    </p>
                    <p className="text-xs text-gray-500">{file ? file.name : 'Belum ada file terpilih'}</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            
            <Textarea
              label="Catatan Tambahan (Opsional)"
              name="catatan"
              value={formData.catatan}
              onChange={handleInputChange}
              rows={3}
              placeholder="Masukkan catatan spesifik mengenai surat ini jika ada..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/surat-masuk')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={mutation.isPending}
              icon={<Save className="w-4 h-4" />}
            >
              Simpan Surat Masuk
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuratMasukFormPage;

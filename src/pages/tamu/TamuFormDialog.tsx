import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tamuApi } from '../../api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'sonner';

interface TamuFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TamuFormDialog: React.FC<TamuFormDialogProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nama: '',
    instansi_asal: '',
    no_identitas: '',
    jenis_identitas: 'ktp',
    keperluan: '',
    nama_yang_dituju: '',
    jabatan_yang_dituju: '',
  });
  const [foto, setFoto] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (data: FormData) => tamuApi.register(data),
    onSuccess: (res: any) => {
      const antrian = res.data?.data?.nomor_antrian || res.data?.nomor_antrian;
      toast.success(`Tamu berhasil didaftarkan. Nomor Antrian: ${antrian}`);
      queryClient.invalidateQueries({ queryKey: ['tamu'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mendaftar tamu');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFoto(e.target.files[0]);
    }
  };

  const handleClose = () => {
    setFormData({
      nama: '',
      instansi_asal: '',
      no_identitas: '',
      jenis_identitas: 'ktp',
      keperluan: '',
      nama_yang_dituju: '',
      jabatan_yang_dituju: '',
    });
    setFoto(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.keperluan || !formData.nama_yang_dituju) {
      toast.error('Mohon lengkapi field wajib');
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });
    if (foto) {
      payload.append('foto', foto);
    }

    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Daftarkan Tamu Baru" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
            <Input name="nama" value={formData.nama} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instansi Asal</label>
            <Input name="instansi_asal" value={formData.instansi_asal} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Identitas</label>
            <select
              name="jenis_identitas"
              value={formData.jenis_identitas}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ktp">KTP</option>
              <option value="sim">SIM</option>
              <option value="paspor">Paspor</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Identitas</label>
            <Input name="no_identitas" value={formData.no_identitas} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Keperluan <span className="text-red-500">*</span></label>
            <textarea
              name="keperluan"
              value={formData.keperluan}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Yang Dituju <span className="text-red-500">*</span></label>
            <Input name="nama_yang_dituju" value={formData.nama_yang_dituju} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Yang Dituju</label>
            <Input name="jabatan_yang_dituju" value={formData.jabatan_yang_dituju} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Tamu (Opsional, Maks 2MB)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" type="button" onClick={handleClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" loading={mutation.isPending}>
            Daftarkan Tamu
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TamuFormDialog;


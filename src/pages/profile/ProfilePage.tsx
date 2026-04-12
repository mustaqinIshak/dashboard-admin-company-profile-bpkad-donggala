import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { profileApi } from '../../api';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ImageUpload from '../../components/ui/ImageUpload';
import { getImageUrl, getValidationErrors } from '../../utils';

const schema = z.object({
  nama: z.string().min(1, 'Nama instansi wajib diisi'),
  singkatan: z.string().optional(),
  visi: z.string().optional(),
  misi: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  website: z.string().optional(),
  deskripsi: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
  });

  const profile = data?.data?.data || data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        nama: profile.nama || '',
        singkatan: profile.singkatan || '',
        visi: profile.visi || '',
        misi: profile.misi || '',
        alamat: profile.alamat || '',
        telepon: profile.telepon || '',
        email: profile.email || '',
        website: profile.website || '',
        deskripsi: profile.deskripsi || '',
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== '') fd.append(key, val);
      });
      if (logoFile) fd.append('logo', logoFile);
      return profileApi.update(fd);
    },
    onSuccess: () => {
      toast.success('Profil instansi berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      const messages = getValidationErrors(error);
      messages.forEach((m) => toast.error(m));
    },
  });

  if (isLoading) return <LoadingSpinner text="Memuat profil..." />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-1">Informasi Instansi</h3>
        <p className="text-sm text-gray-500 mb-6">
          Kelola informasi dasar BPKAD Donggala yang ditampilkan di website
        </p>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          {/* Logo */}
          <ImageUpload
            label="Logo Instansi"
            currentImage={getImageUrl(profile?.logo) || undefined}
            onChange={setLogoFile}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Instansi"
              required
              placeholder="Badan Pengelolaan Keuangan..."
              error={errors.nama?.message}
              {...register('nama')}
            />
            <Input
              label="Singkatan"
              placeholder="BPKAD"
              error={errors.singkatan?.message}
              {...register('singkatan')}
            />
          </div>

          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi singkat instansi..."
            rows={3}
            {...register('deskripsi')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Visi"
              placeholder="Visi instansi..."
              rows={4}
              {...register('visi')}
            />
            <Textarea
              label="Misi"
              placeholder="Misi instansi..."
              rows={4}
              {...register('misi')}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Informasi Kontak
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Alamat"
                placeholder="Jl. ..."
                rows={2}
                {...register('alamat')}
              />
              <div className="space-y-4">
                <Input
                  label="Telepon"
                  placeholder="(0457) 123456"
                  {...register('telepon')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="bpkad@donggala.go.id"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>
            <Input
              label="Website"
              placeholder="https://bpkad.donggalakab.go.id"
              className="mt-4"
              {...register('website')}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isSubmitting || mutation.isPending}
              icon={<Save className="h-4 w-4" />}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

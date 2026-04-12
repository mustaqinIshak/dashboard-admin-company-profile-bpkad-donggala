import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import { getValidationErrors } from '../../utils';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Password lama wajib diisi'),
    new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
    new_password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Konfirmasi password tidak sesuai',
    path: ['new_password_confirmation'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const AkunPage: React.FC = () => {
  const { user } = useAuthStore();
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      await authApi.changePassword(data);
      toast.success('Password berhasil diubah');
      reset();
    } catch (error) {
      const messages = getValidationErrors(error);
      messages.forEach((m) => toast.error(m));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Info */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{user?.name}</h3>
            <p className="text-gray-500">{user?.email}</p>
            <span className="badge badge-blue mt-1">{user?.role}</span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Nama</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Role</p>
              <p className="font-medium text-gray-800 capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">ID Admin</p>
              <p className="font-medium text-gray-800">#{user?.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Ubah Password</h3>
            <p className="text-sm text-gray-500">
              Pastikan menggunakan password yang kuat dan unik
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="Password Lama"
              type={showCurrentPass ? 'text' : 'password'}
              required
              error={errors.current_password?.message}
              {...register('current_password')}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass(!showCurrentPass)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPass ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Password Baru"
              type={showNewPass ? 'text' : 'password'}
              required
              error={errors.new_password?.message}
              helperText="Minimal 8 karakter"
              {...register('new_password')}
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showNewPass ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Konfirmasi Password Baru"
              type={showConfirmPass ? 'text' : 'password'}
              required
              error={errors.new_password_confirmation?.message}
              {...register('new_password_confirmation')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPass ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={isSubmitting}
              icon={<Lock className="h-4 w-4" />}
            >
              Ubah Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AkunPage;

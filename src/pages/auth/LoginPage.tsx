import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import { extractApiData } from '../../utils';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const loginData = extractApiData(res);
      const token = loginData?.token;
      // Backend returns 'admin' key, not 'user'
      const user = loginData?.admin || loginData?.user;
      if (!token || !user) {
        toast.error('Login gagal: respons tidak valid');
        return;
      }
      setAuth(token, user);
      toast.success(`Selamat datang, ${user.name}!`);
      navigate('/');
    } catch (error: unknown) {
      if (useAuthStore.getState().isAuthenticated) return;
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || 'Login gagal, cek email & password';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">BPKAD Donggala</h1>
            <p className="text-blue-200 text-sm mt-1">Panel Admin</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Masuk ke Dashboard
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@bpkad.go.id"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Mail className="absolute right-3 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={isSubmitting}
              >
                {isSubmitting ? 'Sedang masuk...' : 'Masuk'}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-blue-200 text-sm mt-6">
          © 2024 Badan Pengelolaan Keuangan dan Aset Daerah Donggala
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

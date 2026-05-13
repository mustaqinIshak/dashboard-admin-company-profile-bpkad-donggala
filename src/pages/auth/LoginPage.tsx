import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { authApi } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import { extractApiData } from '../../utils';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Rate limiting state (in-memory only — not persisted to localStorage)
  const attemptCount = useRef(0);
  const lockUntil = useRef<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Countdown timer when locked out
  useEffect(() => {
    if (!lockUntil.current) return;
    const tick = () => {
      const remaining = Math.ceil(((lockUntil.current ?? 0) - Date.now()) / 1000);
      if (remaining <= 0) {
        lockUntil.current = null;
        attemptCount.current = 0;
        setRemainingSeconds(0);
      } else {
        setRemainingSeconds(remaining);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [remainingSeconds]);

  const isLockedOut = remainingSeconds > 0;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
    // Check lockout before making any request
    if (lockUntil.current && Date.now() < lockUntil.current) {
      const secs = Math.ceil((lockUntil.current - Date.now()) / 1000);
      setRemainingSeconds(secs);
      toast.error(`Terlalu banyak percobaan. Coba lagi dalam ${formatCountdown(secs)}`);
      return;
    }

    try {
      const res = await authApi.login(data);
      const loginData = extractApiData(res);
      // Backend returns 'admin' key, not 'user'
      const user = loginData?.admin || loginData?.user;
      if (!user) {
        toast.error('Login gagal: respons tidak valid');
        return;
      }
      // Reset rate limit on successful login
      attemptCount.current = 0;
      lockUntil.current = null;
      setRemainingSeconds(0);
      setAuth(user);
      toast.success(`Selamat datang, ${user.name}!`);
      navigate('/');
    } catch (error: unknown) {
      if (useAuthStore.getState().isAuthenticated) return;

      // Increment attempt counter
      attemptCount.current += 1;
      if (attemptCount.current >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        lockUntil.current = until;
        setRemainingSeconds(Math.ceil(LOCKOUT_MS / 1000));
        toast.error(`Akun dikunci sementara selama 15 menit karena terlalu banyak percobaan login.`);
      } else {
        const remaining = MAX_ATTEMPTS - attemptCount.current;
        const err = error as { response?: { data?: { message?: string } } };
        const msg = err.response?.data?.message || 'Login gagal, cek email & password';
        toast.error(`${msg} (${remaining} percobaan tersisa)`);
      }
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

            {/* Lockout banner */}
            {isLockedOut && (
              <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Terlalu banyak percobaan login. Coba lagi dalam{' '}
                  <span className="font-mono font-semibold">{formatCountdown(remainingSeconds)}</span>.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@bpkad.go.id"
                  error={errors.email?.message}
                  disabled={isLockedOut}
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
                  disabled={isLockedOut}
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
                disabled={isLockedOut}
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

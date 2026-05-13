import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  // withCredentials ensures the browser sends the httpOnly session cookie
  // on every request — required for cookie-based authentication.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Terjadi kesalahan';

    if (error.response?.status === 401) {
      // Auto-logout when token is expired/invalid — but NOT on login attempts
      // (wrong password also returns 401 and shouldn't trigger a logout).
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        useAuthStore.getState().clearAuth();
        window.location.replace('/login');
      }
    } else if (error.response?.status === 403) {
      toast.error('Anda tidak memiliki akses ke halaman ini');
    } else if (error.response?.status === 422) {
      // Validation errors - let caller handle
    } else if (error.response?.status >= 500) {
      toast.error('Server error: ' + message);
    }

    return Promise.reject(error);
  }
);

export default api;

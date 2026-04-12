import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    // Don't attach token to login requests — old/expired tokens can cause 401
    if (config.url?.includes('/auth/login')) return config;

    const token = useAuthStore.getState().token || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Terjadi kesalahan';

    if (error.response?.status === 401) {
      // Do NOT auto-logout on 401.
      // User stays logged in until they manually logout or token expires.
      // Let the caller (React Query / component) handle the error.
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

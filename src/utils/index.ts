export { default as cn } from './cn';

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/${path}`;
};

export const truncate = (str: string, n: number) => {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '...' : str;
};

export const getValidationErrors = (error: unknown): string[] => {
  const axiosError = error as {
    response?: { data?: { errors?: Record<string, string[]>; message?: string } };
  };
  if (axiosError?.response?.data?.errors) {
    return Object.values(axiosError.response.data.errors).flat();
  }
  if (axiosError?.response?.data?.message) {
    return [axiosError.response.data.message];
  }
  return ['Terjadi kesalahan'];
};

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

/**
 * Extract the actual payload from an API response.
 * Handles both `$this->success()` wrapper `{ data: payload }` and direct responses.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractApiData = (response: any) => {
  const body = response?.data; // axios response.data = JSON body
  // If wrapped: { success, data, message } → return body.data
  // If direct: body is the payload itself
  if (body && typeof body === 'object' && 'data' in body && !Array.isArray(body)) {
    return body.data;
  }
  return body;
};

/**
 * Extract items array from API response (handles paginated and non-paginated).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractItems = <T = any>(response: any): T[] => {
  const payload = extractApiData(response);
  // Paginated: payload = { current_page, data: [...], last_page, total }
  if (payload && typeof payload === 'object' && 'data' in payload && 'current_page' in payload) {
    return Array.isArray(payload.data) ? payload.data : [];
  }
  // Non-paginated: payload is the array directly
  if (Array.isArray(payload)) return payload;
  return [];
};

/**
 * Extract pagination metadata from API response.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractPagination = (response: any) => {
  const payload = extractApiData(response);
  return {
    lastPage: payload?.last_page || 1,
    total: payload?.total || 0,
  };
};

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wye_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const normalized = {
      success: false,
      status: err.response?.status || 0,
      code: err.response?.data?.error?.code || 'NETWORK_ERROR',
      message: err.response?.data?.error?.message || err.message || 'Network error',
      details: err.response?.data?.error?.details,
    };
    if (normalized.status === 401) {
      localStorage.removeItem('wye_token');
      localStorage.removeItem('wye_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(normalized);
  }
);

export default api;

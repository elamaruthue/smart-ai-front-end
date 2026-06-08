import axios from 'axios';

// VITE_API_BASE_URL – set in .env.local
// Dev:  leave empty → Vite proxy forwards /api/* to the backend
// Prod: set to full URL including /api, e.g. https://api.smartprep.ai/api
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartprep_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear stale token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      localStorage.removeItem('smartprep_token');
    }
    return Promise.reject(err);
  }
);

export default api;

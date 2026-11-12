import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // Avoid redirect loop on login page
      const isLogin = err.config?.url?.includes('/auth/login');
      if (!isLogin) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
      }
    }
    return Promise.reject(err);
  }
);

export default api;

import axios from 'axios';

const resolveBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return '/api';
  return url.replace(/\/+$/, ''); // Strip trailing slashes
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('mediflow_token')) {
        localStorage.removeItem('mediflow_token');
        localStorage.removeItem('mediflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

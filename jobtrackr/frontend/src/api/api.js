// ONE place for all communication with the Django backend.
// Components never call axios directly; they use the functions exported below.
import axios from 'axios';
import { clearAuth, getAccessToken, getRefreshToken, setAccessToken } from '../utils/auth';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// A reusable axios instance with the base URL already set
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// 1) REQUEST interceptor: attach "Authorization: Bearer <token>" to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2) RESPONSE interceptor: if the access token expired (401), silently get a new one
//    with the refresh token and repeat the request. If that fails, log the user out.
const PUBLIC_PATHS = ['/login/', '/register/', '/logout/', '/token/refresh/'];
let refreshPromise = null; // shared so parallel requests only refresh once

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isPublic = PUBLIC_PATHS.some((path) => original?.url?.includes(path));

    if (error.response?.status === 401 && original && !original._retry && !isPublic) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${BASE_URL}/token/refresh/`, { refresh })
              .finally(() => { refreshPromise = null; });
          }
          const { data } = await refreshPromise;
          setAccessToken(data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original); // retry the original request
        } catch {
          // refresh token is invalid/expired -> fall through to logout
        }
      }
      clearAuth();
      window.dispatchEvent(new Event('auth:logout')); // AuthContext listens for this
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Error helpers: turn axios errors into messages a user can understand
// ---------------------------------------------------------------------------
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error.response) return 'Cannot reach the server. Check that the backend is running.';
  const { status, data } = error.response;
  if (status >= 500) return 'Something went wrong on the server. Please try again later.';
  if (status === 404) return data?.detail || 'The requested item was not found.';
  if (status === 401) return data?.detail || 'Your session has expired. Please log in again.';
  if (data?.detail) return data.detail;
  if (data?.non_field_errors) return [].concat(data.non_field_errors).join(' ');
  return fallback;
};

// DRF validation errors look like {"username": ["A user with that username already exists."]}
// -> {"username": "A user with that username already exists."}
export const getFieldErrors = (error) => {
  const data = error.response?.data;
  if (error.response?.status !== 400 || !data || typeof data !== 'object') return {};
  const result = {};
  Object.entries(data).forEach(([field, messages]) => {
    if (field !== 'detail' && field !== 'non_field_errors') {
      result[field] = [].concat(messages).join(' ');
    }
  });
  return result;
};

// ---------------------------------------------------------------------------
// API functions, grouped by feature
// ---------------------------------------------------------------------------
export const authAPI = {
  register: (data) => api.post('/register/', data),
  login: (data) => api.post('/login/', data),
  logout: (refresh) => api.post('/logout/', { refresh }),
};

export const applicationsAPI = {
  list: (params) => api.get('/applications/', { params }),
  get: (id) => api.get(`/applications/${id}/`),
  create: (data) => api.post('/applications/', data),
  update: (id, data) => api.put(`/applications/${id}/`, data),
  patch: (id, data) => api.patch(`/applications/${id}/`, data),
  remove: (id) => api.delete(`/applications/${id}/`),
};

export const dashboardAPI = { get: () => api.get('/dashboard/') };
export const remindersAPI = { get: () => api.get('/reminders/') };

export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
};

export default api;

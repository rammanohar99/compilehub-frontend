import axios from 'axios';
import toast from 'react-hot-toast';
import { getAccessToken } from '../services/tokenManager';
import { useAuthStore } from '../store/authStore';
import { refreshWithLock } from '../services/authRefresh';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEV_AUTH_LOGS = import.meta.env.DEV && import.meta.env.VITE_AUTH_DEBUG === 'true';
let lastSessionExpiryHandledAt = 0;

function log(event: string): void {
  if (DEV_AUTH_LOGS) {
    console.debug(`[auth] ${event}`);
  }
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/signup') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

function handleSessionExpiredOnce(): void {
  const now = Date.now();
  if (now - lastSessionExpiryHandledAt < 1500) return;
  lastSessionExpiryHandledAt = now;

  useAuthStore.getState().clearAuth();
  toast.error('Session expired, please login again');

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const url: string = error.config?.url ?? '';
    const status = error.response?.status;
    const originalRequest = error.config as { _retry?: boolean; headers?: Record<string, string> } | undefined;

    if (status === 401 && !isAuthEndpoint(url) && originalRequest && !originalRequest._retry) {
      log(`401 retry path for ${url}`);
      originalRequest._retry = true;

      const refreshed = await refreshWithLock('interceptor');
      if (refreshed?.accessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        log(`retrying request for ${url}`);
        return api(originalRequest);
      }

      handleSessionExpiredOnce();
    }

    return Promise.reject(error);
  }
);

export default api;

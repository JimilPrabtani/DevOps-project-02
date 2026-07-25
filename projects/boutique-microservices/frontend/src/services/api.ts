import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

// Relative by default so the browser talks to the same origin nginx serves,
// which proxies /api to the gateway. That keeps cookies same-site and means
// no CORS preflight in production.
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // Required so the browser sends the httpOnly refresh cookie.
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Refresh handling
//
// A single in-flight refresh is shared by every request that gets a 401, so a
// page issuing five parallel calls performs ONE refresh rather than five
// competing ones. With rotation enabled server-side, concurrent refreshes
// would invalidate each other and log the user out.
// ---------------------------------------------------------------------------
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 15000 }
      )
      .then((response) => {
        const token: string | null = response.data?.token ?? null;
        tokenStore.set(token);
        return token;
      })
      .catch(() => {
        tokenStore.clear();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      // Never try to refresh a failed refresh — that is an infinite loop.
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      const token = await refreshAccessToken();
      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }

      // Refresh failed: the session is genuinely over. Redirecting is left to
      // the auth context rather than hard-navigating from inside an
      // interceptor, so React state stays consistent.
      tokenStore.clear();
    }

    return Promise.reject(error);
  }
);

export { refreshAccessToken };
export default apiClient;

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Storage from './storage';

// ─── Configuration ───────────────────────────────────────
const API_BASE_URL = 'https://medlinkethiopia.pythonanywhere.com/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'medlink_access_token',
  REFRESH_TOKEN: 'medlink_refresh_token',
  USER: 'medlink_user',
} as const;

// ─── Axios Instance ──────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Refresh Token Mutex ─────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

// ─── Request Interceptor: Attach Token & Log ──────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(`[API REQUEST] => ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    // Log payload for debugging (skip FormData — JSON.stringify corrupts it)
    if (config.data && !(config.data instanceof FormData)) {
      const sanitizedData = { ...config.data };
      if (sanitizedData.password) sanitizedData.password = '***';
      console.log(`[API PAYLOAD] =>`, JSON.stringify(sanitizedData, null, 2));
    }

    // Do not attach the Authorization header to public authentication/registration endpoints
    const isPublicAuthEndpoint = config.url && (
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/register') ||
      config.url.includes('/auth/token/refresh') ||
      config.url.includes('/auth/verify-email') ||
      config.url.includes('/auth/forgot-password') ||
      config.url.includes('/auth/reset-password') ||
      config.url.includes('/auth/resend-otp')
    );

    const token = await Storage.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers && !isPublicAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR] =>', error);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor: Handle 401 + Refresh ──────────
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] => ${response.config.method?.toUpperCase()} ${response.config.url} [${response.status}]`);
    if (response.config.url?.includes('login')) {
      console.log(`[API LOGIN RESPONSE PAYLOAD] =>`, JSON.stringify(response.data, null, 2));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) {
      console.warn('[API NETWORK ERROR] => Check network or backend status:', error.message);
    } else if (error.response.status >= 500) {
      console.error(`[API SERVER ERROR] => ${error.response.status} on ${originalRequest?.url}`);
    } else {
      console.warn(`[API FAILED] => ${error.response.status} on ${originalRequest?.url}`);
    }

    // Only attempt refresh for 401 errors on non-auth endpoints
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/token/refresh')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue requests while refresh is in progress
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await Storage.getItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!refreshToken) {
        console.warn('[API] No refresh token available. User needs to re-authenticate.');
        processQueue(new Error('No refresh token'), null);
        await Storage.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await Storage.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        await Storage.deleteItemAsync(STORAGE_KEYS.USER);
        isRefreshing = false;
        return Promise.reject(error);
      }

      console.log('[API] Attempting token refresh...');
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken: string = data.access;
      await Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      console.log('[API] Token refresh successful. Retrying original request.');
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.warn('[API] Token refresh failed:', refreshError instanceof Error ? refreshError.message : refreshError);
      processQueue(refreshError, null);

      // Clear stored tokens on refresh failure
      await Storage.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await Storage.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await Storage.deleteItemAsync(STORAGE_KEYS.USER);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;

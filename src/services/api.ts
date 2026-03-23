import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

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

    // Log payload for debugging (except passwords)
    if (config.data) {
      const sanitizedData = { ...config.data };
      if (sanitizedData.password) sanitizedData.password = '***';
      console.log(`[API PAYLOAD] =>`, JSON.stringify(sanitizedData, null, 2));
    }

    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
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

    // Suppress expected 401s from the refresh endpoint so they don't pollute the console
    const isRefreshError = originalRequest?.url?.includes('/auth/token/refresh') && error.response?.status === 401;

    if (!isRefreshError) {
      // Detailed error logging
      console.error(`[API ERROR] => ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
      if (error.response) {
        // The request was made and the server responded with a status code outside 2xx
        console.error(`[API ERROR STATUS] => ${error.response.status}`);
        console.error(`[API ERROR DATA] =>`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // The request was made but no response was received (Network Error)
        console.error(`[API NETWORK ERROR] => The request was made but no response was received. Is the backend running and accessible?`);
        console.error(`[API ERROR MESSAGE] =>`, error.message);
      } else {
        // Something happened in setting up the request
        console.error(`[API AXIOS CONFIG ERROR] =>`, error.message);
      }
    } else {
      console.warn(`[API] Token refresh rejected (typically expired or blacklisted token). Logging out...`);
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
      const refreshToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('[API] Attempting token refresh...');
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken: string = data.access;
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      console.log('[API] Token refresh successful. Retrying original request.');
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.error('[API] Token refresh failed:', refreshError);
      processQueue(refreshError, null);

      // Clear stored tokens on refresh failure
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

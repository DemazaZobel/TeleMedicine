// src/services/api.ts
import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://medlinkethiopia.pythonanywhere.com/api";

// Extend the Axios config to include our custom _retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Auto-refresh token on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (refreshToken) {
          const res = await axios.post<{ access: string }>(
            `${BASE_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          // Save new access token
          await SecureStore.setItemAsync("accessToken", res.data.access);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired - force logout
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        // If using Zustand, you would ideally call a logout action here or trigger a navigation reset
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// src/store/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";
import { User, LoginResponse } from "../types/auth";
import { AxiosError } from "axios";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<LoginResponse>("/auth/login/", {
        email,
        password,
      });
      const { access, refresh, user } = response.data;

      await SecureStore.setItemAsync("accessToken", access);
      await SecureStore.setItemAsync("refreshToken", refresh);

      set({ user, isLoading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      set({
        error: axiosError.response?.data?.detail || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({ user: null });
  },

  setUser: (user: User) => set({ user }),
}));

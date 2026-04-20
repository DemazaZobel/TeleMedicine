import axios from "axios";
import { create } from "zustand";
import api from "../services/api";
import { clearTokens, getRefresh, saveTokens } from "../services/tokenStorage";

const BASE_URL = "https://medlinkethiopia.pythonanywhere.com/api";

interface AuthState {
  user: any;
  loading: boolean;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  bootstrap: async () => {
    try {
      const refresh = await getRefresh();

      if (!refresh) {
        set({ loading: false });
        return;
      }

      // Use raw axios (bypass interceptor) so a 400 from an invalid
      // refresh token doesn't surface as an unhandled rejection.
      const refreshRes = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
        refresh,
      });

      await saveTokens(refreshRes.data.access, refresh);

      const profile = await api.get("/auth/me/");

      set({
        user: profile.data,
        loading: false,
      });
    } catch (e) {
      await clearTokens().catch(() => {});

      set({
        user: null,
        loading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/login/", {
        email,
        password,
      });

      await saveTokens(res.data.access, res.data.refresh);

      set({
        user: res.data.user,
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    const refresh = await getRefresh();

    try {
      await api.post("/auth/logout/", { refresh });
    } catch {}

    await clearTokens();

    set({
      user: null,
    });
  },
}));

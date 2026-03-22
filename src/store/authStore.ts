import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User, AuthTokens, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../features/auth/services/authService';
import { STORAGE_KEYS } from '../services/api';

// ─── State Shape ─────────────────────────────────────────
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
}

// ─── Actions ─────────────────────────────────────────────
interface AuthActions {
  bootstrap: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Initial State ───────────────────────────────────────
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,
  error: null,
};

// ─── Store ───────────────────────────────────────────────
export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  /**
   * Bootstrap: hydrate auth state from SecureStore on app launch.
   *
   * Strategy (no /auth/me/ endpoint available):
   *  1. Read refresh token from SecureStore
   *  2. Attempt token refresh → validates session is still alive
   *  3. If refresh succeeds → restore persisted user snapshot
   *  4. If refresh fails → session expired → force logout
   *
   * The user object is the snapshot persisted at login time.
   * It is NOT re-fetched from the server because /auth/me/ does not exist.
   */
  bootstrap: async () => {
    try {
      set({ isBootstrapping: true });

      const [refreshTokenValue, userJson] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
      ]);

      // No stored session → stay logged out
      if (!refreshTokenValue || !userJson) {
        set({ isBootstrapping: false });
        return;
      }

      // Validate session by attempting token refresh
      try {
        const response = await authService.refreshToken(refreshTokenValue);
        const newAccessToken = response.access;

        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        const user: User = JSON.parse(userJson);

        set({
          user,
          tokens: { access: newAccessToken, refresh: refreshTokenValue },
          isAuthenticated: true,
          isBootstrapping: false,
        });
      } catch {
        // Token refresh failed → session expired → clean up
        await Promise.all([
          SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
          SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
          SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
        ]);
        set({ ...initialState, isBootstrapping: false });
      }
    } catch {
      // SecureStore read failed → start fresh
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
      ]).catch(() => {});
      set({ ...initialState, isBootstrapping: false });
    }
  },

  /**
   * Login: authenticate and persist tokens + user snapshot.
   *
   * Backend contract:
   *  - Email must be verified before tokens are issued.
   *  - Doctors must also be admin-approved before tokens are issued.
   *  - Response includes user object + JWT tokens.
   */
  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login(credentials);

      // Persist tokens + user snapshot to SecureStore
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refresh),
        SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(response.user)),
      ]);

      set({
        user: response.user,
        tokens: { access: response.access, refresh: response.refresh },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      let message = 'Login failed. Please try again.';
      if (error?.response?.data) {
        // Extract exact backend error if available (e.g. { detail: '...' } or { non_field_errors: [...] })
        const data = error.response.data;
        message = data.detail || data.non_field_errors?.[0] || data.message || JSON.stringify(data);
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Register: create account.
   * User must verify email before they can login.
   * Doctors additionally need admin approval.
   */
  register: async (payload: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authService.register(payload);
      set({ isLoading: false });
    } catch (error: any) {
      let message = 'Registration failed. Please try again.';
      if (error?.response?.data) {
        const data = error.response.data;
        message = data.detail || data.email?.[0] || data.message || JSON.stringify(data);
      } else if (error instanceof Error) {
        message = error.message;
      }

      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Logout: send refresh token to backend for blacklisting, then clear local state.
   */
  logout: async () => {
    try {
      const { tokens } = get();
      if (tokens?.refresh) {
        await authService.logout(tokens.refresh).catch(() => {
          // Silently fail — we still want to clear local state
        });
      }
    } finally {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
      ]);
      set({ ...initialState, isBootstrapping: false });
    }
  },

  /**
   * Refresh Token: get new access token using refresh token.
   * Does NOT attempt to refetch user profile (no /auth/me/ endpoint).
   */
  refreshToken: async () => {
    try {
      const { tokens } = get();
      if (!tokens?.refresh) throw new Error('No refresh token');

      const response = await authService.refreshToken(tokens.refresh);

      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access);

      set({
        tokens: { ...tokens, access: response.access },
      });
    } catch {
      // If refresh fails, force logout
      await get().logout();
    }
  },

  /**
   * Update the local user snapshot (also persists to SecureStore).
   */
  setUser: (user: User) => {
    set({ user });
    SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearError: () => set({ error: null }),
}));

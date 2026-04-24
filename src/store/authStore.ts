import { create } from 'zustand';
import * as Storage from '../services/storage';
import type {
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';
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
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
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
   * Strategy (now uses /auth/profile/):
   *  1. Read refresh token from SecureStore
   *  2. Attempt token refresh → validates session is still alive
   *  3. If refresh succeeds → fetch live profile from /auth/profile/
   *  4. If refresh fails → session expired → force logout
   */
  bootstrap: async () => {
    try {
      set({ isBootstrapping: true });

      const refreshTokenValue = await Storage.getItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      // No stored session → stay logged out
      if (!refreshTokenValue) {
        set({ isBootstrapping: false });
        return;
      }

      // Validate session by attempting token refresh
      try {
        const response = await authService.refreshToken(refreshTokenValue);
        const newAccessToken = response.access;

        await Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        // Read existing stored user (has role from login)
        const userJson = await Storage.getItemAsync(STORAGE_KEYS.USER);
        const storedUser = userJson ? JSON.parse(userJson) : null;

        // Fetch live profile and merge, preserving role from stored snapshot
        let user;
        try {
          const profileData = await authService.getProfile();
          user = storedUser
            ? { ...storedUser, ...profileData, role: storedUser.role }
            : profileData;
        } catch {
          // If profile fetch fails, fall back to stored user
          user = storedUser;
        }

        if (!user) {
          set({ isBootstrapping: false });
          return;
        }

        await Storage.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));

        set({
          user,
          tokens: { access: newAccessToken, refresh: refreshTokenValue },
          isAuthenticated: true,
          isBootstrapping: false,
        });
      } catch {
        // Token refresh failed → session expired → clean up
        await Promise.all([
          Storage.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
          Storage.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
          Storage.deleteItemAsync(STORAGE_KEYS.USER),
        ]);
        set({ ...initialState, isBootstrapping: false });
      }
    } catch {
      // SecureStore read failed → start fresh
      await Promise.all([
        Storage.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        Storage.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        Storage.deleteItemAsync(STORAGE_KEYS.USER),
      ]).catch(() => {});
      set({ ...initialState, isBootstrapping: false });
    }
  },

  /**
   * Login: authenticate and persist tokens + user profile.
   */
  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login(credentials);

      // Persist tokens + user snapshot to SecureStore
      await Promise.all([
        Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access),
        Storage.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refresh),
        Storage.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(response.user)),
      ]);

      set({
        user: response.user,
        tokens: { access: response.access, refresh: response.refresh },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number, data?: Record<string, unknown> }; message?: string };

      let message = 'Login failed. Please try again.';
      
      // Override explicit backend error with generic security message on 401
      if (axiosError?.response?.status === 401) {
        message = 'Invalid email or password. Please try again.';
      } else if (axiosError?.response?.data) {
        const data = axiosError.response.data;
        message =
          (data.detail as string) ||
          ((data.non_field_errors as string[])?.[0]) ||
          (data.message as string) ||
          JSON.stringify(data);
      } else if (error instanceof Error) {
        message = error.message;
      }

      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Register: create account.
   */
  register: async (payload: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authService.register(payload);
      set({ isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> }; message?: string };

      let message = 'Registration failed. Please try again.';
      if (axiosError?.response?.data) {
        const data = axiosError.response.data;
        message =
          (data.detail as string) ||
          ((data.email as string[])?.[0]) ||
          (data.message as string) ||
          JSON.stringify(data);
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
        Storage.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        Storage.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        Storage.deleteItemAsync(STORAGE_KEYS.USER),
      ]);
      set({ ...initialState, isBootstrapping: false });
    }
  },

  /**
   * Refresh Token: get new access token using refresh token.
   */
  refreshToken: async () => {
    try {
      const { tokens } = get();
      if (!tokens?.refresh) throw new Error('No refresh token');

      const response = await authService.refreshToken(tokens.refresh);

      await Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access);

      set({
        tokens: { ...tokens, access: response.access },
      });
    } catch {
      // If refresh fails, force logout
      await get().logout();
    }
  },

  /**
   * Fetch profile: GET /auth/profile/ and merge with local state.
   * IMPORTANT: We merge rather than replace because the profile endpoint
   * may not return fields like `role`, `is_verified`, `is_doctor_approved`
   * that were present in the original login response.
   */
  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const profileData = await authService.getProfile();
      const existingUser = get().user;
      // Merge: keep existing fields (like role), overlay with fresh profile data
      const mergedUser = existingUser
        ? { ...existingUser, ...profileData, role: existingUser.role }
        : profileData;
      await Storage.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(mergedUser));
      set({ user: mergedUser, isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) || 'Failed to load profile.';
      set({ isLoading: false, error: message });
    }
  },

  /**
   * Update profile: PUT /auth/profile/ and merge with local user.
   */
  updateProfile: async (payload: UpdateProfileRequest) => {
    try {
      set({ isLoading: true, error: null });
      const profileData = await authService.updateProfile(payload);
      const existingUser = get().user;
      const mergedUser = existingUser
        ? { ...existingUser, ...profileData, role: existingUser.role }
        : profileData;
      await Storage.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(mergedUser));
      set({ user: mergedUser, isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) || 'Failed to update profile.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Change password: PUT /auth/password/change/
   */
  changePassword: async (payload: ChangePasswordRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authService.changePassword(payload);
      set({ isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) ||
        (axiosError?.response?.data?.old_password as string) ||
        'Failed to change password.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Update the local user snapshot (also persists to storage).
   */
  setUser: (user: User) => {
    set({ user });
    Storage.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearError: () => set({ error: null }),
}));


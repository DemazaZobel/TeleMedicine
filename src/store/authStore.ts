import { create } from 'zustand';
import * as Storage from '../services/storage';
import type {
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  LinkedAccount,
  CreateLinkedPatientRequest,
  LinkAccountRequest,
  LinkAccountConfirmRequest,
} from '../types';
import { authService } from '../features/auth/services/authService';
import { STORAGE_KEYS } from '../services/api';
import { resetAllStores } from './resetAllStores';

// ─── State Shape ─────────────────────────────────────────
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  // Linked Accounts
  linkedAccount: LinkedAccount | null;
  hasLinkedAccount: boolean;
  isSwitchingAccount: boolean;
}

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
  // Linked Accounts
  fetchLinkedAccounts: () => Promise<void>;
  createLinkedPatient: (payload: CreateLinkedPatientRequest) => Promise<void>;
  linkAccountRequest: (payload: LinkAccountRequest) => Promise<string>; // returns request_id
  linkAccountConfirm: (payload: LinkAccountConfirmRequest) => Promise<void>;
  switchAccount: (linkedUserId: string) => Promise<void>;
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
  linkedAccount: null,
  hasLinkedAccount: false,
  isSwitchingAccount: false,
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
        const newRefreshToken = response.refresh || refreshTokenValue;

        await Promise.all([
          Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken),
          Storage.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
        ]);

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
          tokens: { access: newAccessToken, refresh: newRefreshToken },
          isAuthenticated: true,
          isBootstrapping: false,
        });

        // 5. Fetch linked accounts for the restored session
        await get().fetchLinkedAccounts();
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

      // Fetch linked accounts for the new session
      await get().fetchLinkedAccounts();
    } catch (error: any) {
      let message = 'Login failed. Please try again.';
      
      // Extract error safely
      if (error?.response?.status === 401) {
        message = 'Invalid email or password. Please try again.';
      } else if (error?.response?.data) {
        const data = error.response.data;
        if (data.detail) message = data.detail as string;
        else if (data.non_field_errors) message = (data.non_field_errors as string[])[0];
        else if (data.message) message = data.message as string;
        else if (typeof data === 'string') message = data;
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
    } catch (error: any) {
      let message = 'Registration failed. Please try again.';
      if (error?.response?.data) {
        const data = error.response.data;
        if (data.email) message = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data.phone_number) message = Array.isArray(data.phone_number) ? data.phone_number[0] : data.phone_number;
        else if (data.password) message = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (data.detail) message = data.detail as string;
        else if (data.non_field_errors) message = (data.non_field_errors as string[])[0];
        else if (data.message) message = data.message as string;
        else if (typeof data === 'string') message = data;
        else message = 'Please check your inputs and try again.';
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

  // ─── Linked Accounts ────────────────────────────────────

  /**
   * Fetch the linked account for the current user.
   * Since it's 1:1 Doctor→Patient, we expect 0 or 1 result.
   */
  fetchLinkedAccounts: async () => {
    try {
      const accounts = await authService.getLinkedAccounts();
      const linked = accounts.length > 0 ? accounts[0] : null;
      set({ linkedAccount: linked, hasLinkedAccount: !!linked });
    } catch (error) {
      console.error('[AuthStore] Failed to fetch linked accounts:', error);
      // Non-critical — don't set error state, just log
    }
  },

  /**
   * Create a linked patient account (Doctor only).
   * After creation, fetches the updated linked accounts list.
   * Does NOT auto-switch — the UI should prompt the user.
   */
  createLinkedPatient: async (payload: CreateLinkedPatientRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authService.createLinkedPatient(payload);
      // Refresh linked accounts to pick up the new patient
      await get().fetchLinkedAccounts();
      set({ isLoading: false });
    } catch (error: any) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const emailErr = axiosError?.response?.data?.email;
      const message =
        (axiosError?.response?.data?.detail as string) ||
        (Array.isArray(emailErr) ? emailErr[0] : (emailErr as string)) ||
        'Failed to create linked patient account.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Link Existing Account: Step 1 — Send OTP to both emails.
   */
  linkAccountRequest: async (payload: LinkAccountRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.linkAccountRequest(payload);
      set({ isLoading: false });
      return response.request_id;
    } catch (error: any) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) ||
        (axiosError?.response?.data?.target_email as string) ||
        'Failed to send link request. Please check the email and try again.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Link Existing Account: Step 2 — Confirm with both OTP codes.
   */
  linkAccountConfirm: async (payload: LinkAccountConfirmRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authService.linkAccountConfirm(payload);
      // Refresh linked accounts to pick up the new link
      await get().fetchLinkedAccounts();
      set({ isLoading: false });
    } catch (error: any) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) ||
        'Invalid or expired codes. Please try again.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Switch to a linked account.
   * 
   * This is the core of the feature:
   * 1. Call the switch endpoint → get new tokens + user
   * 2. Replace all stored tokens with the new ones
   * 3. Update user state (role changes!)
   * 4. Clear all role-specific stores to prevent stale data
   * 5. Fetch linked accounts for the new session
   */
  switchAccount: async (linkedUserId: string) => {
    try {
      set({ isSwitchingAccount: true, error: null });

      const response = await authService.switchAccount(linkedUserId);

      // 1. Replace tokens in SecureStore
      await Promise.all([
        Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access),
        Storage.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refresh),
        Storage.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(response.user)),
      ]);

      // 2. Clear all role-specific stores to prevent stale data
      resetAllStores();

      // 3. Update auth state with new user + tokens
      set({
        user: response.user,
        tokens: { access: response.access, refresh: response.refresh },
        isAuthenticated: true,
        isSwitchingAccount: false,
      });

      // 4. Fetch linked accounts for the new session (so the switcher UI updates)
      await get().fetchLinkedAccounts();
    } catch (error: any) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) ||
        'Failed to switch account. Please try again.';
      set({ isSwitchingAccount: false, error: message });
      throw error;
    }
  },
}));

// src/__tests__/unit/stores/authStore.test.ts
// Tests: TC-AUTH-001 through TC-AUTH-013
// Run: npx jest src/__tests__/unit/stores/authStore.test.ts

import { act } from 'react-test-renderer';
import { mockRegisterResponse } from '../../helpers/fixtures';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../features/auth/services/authService';
import * as Storage from '../../../services/storage';

// ─── Mock the auth service (we test the STORE, not the HTTP layer) ────────────
jest.mock('../../../features/auth/services/authService');
jest.mock('../../../services/storage');
jest.mock('../../../store/resetAllStores', () => ({ resetAllStores: jest.fn() }));

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedStorage = Storage as jest.Mocked<typeof Storage>;

// ─── Shared fixtures ─────────────────────────────────────────────────────────
const PATIENT_USER = {
  id: 'user-1',
  email: 'tigist@test.com',
  first_name: 'Tigist',
  last_name: 'Bekele',
  role: 'PATIENT' as const,
  is_verified: true,
  is_doctor_approved: false,
};

const DOCTOR_USER = {
  id: 'user-2',
  email: 'doctor@test.com',
  first_name: 'Dr. Abebe',
  last_name: 'Girma',
  role: 'DOCTOR' as const,
  is_verified: true,
  is_doctor_approved: true,
};

const MOCK_TOKENS = {
  access: 'mock-access-token',
  refresh: 'mock-refresh-token',
};

// Reset store state before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    isBootstrapping: true,
    error: null,
    linkedAccount: null,
    hasLinkedAccount: false,
    isSwitchingAccount: false,
  });
  jest.clearAllMocks();
  mockedAuthService.getLinkedAccounts.mockResolvedValue([]);
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-004 — Login with Valid Credentials
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-004: login with valid credentials', () => {
  it('stores tokens, sets user, and marks authenticated', async () => {
    mockedAuthService.login.mockResolvedValueOnce({
      ...MOCK_TOKENS,
      user: PATIENT_USER,
    });

    await act(async () => {
      await useAuthStore.getState().login({
        email: 'tigist@test.com',
        password: 'Test@1234',
      });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(PATIENT_USER);
    expect(state.tokens?.access).toBe(MOCK_TOKENS.access);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();

    // Tokens must be persisted to SecureStore
    expect(mockedStorage.setItemAsync).toHaveBeenCalledWith(
      'medlink_access_token',
      MOCK_TOKENS.access
    );
    expect(mockedStorage.setItemAsync).toHaveBeenCalledWith(
      'medlink_refresh_token',
      MOCK_TOKENS.refresh
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-005 — Login with Wrong Password
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-005: login with wrong password', () => {
  it('sets error message and does not authenticate', async () => {
    const apiError = {
      response: { status: 401, data: { detail: 'No active account found with the given credentials.' } },
    };
    mockedAuthService.login.mockRejectedValueOnce(apiError);

    await act(async () => {
      await expect(
        useAuthStore.getState().login({ email: 'tigist@test.com', password: 'wrong' })
      ).rejects.toBeDefined();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid email or password. Please try again.');
    expect(state.isLoading).toBe(false);
    expect(state.tokens).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-001 — Register Patient
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-001: patient registration', () => {
  it('calls register service and clears loading on success', async () => {
    mockedAuthService.register.mockResolvedValueOnce(
      mockRegisterResponse({ message: 'User registered. Please verify your email.' }),
    );

    await act(async () => {
      await useAuthStore.getState().register({
        email: 'tigist@test.com',
        password: 'Test@1234',
        first_name: 'Tigist',
        last_name: 'Bekele',
        role: 'PATIENT',
      });
    });

    const state = useAuthStore.getState();
    expect(mockedAuthService.register).toHaveBeenCalledTimes(1);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    // Registration does NOT authenticate — user must verify email first
    expect(state.isAuthenticated).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-003 — Registration with Duplicate Email
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-003: duplicate email registration', () => {
  it('sets error and rejects', async () => {
    const apiError = {
      response: {
        data: { email: ['A user with this email already exists.'] },
      },
    };
    mockedAuthService.register.mockRejectedValueOnce(apiError);

    await act(async () => {
      await expect(
        useAuthStore.getState().register({
          email: 'tigist@test.com',
          password: 'Test@1234',
          first_name: 'Tigist',
          last_name: 'Bekele',
          role: 'PATIENT',
        })
      ).rejects.toBeDefined();
    });

    const state = useAuthStore.getState();
    expect(state.error).toBe('A user with this email already exists.');
    expect(state.isAuthenticated).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-011 — Logout
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-011: logout', () => {
  it('blacklists token, clears store, and removes from SecureStore', async () => {
    // Pre-set authenticated state
    useAuthStore.setState({
      user: PATIENT_USER,
      tokens: MOCK_TOKENS,
      isAuthenticated: true,
      isBootstrapping: false,
    });

    mockedAuthService.logout.mockResolvedValueOnce(undefined);

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();

    // Tokens removed from SecureStore
    expect(mockedStorage.deleteItemAsync).toHaveBeenCalledWith('medlink_access_token');
    expect(mockedStorage.deleteItemAsync).toHaveBeenCalledWith('medlink_refresh_token');
    expect(mockedStorage.deleteItemAsync).toHaveBeenCalledWith('medlink_user');

    // Logout endpoint called with refresh token
    expect(mockedAuthService.logout).toHaveBeenCalledWith(MOCK_TOKENS.refresh);
  });

  it('still clears local state even if logout API call fails', async () => {
    useAuthStore.setState({
      user: PATIENT_USER,
      tokens: MOCK_TOKENS,
      isAuthenticated: true,
      isBootstrapping: false,
    });
    mockedAuthService.logout.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().tokens).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-010 — Bootstrap: Restore Session on App Restart
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-010: session bootstrap', () => {
  it('restores authenticated session from SecureStore', async () => {
    mockedStorage.getItemAsync
      .mockResolvedValueOnce(MOCK_TOKENS.refresh)       // REFRESH_TOKEN
      .mockResolvedValueOnce(JSON.stringify(PATIENT_USER)); // USER

    mockedAuthService.refreshToken.mockResolvedValueOnce({
      access: 'new-access-token',
      refresh: MOCK_TOKENS.refresh,
    });

    mockedAuthService.getProfile.mockResolvedValueOnce(PATIENT_USER);

    await act(async () => {
      await useAuthStore.getState().bootstrap();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isBootstrapping).toBe(false);
    expect(state.user?.email).toBe('tigist@test.com');
    expect(state.tokens?.access).toBe('new-access-token');
  });

  it('clears state if no refresh token found', async () => {
    mockedStorage.getItemAsync.mockResolvedValueOnce(null); // No refresh token

    await act(async () => {
      await useAuthStore.getState().bootstrap();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isBootstrapping).toBe(false);
    expect(state.user).toBeNull();
  });

  it('clears state and logs out if token refresh fails', async () => {
    mockedStorage.getItemAsync.mockResolvedValueOnce('expired-refresh-token');
    mockedAuthService.refreshToken.mockRejectedValueOnce(new Error('Token expired'));

    await act(async () => {
      await useAuthStore.getState().bootstrap();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isBootstrapping).toBe(false);
    expect(mockedStorage.deleteItemAsync).toHaveBeenCalledTimes(3);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-012 — Change Password
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-012: change password', () => {
  it('calls change password service successfully', async () => {
    useAuthStore.setState({ user: PATIENT_USER, isAuthenticated: true, isBootstrapping: false });
    mockedAuthService.changePassword.mockResolvedValueOnce({ message: 'Password changed.' });

    await act(async () => {
      await useAuthStore.getState().changePassword({
        old_password: 'OldPass@1',
        new_password: 'NewPass@1',
      });
    });

    expect(mockedAuthService.changePassword).toHaveBeenCalledWith({
      old_password: 'OldPass@1',
      new_password: 'NewPass@1',
    });
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-013 — Account Switching
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-013: account switching', () => {
  it('replaces tokens and user on successful switch', async () => {
    useAuthStore.setState({
      user: DOCTOR_USER,
      tokens: MOCK_TOKENS,
      isAuthenticated: true,
      isBootstrapping: false,
    });

    const linkedPatient = {
      ...PATIENT_USER,
      id: 'patient-99',
      role: 'PATIENT' as const,
    };

    mockedAuthService.switchAccount.mockResolvedValueOnce({
      access: 'new-patient-access',
      refresh: 'new-patient-refresh',
      user: linkedPatient,
    });

    await act(async () => {
      await useAuthStore.getState().switchAccount('patient-99');
    });

    const state = useAuthStore.getState();
    expect(state.user?.role).toBe('PATIENT');
    expect(state.tokens?.access).toBe('new-patient-access');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isSwitchingAccount).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-PROFILE-002 — Update Profile
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-PROFILE-002: update profile', () => {
  it('merges updated profile while preserving role', async () => {
    useAuthStore.setState({
      user: PATIENT_USER,
      tokens: MOCK_TOKENS,
      isAuthenticated: true,
      isBootstrapping: false,
    });

    const updatedProfile = { ...PATIENT_USER, first_name: 'Updated' };
    mockedAuthService.updateProfile.mockResolvedValueOnce(updatedProfile);

    await act(async () => {
      await useAuthStore.getState().updateProfile({ first_name: 'Updated' });
    });

    const state = useAuthStore.getState();
    expect(state.user?.first_name).toBe('Updated');
    expect(state.user?.role).toBe('PATIENT'); // role must be preserved
  });
});
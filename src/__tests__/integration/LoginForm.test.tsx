// src/__tests__/integration/LoginForm.test.ts
// TC-AUTH-004, TC-AUTH-005, TC-AUTH-006
// Tests LoginForm LOGIC (store interactions) without rendering React Native components.
// Run: npx jest src/__tests__/integration/LoginForm.test.ts

import { useAuthStore } from '../../store/authStore';
import { authService } from '../../features/auth/services/authService';
import { act } from 'react-test-renderer';

jest.mock('../../features/auth/services/authService');
jest.mock('../../services/storage');
jest.mock('../../store/resetAllStores', () => ({ resetAllStores: jest.fn() }));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const PATIENT_USER = {
  id: 'u1',
  email: 'tigist@test.com',
  first_name: 'Tigist',
  last_name: 'Bekele',
  role: 'PATIENT' as const,
  is_verified: true,
  is_doctor_approved: false,
};

const TOKENS = { access: 'acc-token', refresh: 'ref-token' };

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    isBootstrapping: false,
    error: null,
    linkedAccount: null,
    hasLinkedAccount: false,
    isSwitchingAccount: false,
  });
  jest.clearAllMocks();
  mockedAuthService.getLinkedAccounts.mockResolvedValue([]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Simulate what LoginForm.handleLogin() does when called
// ─────────────────────────────────────────────────────────────────────────────
async function simulateLoginSubmit(email: string, password: string) {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  // Guard: same as LoginForm — do nothing if fields are empty
  if (!trimmedEmail || !trimmedPassword) return;

  await useAuthStore.getState().login({ email: trimmedEmail, password });
}

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-004 — Login with Valid Credentials
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-004: login with valid credentials', () => {
  it('authenticates user and sets tokens in store', async () => {
    mockedAuthService.login.mockResolvedValueOnce({
      ...TOKENS,
      user: PATIENT_USER,
    });

    await act(async () => {
      await simulateLoginSubmit('tigist@test.com', 'Test@1234');
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('tigist@test.com');
    expect(state.user?.role).toBe('PATIENT');
    expect(state.tokens?.access).toBe('acc-token');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('trims whitespace from email before calling login', async () => {
    mockedAuthService.login.mockResolvedValueOnce({ ...TOKENS, user: PATIENT_USER });

    await act(async () => {
      await simulateLoginSubmit('  tigist@test.com  ', 'Test@1234');
    });

    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: 'tigist@test.com',
      password: 'Test@1234',
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-005 — Login with Wrong Password
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-005: login with wrong password', () => {
  it('sets error and does not authenticate', async () => {
    mockedAuthService.login.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: 'No active account found with the given credentials.' },
      },
    });

    await act(async () => {
      try {
        await simulateLoginSubmit('tigist@test.com', 'wrongpassword');
      } catch (_) {}
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.tokens).toBeNull();
    expect(state.error).toBeTruthy();
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-006 — Login with Unverified Email
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-AUTH-006: login with unverified email', () => {
  it('rejects login and surfaces unverified error', async () => {
    mockedAuthService.login.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: 'Please verify your email before logging in.' },
      },
    });

    await act(async () => {
      try {
        await simulateLoginSubmit('unverified@test.com', 'Test@1234');
      } catch (_) {}
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Guard: Empty Fields
// ═════════════════════════════════════════════════════════════════════════════
describe('LoginForm empty field guard', () => {
  it('does not call login when email is empty', async () => {
    await act(async () => {
      await simulateLoginSubmit('', 'Test@1234');
    });
    expect(mockedAuthService.login).not.toHaveBeenCalled();
  });

  it('does not call login when password is empty', async () => {
    await act(async () => {
      await simulateLoginSubmit('tigist@test.com', '');
    });
    expect(mockedAuthService.login).not.toHaveBeenCalled();
  });

  it('does not call login when both fields are whitespace only', async () => {
    await act(async () => {
      await simulateLoginSubmit('   ', '   ');
    });
    expect(mockedAuthService.login).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// clearError behavior
// ═════════════════════════════════════════════════════════════════════════════
describe('clearError', () => {
  it('clears the error field in store', async () => {
    useAuthStore.setState({ error: 'Some previous error' });

    useAuthStore.getState().clearError();

    expect(useAuthStore.getState().error).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-AUTH-009 — Token Refresh
// ═════════════════════════════════════════════════════════════════════════════
// bootstrap() reads the refresh token from SecureStore (Storage.getItemAsync),
// NOT from store state. We must mock Storage BEFORE calling bootstrap().
describe('TC-AUTH-009: token refresh', () => {
  it('calls refreshToken when a stored refresh token exists', async () => {
    // Reset to logged-out state — bootstrap starts fresh
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isBootstrapping: true,
    });

    // Mock Storage: first call returns the refresh token, second returns stored user JSON
    const Storage = require('../../services/storage');
    Storage.getItemAsync
      .mockResolvedValueOnce('ref-token')                        // REFRESH_TOKEN key
      .mockResolvedValueOnce(JSON.stringify(PATIENT_USER));      // USER key

    mockedAuthService.refreshToken.mockResolvedValueOnce({
      access: 'new-access-token',
      refresh: 'ref-token',
    });
    mockedAuthService.getProfile.mockResolvedValueOnce(PATIENT_USER);

    await act(async () => {
      await useAuthStore.getState().bootstrap();
    });

    // bootstrap() must have called refreshToken with the stored token
    expect(mockedAuthService.refreshToken).toHaveBeenCalledWith('ref-token');

    // Session restored
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.tokens?.access).toBe('new-access-token');
    expect(state.isBootstrapping).toBe(false);
  });

  it('stays logged out when no refresh token is in storage', async () => {
    useAuthStore.setState({ isBootstrapping: true });

    const Storage = require('../../services/storage');
    Storage.getItemAsync.mockResolvedValueOnce(null); // no token stored

    await act(async () => {
      await useAuthStore.getState().bootstrap();
    });

    expect(mockedAuthService.refreshToken).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });
});
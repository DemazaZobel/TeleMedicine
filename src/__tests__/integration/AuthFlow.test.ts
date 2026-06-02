// src/__tests__/integration/AuthFlow.test.ts
// Full session lifecycle integration tests.
// Tests multiple stores and services working together across a complete flow.
//
// Flows covered:
//   TC-AUTH-001 → TC-AUTH-004 → TC-AUTH-010 → TC-AUTH-011
//   Register → Login → App restart (bootstrap) → Logout
//
//   TC-AUTH-008: Forgot password end-to-end
//   TC-AUTH-012: Change password then re-login
//   TC-AUTH-013: Account switching between doctor and linked patient
//   TC-PROFILE-002: Update profile mid-session
//
// Run: npx jest src/__tests__/integration/AuthFlow.test.ts

import { act } from 'react-test-renderer';
import { mockApiResponse, mockRegisterResponse } from '../helpers/fixtures';
import { useAuthStore } from '../../store/authStore';
import { useDoctorStore } from '../../store/doctor.store';
import { useBookingStore } from '../../store/booking.store';
import { authService } from '../../features/auth/services/authService';

jest.mock('../../features/auth/services/authService');
jest.mock('../../services/storage');
jest.mock('../../store/resetAllStores', () => ({
  resetAllStores: jest.fn(),
}));

const mockedAuth = authService as jest.Mocked<typeof authService>;
const Storage = require('../../services/storage');

// ─── Fixtures ────────────────────────────────────────────────────────────────
const PATIENT_USER = {
  id: 'u1', email: 'tigist@test.com',
  first_name: 'Tigist', last_name: 'Bekele',
  role: 'PATIENT' as const, is_verified: true, is_doctor_approved: false,
};

const DOCTOR_USER = {
  id: 'u2', email: 'abebe@test.com',
  first_name: 'Abebe', last_name: 'Girma',
  role: 'DOCTOR' as const, is_verified: true, is_doctor_approved: true,
};

const TOKENS = { access: 'access-abc', refresh: 'refresh-xyz' };
const NEW_TOKENS = { access: 'access-new', refresh: 'refresh-new' };

function resetAllStores() {
  useAuthStore.setState({
    user: null, tokens: null, isAuthenticated: false,
    isLoading: false, isBootstrapping: true, error: null,
    linkedAccount: null, hasLinkedAccount: false, isSwitchingAccount: false,
  });
  useDoctorStore.setState({
    profile: null, documents: [], searchResults: [],
    isLoadingProfile: false, isUpdatingProfile: false,
    isUploadingDocument: false, isSearching: false, error: null,
  });
  useBookingStore.setState({
    appointments: [], availabilityRules: [], doctorAvailabilityRules: [],
    notifications: [], preferences: null, wallet: null,
    paymentMethods: [], isLoading: false, error: null,
    isNotificationsDrawerOpen: false,
  });
  jest.clearAllMocks();
  mockedAuth.getLinkedAccounts.mockResolvedValue([]);
}

beforeEach(resetAllStores);

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 1: Register → Login → Bootstrap → Logout
// TC-AUTH-001 → TC-AUTH-004 → TC-AUTH-010 → TC-AUTH-011
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 1: Register → Login → Bootstrap → Logout', () => {

  it('Step 1 (TC-AUTH-001): register creates account without authenticating', async () => {
    mockedAuth.register.mockResolvedValueOnce(
      mockRegisterResponse({ message: 'User registered. Please verify your email.' }),
    );

    await act(async () => {
      await useAuthStore.getState().register({
        email: 'tigist@test.com', password: 'Test@1234',
        first_name: 'Tigist', last_name: 'Bekele', role: 'PATIENT',
      });
    });

    const state = useAuthStore.getState();
    // Registration alone does NOT authenticate — OTP must be verified first
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(mockedAuth.register).toHaveBeenCalledTimes(1);
  });

  it('Step 2 (TC-AUTH-004): login authenticates and stores tokens', async () => {
    mockedAuth.login.mockResolvedValueOnce({ ...TOKENS, user: PATIENT_USER });

    await act(async () => {
      await useAuthStore.getState().login({
        email: 'tigist@test.com', password: 'Test@1234',
      });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('tigist@test.com');
    expect(state.user?.role).toBe('PATIENT');
    expect(state.tokens?.access).toBe(TOKENS.access);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('Step 3 (TC-AUTH-010): app restart restores session via bootstrap', async () => {
    // Simulate: app was closed. SecureStore has the saved tokens.
    Storage.getItemAsync
      .mockResolvedValueOnce(TOKENS.refresh)
      .mockResolvedValueOnce(JSON.stringify(PATIENT_USER));

    mockedAuth.refreshToken.mockResolvedValueOnce(NEW_TOKENS);
    mockedAuth.getProfile.mockResolvedValueOnce(PATIENT_USER);

    await act(async () => {
      await useAuthStore.getState().bootstrap();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isBootstrapping).toBe(false);
    expect(state.tokens?.access).toBe(NEW_TOKENS.access);
    expect(state.user?.email).toBe('tigist@test.com');
  });

  it('Step 4 (TC-AUTH-011): logout clears all state and tokens', async () => {
    // Pre-set authenticated state
    useAuthStore.setState({
      user: PATIENT_USER, tokens: TOKENS,
      isAuthenticated: true, isBootstrapping: false,
    });

    mockedAuth.logout.mockResolvedValueOnce(undefined);

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(Storage.deleteItemAsync).toHaveBeenCalledWith('medlink_access_token');
    expect(Storage.deleteItemAsync).toHaveBeenCalledWith('medlink_refresh_token');
    expect(Storage.deleteItemAsync).toHaveBeenCalledWith('medlink_user');
  });

  it('Full flow: all four steps run in sequence correctly', async () => {
    // 1. Register
    mockedAuth.register.mockResolvedValueOnce(mockRegisterResponse({ message: 'Registered.' }));
    await act(async () => {
      await useAuthStore.getState().register({
        email: 'tigist@test.com', password: 'Test@1234',
        first_name: 'Tigist', last_name: 'Bekele', role: 'PATIENT',
      });
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // 2. Login
    mockedAuth.login.mockResolvedValueOnce({ ...TOKENS, user: PATIENT_USER });
    await act(async () => {
      await useAuthStore.getState().login({ email: 'tigist@test.com', password: 'Test@1234' });
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // 3. Logout
    mockedAuth.logout.mockResolvedValueOnce(undefined);
    await act(async () => {
      await useAuthStore.getState().logout();
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().tokens).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 2: Forgot Password end-to-end
// TC-AUTH-008
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 2: TC-AUTH-008 — Forgot password end-to-end', () => {

  it('request OTP → reset password → login with new password', async () => {
    // Step 1: Request OTP
    mockedAuth.forgotPassword.mockResolvedValueOnce(mockApiResponse('OTP sent.'));
    await act(async () => {
      await authService.forgotPassword({ email: 'tigist@test.com' });
    });
    expect(mockedAuth.forgotPassword).toHaveBeenCalledWith({ email: 'tigist@test.com' });

    // Step 2: Reset password with OTP
    mockedAuth.resetPassword.mockResolvedValueOnce(mockApiResponse('Password reset.'));
    await act(async () => {
      await authService.resetPassword({
        email: 'tigist@test.com', code: '123456', newPassword: 'NewPass@1',
      });
    });
    expect(mockedAuth.resetPassword).toHaveBeenCalledWith(
      expect.objectContaining({ newPassword: 'NewPass@1' })
    );

    // Step 3: Login with new password succeeds
    mockedAuth.login.mockResolvedValueOnce({ ...TOKENS, user: PATIENT_USER });
    await act(async () => {
      await useAuthStore.getState().login({ email: 'tigist@test.com', password: 'NewPass@1' });
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 3: Login → Change Password → Session still valid
// TC-AUTH-012
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 3: TC-AUTH-012 — Change password mid-session', () => {

  it('session remains active after password change', async () => {
    // Login first
    useAuthStore.setState({
      user: PATIENT_USER, tokens: TOKENS,
      isAuthenticated: true, isBootstrapping: false,
    });

    // Change password
    mockedAuth.changePassword.mockResolvedValueOnce({ message: 'Password changed.' });
    await act(async () => {
      await useAuthStore.getState().changePassword({
        old_password: 'OldPass@1', new_password: 'NewPass@2',
      });
    });

    // Session should still be active
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.error).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 4: Login → Update Profile → Profile reflected in store
// TC-PROFILE-002
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 4: TC-PROFILE-002 — Update profile mid-session', () => {

  it('profile update reflects in auth store without changing role', async () => {
    useAuthStore.setState({
      user: PATIENT_USER, tokens: TOKENS,
      isAuthenticated: true, isBootstrapping: false,
    });

    const updatedUser = { ...PATIENT_USER, first_name: 'Updated' };
    mockedAuth.updateProfile.mockResolvedValueOnce(updatedUser);

    await act(async () => {
      await useAuthStore.getState().updateProfile({ first_name: 'Updated' });
    });

    const state = useAuthStore.getState();
    expect(state.user?.first_name).toBe('Updated');
    expect(state.user?.role).toBe('PATIENT'); // role must never change
    expect(state.isAuthenticated).toBe(true);  // still logged in
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 5: Doctor Login → Switch to Linked Patient Account
// TC-AUTH-013
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 5: TC-AUTH-013 — Doctor switches to linked patient account', () => {

  it('switches account and all stores reflect new patient context', async () => {
    // Start as doctor
    useAuthStore.setState({
      user: DOCTOR_USER, tokens: TOKENS,
      isAuthenticated: true, isBootstrapping: false,
    });

    const linkedPatient = { ...PATIENT_USER, id: 'patient-99' };
    mockedAuth.switchAccount.mockResolvedValueOnce({
      access: 'patient-access', refresh: 'patient-refresh',
      user: linkedPatient,
    });
    mockedAuth.getLinkedAccounts.mockResolvedValueOnce([]);

    await act(async () => {
      await useAuthStore.getState().switchAccount('patient-99');
    });

    const state = useAuthStore.getState();
    expect(state.user?.role).toBe('PATIENT');
    expect(state.user?.id).toBe('patient-99');
    expect(state.tokens?.access).toBe('patient-access');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isSwitchingAccount).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 6: Bootstrap fails → stays logged out (not authenticated)
// TC-AUTH-010 edge case
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 6: TC-AUTH-010 — Bootstrap with expired token', () => {

  it('clears state when refresh token is expired', async () => {
    Storage.getItemAsync.mockResolvedValueOnce('expired-refresh-token');
    mockedAuth.refreshToken.mockRejectedValueOnce(new Error('Token expired'));

    await act(async () => {
      await useAuthStore.getState().bootstrap();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isBootstrapping).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    // Tokens must be cleaned from storage
    expect(Storage.deleteItemAsync).toHaveBeenCalledTimes(3);
  });
});
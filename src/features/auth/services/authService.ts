import { apiClient } from '../../../services/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  RefreshTokenResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiResponse,
  LinkedAccount,
  CreateLinkedPatientRequest,
  CreateLinkedPatientResponse,
  SwitchAccountResponse,
  LinkAccountRequest,
  LinkAccountRequestResponse,
  LinkAccountConfirmRequest,
} from '../../../types';
import type { User } from '../../../types/models';

const AUTH_BASE = '/auth';

export const authService = {
  /** POST /api/auth/login/ — Obtain JWT access and refresh tokens */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      `${AUTH_BASE}/login/`,
      credentials
    );
    return data;
  },

  /** POST /api/auth/register/ — Register a new MedLink account */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>(
      `${AUTH_BASE}/register/`,
      payload
    );
    return data;
  },

  /** POST /api/auth/logout/ — Logout and blacklist refresh token */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post(`${AUTH_BASE}/logout/`, { refresh: refreshToken });
  },

  /** POST /api/auth/token/refresh/ — Refresh JWT access token */
  async refreshToken(refresh: string): Promise<RefreshTokenResponse> {
    const { data } = await apiClient.post<RefreshTokenResponse>(
      `${AUTH_BASE}/token/refresh/`,
      { refresh }
    );
    return data;
  },

  /** POST /api/auth/forgot-password/ — Request password reset code */
  async forgotPassword(
    payload: ForgotPasswordRequest
  ): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE}/forgot-password/`,
      payload
    );
    return data;
  },

  /** POST /api/auth/reset-password/ — Reset password using OTP code */
  async resetPassword(
    payload: ResetPasswordRequest
  ): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE}/reset-password/`,
      payload
    );
    return data;
  },

  /** POST /api/auth/verify-email/ — Verify email address using OTP */
  async verifyEmail(payload: VerifyEmailRequest): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE}/verify-email/`,
      payload
    );
    return data;
  },

  /** POST /api/auth/resend-otp/ — Resend email verification OTP */
  async resendOtp(email: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE}/resend-otp/`,
      { email }
    );
    return data;
  },

  /** GET /api/auth/profile/ — Get current user's profile */
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<User>(`${AUTH_BASE}/profile/`);
    return data;
  },

  /** PUT /api/auth/profile/ — Update current user's profile */
  async updateProfile(payload: UpdateProfileRequest): Promise<User> {
    const { data } = await apiClient.put<User>(
      `${AUTH_BASE}/profile/`,
      payload
    );
    return data;
  },

  /** PUT /api/auth/password/change/ — Change password (authenticated) */
  async changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    const { data } = await apiClient.put<{ message: string }>(
      `${AUTH_BASE}/password/change/`,
      payload
    );
    return data;
  },

  // ─── Linked Accounts ────────────────────────────────────

  /** POST /api/auth/linked-accounts/create-patient/ — Create a linked patient account (Doctor only) */
  async createLinkedPatient(payload: CreateLinkedPatientRequest): Promise<CreateLinkedPatientResponse> {
    const { data } = await apiClient.post<CreateLinkedPatientResponse>(
      `${AUTH_BASE}/linked-accounts/create-patient/`,
      payload
    );
    return data;
  },

  /** GET /api/auth/linked-accounts/ — List linked accounts for the current user */
  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    const { data } = await apiClient.get<LinkedAccount[]>(
      `${AUTH_BASE}/linked-accounts/`
    );
    return data;
  },

  /** POST /api/auth/linked-accounts/switch/ — Switch to a linked account */
  async switchAccount(linkedUserId: string): Promise<SwitchAccountResponse> {
    const { data } = await apiClient.post<SwitchAccountResponse>(
      `${AUTH_BASE}/linked-accounts/switch/`,
      { linked_user_id: linkedUserId }
    );
    return data;
  },

  /** POST /api/auth/linked-accounts/link-request/ — Start account link verification (sends OTP to both) */
  async linkAccountRequest(payload: LinkAccountRequest): Promise<LinkAccountRequestResponse> {
    const { data } = await apiClient.post<LinkAccountRequestResponse>(
      `${AUTH_BASE}/linked-accounts/link-request/`,
      payload
    );
    return data;
  },

  /** POST /api/auth/linked-accounts/link-confirm/ — Confirm account link with both OTP codes */
  async linkAccountConfirm(payload: LinkAccountConfirmRequest): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      `${AUTH_BASE}/linked-accounts/link-confirm/`,
      payload
    );
    return data;
  },
};


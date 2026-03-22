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
  ApiResponse,
} from '../../../types';

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
};

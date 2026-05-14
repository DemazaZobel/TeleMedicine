// ─── Generic API Responses ───────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
}

// ─── Auth Tokens ─────────────────────────────────────────
export interface AuthTokens {
  access: string;
  refresh: string;
}

// ─── Auth Request/Response ───────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: import('./models').User;
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: import('./models').UserRole;
  phone_number?: string;
}

export interface RegisterResponse {
  user: import('./models').User;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

// ─── Profile & Password ─────────────────────────────────
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  biography?: string;
  location?: string;
  current_working_hospital?: string;
  education?: string;
  experience?: string;
  preferred_language?: 'en' | 'am' | 'fr';
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// ─── Linked Accounts ────────────────────────────────────
export interface LinkedAccount {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: import('./models').UserRole;
}

export interface CreateLinkedPatientRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone_number?: string;
}

export interface CreateLinkedPatientResponse {
  access: string;
  refresh: string;
  user: import('./models').User;
}

export interface SwitchAccountRequest {
  linked_user_id: string;
}

export interface SwitchAccountResponse {
  access: string;
  refresh: string;
  user: import('./models').User;
}

// ─── Link Existing Account (OTP Flow) ───────────────────
export interface LinkAccountRequest {
  target_email: string;
}

export interface LinkAccountRequestResponse {
  message: string;
  request_id: string;
}

export interface LinkAccountConfirmRequest {
  request_id: string;
  initiator_code: string;
  target_code: string;
}

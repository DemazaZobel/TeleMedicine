// ─── App Constants ───────────────────────────────────────
export const APP_NAME = 'MedLink';
export const APP_TAGLINE = 'Your Health, Connected';

// ─── API Configuration ───────────────────────────────────
export const API_CONFIG = {
  BASE_URL: 'https://medlinkethiopia.pythonanywhere.com/api',
  TIMEOUT: 15000,
} as const;

// ─── Pagination ──────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
} as const;

// ─── Validation ──────────────────────────────────────────
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  OTP_LENGTH: 6,
} as const;

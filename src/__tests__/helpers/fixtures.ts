import type { ApiResponse, RegisterResponse } from '../../types/api';
import type { User } from '../../types/models';
import type {
  AppointmentChangeRequestCreatePayload,
  DoctorWalletDetail,
  NotificationDetail,
  NotificationPreferenceDetail,
  ProviderAvailabilityRuleCreatePayload,
  ProviderAvailabilityRuleDetail,
} from '../../features/booking/types/bookingTypes';

export const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  email: 'user@test.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'PATIENT',
  is_verified: true,
  is_doctor_approved: false,
  ...overrides,
});

export const mockRegisterResponse = (
  overrides: Partial<RegisterResponse> = {},
): RegisterResponse => ({
  message: 'User registered. Please verify your email.',
  user: mockUser(),
  ...overrides,
});

export const mockApiResponse = <T>(
  message: string,
  data: T = null as T,
): ApiResponse<T> => ({
  data,
  message,
  success: true,
});

export const mockChangeRequestPayload = (
  overrides: Partial<AppointmentChangeRequestCreatePayload> = {},
): AppointmentChangeRequestCreatePayload => ({
  proposed_start: '2026-06-02T10:00:00Z',
  proposed_end: '2026-06-02T10:30:00Z',
  proposed_mode: 'ONLINE',
  expires_at: '2026-06-03T10:00:00Z',
  notes: 'Rescheduled.',
  ...overrides,
});

export const mockAvailabilityRule = (
  overrides: Partial<ProviderAvailabilityRuleDetail> = {},
): ProviderAvailabilityRuleDetail => ({
  id: 'rule-1',
  doctor: 'doc-1',
  weekday: 1,
  start_time: '09:00:00',
  end_time: '17:00:00',
  is_active: true,
  ...overrides,
});

export const mockAvailabilityRulePayload = (
  overrides: Partial<ProviderAvailabilityRuleCreatePayload> = {},
): ProviderAvailabilityRuleCreatePayload => ({
  weekday: 1,
  start_time: '09:00',
  end_time: '17:00',
  is_active: true,
  ...overrides,
});

export const mockNotification = (
  overrides: Partial<NotificationDetail> = {},
): NotificationDetail => ({
  id: 'notif-1',
  user: mockUser(),
  title: 'Appointment Confirmed',
  body: 'Your appointment has been confirmed.',
  type: 'APPOINTMENT',
  is_read: false,
  created_at: '2026-05-30T10:00:00Z',
  ...overrides,
});

export const mockNotificationPreferences = (
  overrides: Partial<NotificationPreferenceDetail> = {},
): NotificationPreferenceDetail => ({
  email_appointments: true,
  in_app_appointments: true,
  email_payments: true,
  in_app_payments: true,
  ...overrides,
});

export const mockWallet = (
  overrides: Partial<DoctorWalletDetail> = {},
): DoctorWalletDetail => ({
  total_earned: '1500.00',
  updated_at: '2026-05-30T10:00:00Z',
  ...overrides,
});

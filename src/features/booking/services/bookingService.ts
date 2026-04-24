import { apiClient } from '../../../services/api';
import type {
  AppointmentDetail,
  AppointmentBookingPayload,
  AppointmentCancelPayload,
  AppointmentChangeRequestDetail,
  AppointmentChangeRequestCreatePayload,
  AppointmentDoctorDecisionPayload,
  AppointmentChangeResponsePayload,
  ProviderAvailabilityRuleDetail,
  ProviderAvailabilityRuleCreatePayload,
  NotificationDetail,
  NotificationPreferenceDetail,
} from '../types/bookingTypes';

const BASE_URL = '/appointments';

export const bookingService = {
  // ─── APPOINTMENTS ────────────────────────────────────────

  /** GET /api/appointments/my/ */
  getMyList: async (): Promise<AppointmentDetail[]> => {
    const { data } = await apiClient.get<AppointmentDetail[]>(`${BASE_URL}/my/`);
    return data;
  },

  /** POST /api/appointments/book/ */
  book: async (payload: AppointmentBookingPayload): Promise<AppointmentDetail> => {
    const { data } = await apiClient.post<AppointmentDetail>(`${BASE_URL}/book/`, payload);
    return data;
  },

  /** POST /api/appointments/{id}/cancel/ */
  cancel: async (appointmentId: string | number, payload?: AppointmentCancelPayload): Promise<{ message: string; late_cancellation: boolean; appointment: AppointmentDetail }> => {
    const { data } = await apiClient.post<{ message: string; late_cancellation: boolean; appointment: AppointmentDetail }>(`${BASE_URL}/${appointmentId}/cancel/`, payload || {});
    return data;
  },

  /** GET /api/appointments/{id}/join/ */
  getJoinLink: async (appointmentId: string | number): Promise<{ meeting_link: string; scheduled_start: string; scheduled_end: string }> => {
    const { data } = await apiClient.get<{ meeting_link: string; scheduled_start: string; scheduled_end: string }>(`${BASE_URL}/${appointmentId}/join/`);
    return data;
  },

  // ─── CHANGE REQUESTS (PROVIDER & PATIENT DECISIONS) ──────

  /** POST /api/appointments/{id}/change-request/ (Provider proposes) */
  createChangeRequest: async (
    appointmentId: string | number,
    payload: AppointmentChangeRequestCreatePayload
  ): Promise<AppointmentChangeRequestDetail> => {
    const { data } = await apiClient.post<AppointmentChangeRequestDetail>(`${BASE_URL}/${appointmentId}/change-request/`, payload);
    return data;
  },

  /** POST /api/appointments/{id}/doctor-decision/ (Provider accepts or proposes change) */
  doctorDecision: async (
    appointmentId: string | number,
    payload: AppointmentDoctorDecisionPayload
  ): Promise<{ message?: string; appointment?: AppointmentDetail; change_request?: AppointmentChangeRequestDetail } | AppointmentDetail> => {
    const { data } = await apiClient.post(`${BASE_URL}/${appointmentId}/doctor-decision/`, payload);
    return data;
  },

  /** POST /api/appointments/change-requests/{id}/respond/ (Patient accepts/rejects) */
  respondToChangeRequest: async (
    changeRequestId: string | number,
    payload: AppointmentChangeResponsePayload
  ): Promise<{ change_request: AppointmentChangeRequestDetail; appointment: AppointmentDetail }> => {
    const { data } = await apiClient.post<{ change_request: AppointmentChangeRequestDetail; appointment: AppointmentDetail }>(
      `${BASE_URL}/change-requests/${changeRequestId}/respond/`,
      payload
    );
    return data;
  },

  // ─── PROVIDER AVAILABILITY ───────────────────────────────

  /** GET /api/appointments/availability/ */
  getAvailabilityRules: async (): Promise<ProviderAvailabilityRuleDetail[]> => {
    const { data } = await apiClient.get<ProviderAvailabilityRuleDetail[]>(`${BASE_URL}/availability/`);
    return data;
  },

  /** POST /api/appointments/availability/ */
  createAvailabilityRule: async (payload: ProviderAvailabilityRuleCreatePayload): Promise<ProviderAvailabilityRuleDetail> => {
    const { data } = await apiClient.post<ProviderAvailabilityRuleDetail>(`${BASE_URL}/availability/`, payload);
    return data;
  },

  // ─── NOTIFICATIONS ───────────────────────────────────────

  /** GET /api/appointments/notifications/ */
  getNotifications: async (): Promise<NotificationDetail[]> => {
    const { data } = await apiClient.get<NotificationDetail[]>(`${BASE_URL}/notifications/`);
    return data;
  },

  /** POST /api/appointments/notifications/{id}/read/ */
  markNotificationRead: async (notificationId: string | number): Promise<NotificationDetail> => {
    const { data } = await apiClient.post<NotificationDetail>(`${BASE_URL}/notifications/${notificationId}/read/`);
    return data;
  },

  /** GET /api/appointments/notification-preferences/ */
  getNotificationPreferences: async (): Promise<NotificationPreferenceDetail> => {
    const { data } = await apiClient.get<NotificationPreferenceDetail>(`${BASE_URL}/notification-preferences/`);
    return data;
  },

  /** PUT /api/appointments/notification-preferences/ */
  updateNotificationPreferences: async (payload: Partial<NotificationPreferenceDetail>): Promise<NotificationPreferenceDetail> => {
    const { data } = await apiClient.put<NotificationPreferenceDetail>(`${BASE_URL}/notification-preferences/`, payload);
    return data;
  },
};

// src/services/appointmentService.ts

import {
  Appointment,
  AppointmentBookingPayload,
  AppointmentCancelPayload,
  AppointmentChangeRequest,
  AppNotification,
  AvailabilityRule,
  AvailabilityRulePayload,
  CancelResponse,
  ChangeRequestCreatePayload,
  ChangeResponsePayload,
  DoctorDecisionPayload,
  JoinConsultationResponse,
  NotificationPreference,
} from "../types/appointment";
import api from "./api";

// ── Appointment CRUD ────────────────────────────────────────────────

export const bookAppointment = async (data: AppointmentBookingPayload) => {
  const res = await api.post<Appointment>("/appointments/book/", data);
  return res.data;
};

export const getMyAppointments = async () => {
  const res = await api.get<Appointment[]>("/appointments/my/");
  return res.data;
};

export const cancelAppointment = async (
  appointmentId: string,
  data?: AppointmentCancelPayload
) => {
  const res = await api.post<CancelResponse>(
    `/appointments/${appointmentId}/cancel/`,
    data ?? {}
  );
  return res.data;
};

// ── Doctor Decision ─────────────────────────────────────────────────

export const doctorDecision = async (
  appointmentId: string,
  data: DoctorDecisionPayload
) => {
  const res = await api.post(
    `/appointments/${appointmentId}/doctor-decision/`,
    data
  );
  return res.data;
};

// ── Change Requests ─────────────────────────────────────────────────

export const createChangeRequest = async (
  appointmentId: string,
  data: ChangeRequestCreatePayload
) => {
  const res = await api.post<AppointmentChangeRequest>(
    `/appointments/${appointmentId}/change-request/`,
    data
  );
  return res.data;
};

export const respondToChangeRequest = async (
  changeRequestId: string,
  data: ChangeResponsePayload
) => {
  const res = await api.post(
    `/appointments/change-requests/${changeRequestId}/respond/`,
    data
  );
  return res.data;
};

// ── Consultation ────────────────────────────────────────────────────

export const joinConsultation = async (appointmentId: string) => {
  const res = await api.get<JoinConsultationResponse>(
    `/appointments/${appointmentId}/join/`
  );
  return res.data;
};

// ── Provider Availability ───────────────────────────────────────────

export const getAvailabilityRules = async () => {
  const res = await api.get<AvailabilityRule[]>("/appointments/availability/");
  return res.data;
};

export const createAvailabilityRule = async (data: AvailabilityRulePayload) => {
  const res = await api.post<AvailabilityRule>(
    "/appointments/availability/",
    data
  );
  return res.data;
};

// ── Notifications ───────────────────────────────────────────────────

export const getNotifications = async () => {
  const res = await api.get<AppNotification[]>(
    "/appointments/notifications/"
  );
  return res.data;
};

export const markNotificationRead = async (notificationId: string) => {
  const res = await api.post<AppNotification>(
    `/appointments/notifications/${notificationId}/read/`
  );
  return res.data;
};

// ── Notification Preferences ────────────────────────────────────────

export const getNotificationPreferences = async () => {
  const res = await api.get<NotificationPreference>(
    "/appointments/notification-preferences/"
  );
  return res.data;
};

export const updateNotificationPreferences = async (
  data: Partial<NotificationPreference>
) => {
  const res = await api.put<NotificationPreference>(
    "/appointments/notification-preferences/",
    data
  );
  return res.data;
};

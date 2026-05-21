// src/types/appointment.ts

export type AppointmentMode = "ONLINE" | "IN_PERSON";

export type AppointmentStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED"
  | "NO_SHOW";

export type ChangeRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface AppointmentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AppointmentDoctor {
  id: string;
  user: AppointmentUser;
  specialization: string;
  consultation_fee: string;
  is_verified: boolean;
  average_rating: number;
  review_count: number;
}

export interface AppointmentPatient {
  id: string;
  user: AppointmentUser;
  first_name: string;
  last_name: string;
}

export interface Appointment {
  id: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  scheduled_start: string; // ISO datetime
  scheduled_end: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
  reason: string;
  meeting_link: string;
  patient_allergies?: string;
  patient_medical_history?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentBookingPayload {
  doctor: string; // doctor profile ID
  scheduled_start: string; // ISO datetime
  scheduled_end: string;
  mode: AppointmentMode;
  reason?: string;
}

export interface AppointmentCancelPayload {
  reason?: string;
}

export interface AppointmentChangeRequest {
  id: string;
  appointment: string;
  requested_by: string;
  proposed_start: string;
  proposed_end: string;
  proposed_mode: AppointmentMode;
  notes: string;
  expires_at: string;
  status: ChangeRequestStatus;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChangeRequestCreatePayload {
  proposed_start: string;
  proposed_end: string;
  proposed_mode: AppointmentMode;
  notes?: string;
  expires_at: string;
}

export interface ChangeResponsePayload {
  action: "accept" | "reject";
}

export interface DoctorDecisionPayload {
  action: "accept" | "propose_changes";
  // These fields are required only when action === "propose_changes"
  proposed_start?: string;
  proposed_end?: string;
  proposed_mode?: AppointmentMode;
  notes?: string;
  expires_at?: string;
}

export interface AvailabilityRule {
  id: string;
  weekday: number; // 0=Monday ... 6=Sunday
  start_time: string; // HH:MM:SS
  end_time: string;
  is_active: boolean;
}

export interface AvailabilityRulePayload {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface AppNotification {
  id: string;
  user: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  email_appointments: boolean;
  in_app_appointments: boolean;
  email_reminders: boolean;
  in_app_reminders: boolean;
  email_promotions: boolean;
  in_app_promotions: boolean;
}

export interface JoinConsultationResponse {
  meeting_link: string;
  scheduled_start: string;
  scheduled_end: string;
}

export interface CancelResponse {
  message: string;
  late_cancellation: boolean;
  penalty_applied: boolean;
  appointment: Appointment;
}

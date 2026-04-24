import type { User, DoctorProfile } from '../../../types/models';

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type AppointmentMode = 'ONLINE' | 'IN_PERSON';

// Simplified nested objects from backend
export interface PatientProfileMin {
  id: string | number;
  user: User;
}

export interface DoctorProfileMin {
  id: string | number;
  user: User;
}

export interface AppointmentDetail {
  id: string | number;
  patient: PatientProfileMin;
  doctor: DoctorProfileMin;
  scheduled_start: string; // ISO String
  scheduled_end: string; // ISO String
  mode: AppointmentMode;
  reason: string;
  status: AppointmentStatus;
  meeting_link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentBookingPayload {
  doctor_id: string | number;
  scheduled_start: string;
  scheduled_end: string;
  appointment_type: AppointmentMode;
  reason?: string;
}

export interface AppointmentCancelPayload {
  reason?: string;
}

export type ChangeRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface AppointmentChangeRequestDetail {
  id: string | number;
  appointment: AppointmentDetail;
  requested_by: User;
  proposed_start: string;
  proposed_end: string;
  proposed_mode: AppointmentMode;
  notes?: string;
  expires_at: string;
  status: ChangeRequestStatus;
  responded_at?: string;
  created_at: string;
}

export interface AppointmentChangeRequestCreatePayload {
  proposed_start: string;
  proposed_end: string;
  proposed_mode: AppointmentMode;
  notes?: string;
  expires_at: string;
}

export interface AppointmentDoctorDecisionPayload {
  action: 'accept' | 'propose_change';
  // If proposing change:
  proposed_start?: string;
  proposed_end?: string;
  proposed_mode?: AppointmentMode;
  notes?: string;
  expires_at?: string;
}

export interface AppointmentChangeResponsePayload {
  action: 'accept' | 'reject';
}

export interface ProviderAvailabilityRuleDetail {
  id: string | number;
  doctor: string | number; // Or profile min
  weekday: number; // 0-6
  start_time: string; // time string "HH:MM:SS"
  end_time: string;
  is_active: boolean;
}

export interface ProviderAvailabilityRuleCreatePayload {
  weekday: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export type NotificationType = 'APPOINTMENT' | 'GENERAL' | 'SYSTEM';

export interface NotificationDetail {
  id: string | number;
  user: string | number;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferenceDetail {
  email_appointments: boolean;
  in_app_appointments: boolean;
}

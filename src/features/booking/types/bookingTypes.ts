import type { User } from '../../../types/models';

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'EXPIRED';
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
  // Flat patient fields from backend
  patient_user_id?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  // Add to AppointmentDetail interface in bookingTypes.ts
  patient_profile?: {
    id: string;
    user_id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    medical_history?: string;
    chronic_conditions?: string;
    allergies?: string;
    address?: string;
    city?: string;
    country?: string;
    medical_documents?: string;
  };
  // Flat doctor fields from backend
  doctor_user_id?: string;
  doctor_first_name?: string;
  doctor_last_name?: string;
  // Legacy nested objects (may be present on older responses)
  patient?: PatientProfileMin;
  doctor?: DoctorProfileMin;
  // Appointment details
  scheduled_start: string;
  scheduled_end: string;
  mode: AppointmentMode;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  payment_status: 'unpaid' | 'charge_pending' | 'paid' | 'failed' | 'refunded';
  payment_amount?: string;
  payment_currency?: string;
  payment_method_provider?: string;
  payment_method_account?: string;
  meeting_link?: string;
  patient_allergies?: string;
  patient_medical_history?: string;
  latest_change_request?: AppointmentChangeRequestDetail;
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
  confirm: boolean;
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
  action: 'accept' | 'propose_change' | 'reject';
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
  specific_date?: string; // "YYYY-MM-DD" for one-time slots
  start_time: string; // time string "HH:MM:SS"
  end_time: string;
  is_active: boolean;
}

export interface ProviderAvailabilityRuleCreatePayload {
  id?: string | number;
  weekday?: number;
  specific_date?: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

// Backend schema: SYSTEM | APPOINTMENT | PAYMENT | MESSAGE
export type NotificationType = 'APPOINTMENT' | 'PAYMENT' | 'SYSTEM' | 'MESSAGE' | 'GENERAL';

export interface NotificationDetail {
  id: string | number;
  user: User;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferenceDetail {
  email_appointments: boolean;
  in_app_appointments: boolean;
  email_payments: boolean;
  in_app_payments: boolean;
}

// ─── PAYMENT TYPES ───────────────────────────────────────

export interface PaymentMethodDetail {
  id: string | number;
  payment_type: string;
  provider: string;
  is_verified: boolean;
  created_at: string;
}

export interface PaymentDetail {
  id: string | number;
  appointment: string | number;
  amount: string;
  currency: string;
  status: string;
  chapa_tx_ref?: string;
  chapa_checkout_url?: string;
  created_at: string;
}

export interface DoctorWalletDetail {
  total_earned: string;
  updated_at: string;
}

export interface InitiatePaymentResponse {
  checkout_url: string;
  tx_ref: string;
}

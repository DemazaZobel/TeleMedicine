// ─── Patient Profile (Backend-aligned) ──────────────────

export interface PatientProfile {
  id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;  // ISO date string
  gender: string;
  blood_type: string;
  medical_history: string | null;
  chronic_conditions: string;
  allergies: string;
  address: string;
  city: string;
  country: string;
}

export type PatientProfileUpdate = Partial<Omit<PatientProfile, 'id'>>;

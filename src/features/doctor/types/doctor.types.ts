// ─── Document Status & Verification Stage ──────────────────
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type VerificationStage = 
  | 'NEW_DOCTOR' 
  | 'PROFILE_FILLED' 
  | 'DOCUMENT_UPLOADED' 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'ACTIVE_PROVIDER';

// ─── Backend Aligned Models ──────────────────────────────
export interface DoctorProfile {
  id: string;
  specialization: string;
  years_of_experience: number;
  consultation_fee: string; // Django decimals often return as strings
  is_verified: boolean;
  average_rating: string | number; // Decimal
  review_count: number;
}

export interface DoctorProfileUpdate {
  specialization?: string;
  years_of_experience?: number;
  consultation_fee?: string | number;
}

export interface DoctorDocument {
  id: string;
  document_type: string;
  license_number: string;
  file: string; // URL
  status: DocumentStatus;
  uploaded_at: string;
}

// ─── Provider Search (Patient-side) ─────────────────────
export interface ProviderSearchParams {
  query?: string;
  specialization?: string;
  min_fee?: number;
  max_fee?: number;
  min_rating?: number;
  sort_by?: 'fee' | 'rating' | 'experience';
}

export interface ProviderSearchResult {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string;
  years_of_experience: number;
  consultation_fee: string;
  is_verified: boolean;
  average_rating: string | number;
  review_count: number;
}

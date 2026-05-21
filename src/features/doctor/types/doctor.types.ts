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
  location: string;
  current_working_hospital: string;
  biography: string;
  experience: any[] | string;
  education: any[] | string;
  profile_image: string;
  consultation_fee: string;
  is_verified: boolean;
  average_rating: string;
  review_count: number;
  youtube_link?: string;
  linkedin_link?: string;
}

export interface DoctorProfileUpdate {
  specialization?: string;
  years_of_experience?: number;
  location?: string;
  current_working_hospital?: string;
  biography?: string;
  experience?: any[] | string;
  education?: any[] | string;
  consultation_fee?: string | number;
  youtube_link?: string;
  linkedin_link?: string;
}

export interface DoctorDocument {
  id: string;
  document_type: string;
  license_number: string;
  file: string; // URL
  status: DocumentStatus;
  rejection_reason?: string;
  uploaded_at: string;
}

// ─── Provider Search (Patient-side) ─────────────────────
export interface ProviderSearchParams {
  q?: string;
  specialization?: string;
  location?: string;
  current_working_hospital?: string;
  min_fee?: number;
  max_fee?: number;
  min_rating?: number;
  sort_by?: 'fee' | 'fee_asc' | 'fee_desc' | 'rating' | 'rating_desc' | 'distance' | 'experience_desc';
  lat?: number;
  lng?: number;
  // Legacy/Frontend fields that can map to backend fields
  query?: string;
  search?: string;
  hospital?: string;
  min_experience?: number;
  availability?: 'any' | 'today' | 'this-week';
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
  average_rating: string;
  review_count: number;
  biography?: string;
  location?: string;
  current_working_hospital?: string;
  education?: string;
  experience?: string;
  profile_image?: string;
  youtube_link?: string;
  linkedin_link?: string;
}

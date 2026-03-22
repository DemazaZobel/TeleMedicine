// ─── Document Status ─────────────────────────────────────
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

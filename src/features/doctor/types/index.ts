// ─── Document Status ─────────────────────────────────────
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ─── Provider Profile ────────────────────────────────────
export interface ProviderProfile {
  id: string;
  specialization: string;
  licenseNumber: string;
  bio: string;
  yearsOfExperience: number;
  consultationFee: number;
  isAvailable: boolean;
  isApproved: boolean;
}

export interface ProviderProfileUpdate {
  specialization?: string;
  licenseNumber?: string;
  bio?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  isAvailable?: boolean;
}

// ─── Provider Documents ──────────────────────────────────
export interface ProviderDocument {
  id: string;
  name: string;
  documentType: string;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface DocumentUploadPayload {
  file: {
    uri: string;
    name: string;
    type: string;
  };
  documentType: string;
}

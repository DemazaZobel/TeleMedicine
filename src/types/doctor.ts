export interface DoctorProfile {
  id: string;
  specialization: string;
  years_of_experience: number;
  consultation_fee: string; // Decimal comes as string from Django
  is_verified: boolean;
  average_rating: number;
  review_count: number;
}

export interface DoctorDocument {
  id: string;
  document_type: string;
  license_number: string;
  file: string; // URL to the file
  status: "PENDING" | "APPROVED" | "REJECTED";
  uploaded_at: string;
}

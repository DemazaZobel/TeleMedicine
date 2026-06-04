export interface Review {
  id: string;
  appointmentId: string;
  patientName: string;
  patientAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSubmission {
  appointmentId: string;
  rating: number;
  comment: string;
}

export interface DoctorReviewsResponse {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

// src/services/reviewService.ts
import type { Review, ReviewSubmission } from "../types/review";
import apiClient from "./api";

const normalizeReview = (review: any): Review => ({
  id: review.id?.toString() ?? review.pk?.toString() ?? "",
  appointmentId:
    review.appointment_id ?? review.appointmentId ?? review.appointment ?? "",
  patientName:
    review.patient_name ??
    review.patientName ??
    review.reviewer_name ??
    "Anonymous",
  rating: review.rating ?? 5,
  comment: review.comment ?? review.text ?? "",
  createdAt: review.created_at ?? review.createdAt ?? "",
});

export const submitReview = async (data: ReviewSubmission): Promise<Review> => {
  const response = await apiClient.post("/reviews/", {
    appointment: data.appointmentId,
    rating: data.rating,
    comment: data.comment,
  });

  return normalizeReview(response.data);
};

export const getDoctorReviews = async (providerId?: string) => {
  const url = providerId
    ? `/reviews/?doctor_id=${providerId}`
    : `/reviews/`;

  const response = await apiClient.get(url);
  const json = response.data;
  
  const reviewsList = Array.isArray(json) ? json : json.results || [];

  return {
    averageRating: json.average_rating ?? json.averageRating ?? 0,
    totalReviews: json.count ?? reviewsList.length ?? 0,
    reviews: reviewsList.map(normalizeReview),
  };
};

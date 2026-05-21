import { apiClient } from '../../../services/api';
import type {
  DoctorProfile,
  DoctorProfileUpdate,
  DoctorDocument,
  ProviderSearchParams,
  ProviderSearchResult,
} from '../types/doctor.types';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const DOCTOR_BASE = '/providers';

export const doctorApi = {
  // Profile
  getDoctorProfile: async () => {
    const response = await apiClient.get<DoctorProfile>(
      `${DOCTOR_BASE}/profile/`
    );
    return response.data;
  },

  updateDoctorProfile: async (payload: DoctorProfileUpdate) => {
    const response = await apiClient.put<DoctorProfile>(
      `${DOCTOR_BASE}/profile/`,
      payload
    );
    return response.data;
  },

  // Documents
  uploadDoctorDocument: async (formData: FormData) => {
    const response = await apiClient.post<DoctorDocument>(
      `${DOCTOR_BASE}/documents/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getDoctorDocuments: async () => {
    const response = await apiClient.get<DoctorDocument[]>(
      `${DOCTOR_BASE}/documents/list/`
    );
    return response.data;
  },

  // Search (Patient-facing)
  searchProviders: async (params?: ProviderSearchParams) => {
    const response = await apiClient.get<PaginatedResponse<ProviderSearchResult>>(
      `${DOCTOR_BASE}/search/`,
      { params }
    );
    return response.data;
  },

  getProviderDetail: async (id: string) => {
    const response = await apiClient.get<ProviderSearchResult>(
      `${DOCTOR_BASE}/provider/${id}/`
    );
    return response.data;
  },

  fetchNextPage: async (url: string) => {
    const response = await apiClient.get<PaginatedResponse<ProviderSearchResult>>(url);
    return response.data;
  },

  getSpecializations: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>(`${DOCTOR_BASE}/specializations/`);
      return response.data;
    } catch {
      // Fallback to static list if endpoint is not yet deployed
      console.warn('[DoctorApi] specializations endpoint unavailable, using fallback');
      return ['General', 'Cardiology', 'Pediatrics', 'Dentistry', 'Neurology', 'Orthopedics', 'Dermatology'];
    }
  },
};


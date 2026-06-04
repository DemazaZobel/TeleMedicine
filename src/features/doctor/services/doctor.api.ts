import { apiClient, STORAGE_KEYS } from '../../../services/api';
import { getItemAsync } from '../../../services/storage';
import { Platform } from 'react-native';
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

  uploadProfileImage: async (imageUri: string): Promise<DoctorProfile> => {
    // Use native fetch instead of Axios — Axios on React Native corrupts
    // FormData file blobs (the request interceptor JSON.stringifies them).
    const token = await getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    const filename = imageUri.split('/').pop() ?? 'profile.jpg';
    const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
    const mimeType = match ? `image/${match[1].toLowerCase().replace('jpg', 'jpeg')}` : 'image/jpeg';

    const formData = new FormData();
    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('profile_image', blob, filename);
    } else {
      formData.append('profile_image', {
        uri: imageUri,
        name: filename,
        type: mimeType,
      } as any);
    }

    const res = await fetch(
      `https://medlinkethiopia.pythonanywhere.com/api${DOCTOR_BASE}/profile/`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type — fetch sets the correct multipart boundary automatically
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Upload failed (${res.status}): ${errorBody}`);
    }
    return res.json() as Promise<DoctorProfile>;
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


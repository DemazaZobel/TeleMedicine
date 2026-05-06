import { create } from 'zustand';
import { doctorApi } from '../features/doctor/services/doctor.api';
import type {
  DoctorProfile,
  DoctorProfileUpdate,
  DoctorDocument,
  VerificationStage,
  ProviderSearchParams,
  ProviderSearchResult,
} from '../features/doctor/types/doctor.types';

// ─── State ───────────────────────────────────────────────
interface DoctorState {
  profile: DoctorProfile | null;
  documents: DoctorDocument[];
  searchResults: ProviderSearchResult[];
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  isUploadingDocument: boolean;
  isSearching: boolean;
  error: string | null;
}

// ─── Computed & Actions ──────────────────────────────────
interface DoctorActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: DoctorProfileUpdate) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (formData: FormData) => Promise<void>;
  searchProviders: (params?: ProviderSearchParams) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  isDoctorVerified: () => boolean;
  verificationStage: () => VerificationStage;
}

type DoctorStore = DoctorState & DoctorActions;

const initialState: DoctorState = {
  profile: null,
  documents: [],
  searchResults: [],
  isLoadingProfile: false,
  isUpdatingProfile: false,
  isUploadingDocument: false,
  isSearching: false,
  error: null,
};

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  ...initialState,

  isDoctorVerified: () => {
    return get().profile?.is_verified === true;
  },

  verificationStage: () => {
    const { profile, documents } = get();
    
    if (!profile) return 'NEW_DOCTOR';
    if (profile.is_verified) return 'APPROVED';
    
    const isProfileFilled = Boolean(
      profile.specialization &&
      profile.years_of_experience > 0 &&
      profile.consultation_fee &&
      Number(profile.consultation_fee) > 0
    );

    if (!isProfileFilled) return 'NEW_DOCTOR';
    if (documents.length === 0) return 'PROFILE_FILLED';

    const allPending = documents.every((d) => d.status === 'PENDING');
    if (allPending) return 'DOCUMENT_UPLOADED';

    return 'PENDING_REVIEW';
  },

  fetchProfile: async () => {
    try {
      set({ isLoadingProfile: true, error: null });
      const profile = await doctorApi.getDoctorProfile();
      set({ profile, isLoadingProfile: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) || 'Failed to load doctor profile.';
      set({ isLoadingProfile: false, error: message });
    }
  },

  updateProfile: async (data: DoctorProfileUpdate) => {
    try {
      set({ isUpdatingProfile: true, error: null });
      const profile = await doctorApi.updateDoctorProfile(data);
      set({ profile, isUpdatingProfile: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) || 'Failed to update profile.';
      set({ isUpdatingProfile: false, error: message });
      throw error;
    }
  },

  fetchDocuments: async () => {
    try {
      const documents = await doctorApi.getDoctorDocuments();
      set({ documents });
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Failed to fetch documents', err);
    }
  },

  uploadDocument: async (formData: FormData) => {
    try {
      set({ isUploadingDocument: true, error: null });
      await doctorApi.uploadDoctorDocument(formData);
      // Refresh documents and profile after upload
      await get().fetchDocuments();
      await get().fetchProfile();
      set({ isUploadingDocument: false });
    } catch (error: any) {
      const data = error.response?.data;
      let message = 'Failed to upload document.';

      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.detail) {
          message = Array.isArray(data.detail) ? data.detail[0] : data.detail;
        } else {
          // Check for field specific errors (e.g. { file: ["..."] })
          const fieldErrors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join('\n');
          if (fieldErrors) message = fieldErrors;
        }
      }

      set({ isUploadingDocument: false, error: message });
      throw error;
    }
  },

  searchProviders: async (params?: ProviderSearchParams) => {
    try {
      set({ isSearching: true, error: null });
      const searchResults = await doctorApi.searchProviders(params);
      set({ searchResults, isSearching: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const message =
        (axiosError?.response?.data?.detail as string) || 'Failed to search providers.';
      set({ isSearching: false, error: message });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));


import { create } from 'zustand';
import { doctorApi } from '../features/doctor/services/doctor.api';
import type {
  DoctorProfile,
  DoctorProfileUpdate,
  DoctorDocument,
  VerificationStage,
} from '../features/doctor/types/doctor.types';

// ─── State ───────────────────────────────────────────────
interface DoctorState {
  profile: DoctorProfile | null;
  documents: DoctorDocument[];
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  isUploadingDocument: boolean;
  error: string | null;
}

// ─── Computed & Actions ──────────────────────────────────
interface DoctorActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: DoctorProfileUpdate) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (formData: FormData) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  isDoctorVerified: () => boolean;
  verificationStage: () => VerificationStage;
}

type DoctorStore = DoctorState & DoctorActions;

const initialState: DoctorState = {
  profile: null,
  documents: [],
  isLoadingProfile: false,
  isUpdatingProfile: false,
  isUploadingDocument: false,
  error: null,
};

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  ...initialState,

  isDoctorVerified: () => {
    return get().profile?.is_verified === true;
  },

  verificationStage: () => {
    const { profile, documents } = get();
    
    // Fallback if profile not loaded yet or doesn't exist
    if (!profile) return 'NEW_DOCTOR';
    
    // Core success state
    if (profile.is_verified) return 'APPROVED';
    
    // Check if profile fields are genuinely filled
    const isProfileFilled = Boolean(
      profile.specialization &&
      profile.years_of_experience > 0 &&
      profile.consultation_fee &&
      Number(profile.consultation_fee) > 0
    );

    if (!isProfileFilled) return 'NEW_DOCTOR';

    // Profile is filled, check documents
    if (documents.length === 0) return 'PROFILE_FILLED';

    // Documents exist, check their statuses
    const allPending = documents.every((d) => d.status === 'PENDING');
    if (allPending) return 'DOCUMENT_UPLOADED';

    // Otherwise, some might be rejected or still pending but not verified
    return 'PENDING_REVIEW';
  },

  fetchProfile: async () => {
    try {
      set({ isLoadingProfile: true, error: null });
      const profile = await doctorApi.getDoctorProfile();
      set({ profile, isLoadingProfile: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || 'Failed to load doctor profile.';
      set({ isLoadingProfile: false, error: message });
    }
  },

  updateProfile: async (data: DoctorProfileUpdate) => {
    try {
      set({ isUpdatingProfile: true, error: null });
      const profile = await doctorApi.updateDoctorProfile(data);
      set({ profile, isUpdatingProfile: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || 'Failed to update profile.';
      set({ isUpdatingProfile: false, error: message });
      throw error;
    }
  },

  fetchDocuments: async () => {
    try {
      const documents = await doctorApi.getDoctorDocuments();
      set({ documents });
    } catch (error: any) {
      console.warn('Failed to fetch documents', error?.message);
    }
  },

  uploadDocument: async (formData: FormData) => {
    try {
      set({ isUploadingDocument: true, error: null });
      await doctorApi.uploadDoctorDocument(formData);
      // Refresh documents after upload as requested
      await get().fetchDocuments();
      
      // We also could refresh profile in case status changed, but usually
      // status changes asynchronously via admin. We'll refresh profile just in case.
      await get().fetchProfile();
      
      set({ isUploadingDocument: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.detail?.[0] || 'Failed to upload document.';
      set({ isUploadingDocument: false, error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

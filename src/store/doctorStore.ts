import { create } from 'zustand';
import { providerService } from '../features/doctor/services/providerService';
import type {
  ProviderProfile,
  ProviderProfileUpdate,
  ProviderDocument,
  DocumentUploadPayload,
} from '../features/doctor/types';

// ─── State ───────────────────────────────────────────────
interface DoctorState {
  profile: ProviderProfile | null;
  documents: ProviderDocument[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
}

// ─── Actions ─────────────────────────────────────────────
interface DoctorActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProviderProfileUpdate) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (payload: DocumentUploadPayload) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type DoctorStore = DoctorState & DoctorActions;

const initialState: DoctorState = {
  profile: null,
  documents: [],
  isLoading: false,
  isUploading: false,
  error: null,
};

export const useDoctorStore = create<DoctorStore>((set) => ({
  ...initialState,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const profile = await providerService.getProfile();
      set({ profile, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load profile.';
      set({ isLoading: false, error: message });
    }
  },

  updateProfile: async (data: ProviderProfileUpdate) => {
    try {
      set({ isLoading: true, error: null });
      const profile = await providerService.updateProfile(data);
      set({ profile, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  fetchDocuments: async () => {
    try {
      set({ isLoading: true, error: null });
      const documents = await providerService.getDocuments();
      set({ documents, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load documents.';
      set({ isLoading: false, error: message });
    }
  },

  uploadDocument: async (payload: DocumentUploadPayload) => {
    try {
      set({ isUploading: true, error: null });
      const newDoc = await providerService.uploadDocument(payload);
      set((state) => ({
        documents: [newDoc, ...state.documents],
        isUploading: false,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload document.';
      set({ isUploading: false, error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

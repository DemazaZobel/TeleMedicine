import { create } from 'zustand';
import { patientApi } from '../features/patient/services/patient.api';
import type {
  PatientProfile,
  PatientProfileUpdate,
} from '../features/patient/types/patient.types';
import { parseBackendError } from '../lib/utils';

// ─── State ───────────────────────────────────────────────
interface PatientState {
  medicalInfo: PatientProfile | null;
  isLoadingInfo: boolean;
  isUpdatingInfo: boolean;
  error: string | null;
}

// ─── Actions ─────────────────────────────────────────────
interface PatientActions {
  fetchMedicalInfo: () => Promise<void>;
  updateMedicalInfo: (data: PatientProfileUpdate | FormData) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type PatientStore = PatientState & PatientActions;

const initialState: PatientState = {
  medicalInfo: null,
  isLoadingInfo: false,
  isUpdatingInfo: false,
  error: null,
};

export const usePatientStore = create<PatientStore>((set, get) => ({
  ...initialState,

  fetchMedicalInfo: async () => {
    if (get().isLoadingInfo) return;
    set({ isLoadingInfo: true, error: null });
    try {
      const data = await patientApi.getMedicalInfo();
      set({ medicalInfo: data, isLoadingInfo: false });
    } catch (err: any) {
      const msg = parseBackendError(err);
      set({ error: msg, isLoadingInfo: false });
    }
  },

  updateMedicalInfo: async (payload) => {
    set({ isUpdatingInfo: true, error: null });
    try {
      const data = await patientApi.updateMedicalInfo(payload);
      set({ medicalInfo: data, isUpdatingInfo: false });
    } catch (err: any) {
      const msg = parseBackendError(err);
      set({ error: msg, isUpdatingInfo: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

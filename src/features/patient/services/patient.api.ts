import { apiClient } from '../../../services/api';
import type { PatientProfile, PatientProfileUpdate } from '../types/patient.types';

const PATIENT_BASE = '/patients';

export const patientApi = {
  getMedicalInfo: async () => {
    const response = await apiClient.get<PatientProfile>(
      `${PATIENT_BASE}/me/medical-info/`
    );
    return response.data;
  },

  updateMedicalInfo: async (payload: PatientProfileUpdate) => {
    const response = await apiClient.put<PatientProfile>(
      `${PATIENT_BASE}/me/medical-info/`,
      payload
    );
    return response.data;
  },
};

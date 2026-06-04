import { STORAGE_KEYS } from '../../../services/api';
import { getItemAsync } from '../../../services/storage';
import { apiClient } from '../../../services/api';
import type { PatientProfile, PatientProfileUpdate } from '../types/patient.types';

const PATIENT_BASE = '/patients';
const API_BASE_URL = 'https://medlinkethiopia.pythonanywhere.com/api';

export const patientApi = {
  getMedicalInfo: async () => {
    const response = await apiClient.get<PatientProfile>(
      `${PATIENT_BASE}/me/medical-info/`
    );
    return response.data;
  },

  updateMedicalInfo: async (payload: PatientProfileUpdate | FormData) => {
    // When the payload contains files (FormData), Axios on React Native corrupts
    // the file blobs by JSON.stringify-ing them. Use native fetch instead so the
    // multipart boundary and binary content are sent correctly.
    if (payload instanceof FormData) {
      const token = await getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const res = await fetch(
        `${API_BASE_URL}${PATIENT_BASE}/me/medical-info/`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type — fetch sets correct multipart boundary automatically
          },
          body: payload,
        }
      );
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Update failed (${res.status}): ${errorBody}`);
      }
      return res.json() as Promise<PatientProfile>;
    }

    // Plain JSON payload — Axios is fine here
    const response = await apiClient.put<PatientProfile>(
      `${PATIENT_BASE}/me/medical-info/`,
      payload
    );
    return response.data;
  },
};

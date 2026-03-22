import { apiClient } from '../../../services/api';
import type {
  ProviderProfile,
  ProviderProfileUpdate,
  ProviderDocument,
  DocumentUploadPayload,
} from '../types';

const PROVIDERS_BASE = '/providers';

export const providerService = {
  /**
   * GET /api/providers/profile/
   * Fetch the authenticated doctor's profile.
   */
  async getProfile(): Promise<ProviderProfile> {
    const { data } = await apiClient.get<ProviderProfile>(
      `${PROVIDERS_BASE}/profile/`
    );
    return data;
  },

  /**
   * PUT /api/providers/profile/
   * Update the authenticated doctor's profile.
   */
  async updateProfile(payload: ProviderProfileUpdate): Promise<ProviderProfile> {
    const { data } = await apiClient.put<ProviderProfile>(
      `${PROVIDERS_BASE}/profile/`,
      payload
    );
    return data;
  },

  /**
   * POST /api/providers/documents/
   * Upload a credential document (multipart/form-data).
   */
  async uploadDocument(payload: DocumentUploadPayload): Promise<ProviderDocument> {
    const formData = new FormData();

    formData.append('file', {
      uri: payload.file.uri,
      name: payload.file.name,
      type: payload.file.type,
    } as unknown as Blob);

    formData.append('document_type', payload.documentType);

    const { data } = await apiClient.post<ProviderDocument>(
      `${PROVIDERS_BASE}/documents/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * GET /api/providers/documents/list/
   * List all uploaded credential documents.
   */
  async getDocuments(): Promise<ProviderDocument[]> {
    const { data } = await apiClient.get<ProviderDocument[]>(
      `${PROVIDERS_BASE}/documents/list/`
    );
    return data;
  },
};

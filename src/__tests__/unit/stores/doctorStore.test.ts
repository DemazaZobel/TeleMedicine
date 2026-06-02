// src/__tests__/unit/stores/doctorStore.test.ts
// Tests: TC-DOCTOR-001, TC-DOCTOR-002, TC-DOCTOR-003, TC-DOCTOR-004,
//         TC-NAV-003 (isDoctorVerified), TC-NAV-005 (verificationStage)
// Run: npx jest src/__tests__/unit/stores/doctorStore.test.ts

import { act } from 'react-test-renderer';
import { useDoctorStore } from '../../../store/doctor.store';
import { doctorApi } from '../../../features/doctor/services/doctor.api';

jest.mock('../../../features/doctor/services/doctor.api');
const mockedDoctorApi = doctorApi as jest.Mocked<typeof doctorApi>;

// ─── Fixtures ────────────────────────────────────────────────────────────────
const INCOMPLETE_PROFILE = {
  id: 'dp-1',
  specialization: '',
  years_of_experience: 0,
  consultation_fee: '0',
  is_verified: false,
  biography: '',
  location: '',
  current_working_hospital: '',
  experience: [],
  education: [],
  profile_image: '',
  average_rating: '0',
  review_count: 0,
};

const COMPLETE_PROFILE = {
  ...INCOMPLETE_PROFILE,
  specialization: 'Cardiology',
  years_of_experience: 5,
  consultation_fee: '500',
};

const VERIFIED_PROFILE = {
  ...COMPLETE_PROFILE,
  is_verified: true,
};

const PENDING_DOCUMENT = {
  id: 'doc-1',
  document_type: 'LICENSE',
  license_number: 'ETH-12345',
  file: 'https://example.com/doc.pdf',
  status: 'PENDING' as const,
  uploaded_at: '2026-05-30T10:00:00Z',
};

beforeEach(() => {
  useDoctorStore.setState({
    profile: null,
    documents: [],
    searchResults: [],
    isLoadingProfile: false,
    isUpdatingProfile: false,
    isUploadingDocument: false,
    isSearching: false,
    error: null,
  });
  jest.resetAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-001 — verificationStage: NEW_DOCTOR (no profile)
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-003: verificationStage when no profile', () => {
  it('returns NEW_DOCTOR when profile is null', () => {
    useDoctorStore.setState({ profile: null });
    expect(useDoctorStore.getState().verificationStage()).toBe('NEW_DOCTOR');
  });

  it('returns NEW_DOCTOR when profile is incomplete', () => {
    useDoctorStore.setState({ profile: INCOMPLETE_PROFILE });
    expect(useDoctorStore.getState().verificationStage()).toBe('NEW_DOCTOR');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-001 — verificationStage: PROFILE_FILLED
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-001: verificationStage after profile filled', () => {
  it('returns PROFILE_FILLED when profile is complete but no documents', () => {
    useDoctorStore.setState({ profile: COMPLETE_PROFILE, documents: [] });
    expect(useDoctorStore.getState().verificationStage()).toBe('PROFILE_FILLED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-002 — verificationStage: DOCUMENT_UPLOADED
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-002: verificationStage after document upload', () => {
  it('returns DOCUMENT_UPLOADED when documents are pending review', () => {
    useDoctorStore.setState({
      profile: COMPLETE_PROFILE,
      documents: [PENDING_DOCUMENT],
    });
    expect(useDoctorStore.getState().verificationStage()).toBe('DOCUMENT_UPLOADED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-004 — isDoctorVerified
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-004: isDoctorVerified', () => {
  it('returns true when profile.is_verified is true', () => {
    useDoctorStore.setState({ profile: VERIFIED_PROFILE });
    expect(useDoctorStore.getState().isDoctorVerified()).toBe(true);
  });

  it('returns false when profile.is_verified is false', () => {
    useDoctorStore.setState({ profile: COMPLETE_PROFILE });
    expect(useDoctorStore.getState().isDoctorVerified()).toBe(false);
  });

  it('returns false when profile is null', () => {
    useDoctorStore.setState({ profile: null });
    expect(useDoctorStore.getState().isDoctorVerified()).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-001 — Fetch and Update Doctor Profile
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-001: fetch doctor profile', () => {
  it('loads profile into store', async () => {
    mockedDoctorApi.getDoctorProfile.mockResolvedValueOnce(COMPLETE_PROFILE);

    await act(async () => {
      await useDoctorStore.getState().fetchProfile();
    });

    const state = useDoctorStore.getState();
    expect(state.profile?.specialization).toBe('Cardiology');
    expect(state.isLoadingProfile).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    mockedDoctorApi.getDoctorProfile.mockRejectedValueOnce({
      response: { data: { detail: 'Not found.' } },
    });

    await act(async () => {
      await useDoctorStore.getState().fetchProfile();
    });

    expect(useDoctorStore.getState().error).toBeTruthy();
    expect(useDoctorStore.getState().isLoadingProfile).toBe(false);
  });
});

describe('TC-DOCTOR-001: update doctor profile', () => {
  it('updates profile in store on success', async () => {
    useDoctorStore.setState({ profile: INCOMPLETE_PROFILE });
    mockedDoctorApi.updateDoctorProfile.mockResolvedValueOnce(COMPLETE_PROFILE);

    await act(async () => {
      await useDoctorStore.getState().updateProfile({
        specialization: 'Cardiology',
        years_of_experience: 5,
        consultation_fee: 500,
      });
    });

    const state = useDoctorStore.getState();
    expect(state.profile?.specialization).toBe('Cardiology');
    expect(state.isUpdatingProfile).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-002 — Upload Document
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-002: upload verification document', () => {
  it('adds uploaded document to store', async () => {
    mockedDoctorApi.uploadDoctorDocument.mockResolvedValueOnce(PENDING_DOCUMENT);
    mockedDoctorApi.getDoctorDocuments.mockResolvedValueOnce([PENDING_DOCUMENT]);
    mockedDoctorApi.getDoctorProfile.mockResolvedValueOnce(COMPLETE_PROFILE);

    const formData = new FormData();
    formData.append('document_type', 'LICENSE');

    await act(async () => {
      await useDoctorStore.getState().uploadDocument(formData);
    });

    const state = useDoctorStore.getState();
    expect(mockedDoctorApi.uploadDoctorDocument).toHaveBeenCalledWith(formData);
    expect(mockedDoctorApi.getDoctorDocuments).toHaveBeenCalled();
    expect(state.documents).toHaveLength(1);
    expect(state.documents[0].status).toBe('PENDING');
    expect(state.isUploadingDocument).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-002 — Fetch Documents
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-002: fetch doctor documents', () => {
  it('loads documents list into store', async () => {
    mockedDoctorApi.getDoctorDocuments.mockResolvedValueOnce([PENDING_DOCUMENT]);

    await act(async () => {
      await useDoctorStore.getState().fetchDocuments();
    });

    expect(useDoctorStore.getState().documents).toHaveLength(1);
    expect(useDoctorStore.getState().documents[0].document_type).toBe('LICENSE');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-004 — verificationStage: APPROVED
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-004: verificationStage APPROVED', () => {
  it('returns APPROVED when profile is verified', () => {
    useDoctorStore.setState({ profile: VERIFIED_PROFILE });
    expect(useDoctorStore.getState().verificationStage()).toBe('APPROVED');
  });
});
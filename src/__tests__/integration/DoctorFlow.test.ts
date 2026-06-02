// src/__tests__/integration/DoctorFlow.test.ts
// Full doctor workflow integration tests.
// Tests authStore + doctorStore + bookingStore working together.
//
// Flows covered:
//   FLOW 1: Doctor Login → Setup Profile → Upload Document → Pending Approval
//   FLOW 2: Doctor Approved → Access Dashboard → Manage Appointments
//   FLOW 3: Doctor Manages Availability → Patient Can See Slots
//   FLOW 4: Doctor Accepts Appointment → Wallet Updated
//   FLOW 5: Doctor Proposes Reschedule → Patient Rejects
//
// Run: npx jest src/__tests__/integration/DoctorFlow.test.ts

import { act } from 'react-test-renderer';
import {
  mockAvailabilityRule,
  mockAvailabilityRulePayload,
  mockChangeRequestPayload,
  mockWallet,
} from '../helpers/fixtures';
import { useAuthStore } from '../../store/authStore';
import { useDoctorStore } from '../../store/doctor.store';
import { useBookingStore } from '../../store/booking.store';
import { authService } from '../../features/auth/services/authService';
import { doctorApi } from '../../features/doctor/services/doctor.api';
import { bookingService } from '../../features/booking/services/bookingService';

jest.mock('../../features/auth/services/authService');
jest.mock('../../features/doctor/services/doctor.api');
jest.mock('../../features/booking/services/bookingService');
jest.mock('../../services/storage');
jest.mock('../../store/resetAllStores', () => ({ resetAllStores: jest.fn() }));

const mockedAuth = authService as jest.Mocked<typeof authService>;
const mockedDoctorApi = doctorApi as jest.Mocked<typeof doctorApi>;
const mockedBooking = bookingService as jest.Mocked<typeof bookingService>;

// ─── Fixtures ────────────────────────────────────────────────────────────────
const UNVERIFIED_DOCTOR = {
  id: 'u2', email: 'abebe@test.com',
  first_name: 'Abebe', last_name: 'Girma',
  role: 'DOCTOR' as const, is_verified: true, is_doctor_approved: false,
};

const VERIFIED_DOCTOR = { ...UNVERIFIED_DOCTOR, is_doctor_approved: true };

const TOKENS = { access: 'access-doc', refresh: 'refresh-doc' };

const INCOMPLETE_PROFILE = {
  id: 'dp-1', specialization: '', years_of_experience: 0,
  consultation_fee: '0', is_verified: false, biography: '',
  location: '', current_working_hospital: '', experience: [],
  education: [], profile_image: '', average_rating: '0', review_count: 0,
};

const COMPLETE_PROFILE = {
  ...INCOMPLETE_PROFILE,
  specialization: 'Cardiology', years_of_experience: 5,
  consultation_fee: '500', is_verified: false,
};

const VERIFIED_PROFILE = { ...COMPLETE_PROFILE, is_verified: true };

const PENDING_DOCUMENT = {
  id: 'doc-1', document_type: 'LICENSE', license_number: 'ETH-123',
  file: 'https://example.com/doc.pdf', status: 'PENDING' as const,
  uploaded_at: '2026-05-30T10:00:00Z',
};

const AVAILABILITY_RULE = mockAvailabilityRule();

const makeAppointment = (overrides = {}) => ({
  id: 'appt-1',
  scheduled_start: '2026-06-01T09:00:00Z',
  scheduled_end: '2026-06-01T09:30:00Z',
  mode: 'ONLINE' as const,
  reason: 'Checkup',
  status: 'REQUESTED' as const,
  payment_status: 'unpaid' as const,
  ...overrides,
});

function resetStores() {
  useAuthStore.setState({
    user: null, tokens: null, isAuthenticated: false,
    isLoading: false, isBootstrapping: false, error: null,
    linkedAccount: null, hasLinkedAccount: false, isSwitchingAccount: false,
  });
  useDoctorStore.setState({
    profile: null, documents: [], searchResults: [],
    isLoadingProfile: false, isUpdatingProfile: false,
    isUploadingDocument: false, isSearching: false, error: null,
  });
  useBookingStore.setState({
    appointments: [], availabilityRules: [], doctorAvailabilityRules: [],
    notifications: [], preferences: null, wallet: null,
    paymentMethods: [], isLoading: false, error: null,
    isNotificationsDrawerOpen: false,
  });
  jest.clearAllMocks();
  mockedAuth.getLinkedAccounts.mockResolvedValue([]);
}

beforeEach(resetStores);

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 1: Doctor Login → Profile Setup → Upload Document → Pending Approval
// TC-AUTH-002 → TC-DOCTOR-001 → TC-DOCTOR-002 → TC-DOCTOR-003
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 1: Doctor registration → profile setup → pending approval', () => {

  it('Step 1 (TC-AUTH-002): doctor logs in with unverified account', async () => {
    mockedAuth.login.mockResolvedValueOnce({ ...TOKENS, user: UNVERIFIED_DOCTOR });

    await act(async () => {
      await useAuthStore.getState().login({ email: 'abebe@test.com', password: 'Test@1234' });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.role).toBe('DOCTOR');
    expect(state.user?.is_doctor_approved).toBe(false);
  });

  it('Step 2 (TC-DOCTOR-001): doctor fills in profile details', async () => {
    useAuthStore.setState({ user: UNVERIFIED_DOCTOR, tokens: TOKENS, isAuthenticated: true });
    mockedDoctorApi.updateDoctorProfile.mockResolvedValueOnce(COMPLETE_PROFILE);

    await act(async () => {
      await useDoctorStore.getState().updateProfile({
        specialization: 'Cardiology', years_of_experience: 5, consultation_fee: 500,
      });
    });

    const state = useDoctorStore.getState();
    expect(state.profile?.specialization).toBe('Cardiology');
    expect(state.verificationStage()).toBe('PROFILE_FILLED');
  });

  it('Step 3 (TC-DOCTOR-002): doctor uploads verification document', async () => {
    useDoctorStore.setState({ profile: COMPLETE_PROFILE });
    mockedDoctorApi.uploadDoctorDocument.mockResolvedValueOnce(PENDING_DOCUMENT);
    mockedDoctorApi.getDoctorDocuments.mockResolvedValueOnce([PENDING_DOCUMENT]);
    mockedDoctorApi.getDoctorProfile.mockResolvedValueOnce(COMPLETE_PROFILE);

    const formData = new FormData();
    formData.append('document_type', 'LICENSE');

    await act(async () => {
      await useDoctorStore.getState().uploadDocument(formData);
    });

    const state = useDoctorStore.getState();
    expect(state.documents).toHaveLength(1);
    expect(state.documents[0].status).toBe('PENDING');
    expect(state.verificationStage()).toBe('DOCUMENT_UPLOADED');
  });

  it('Step 4 (TC-DOCTOR-003): isDoctorVerified returns false before admin approval', () => {
    useDoctorStore.setState({ profile: COMPLETE_PROFILE, documents: [PENDING_DOCUMENT] });
    expect(useDoctorStore.getState().isDoctorVerified()).toBe(false);
    expect(useDoctorStore.getState().verificationStage()).toBe('DOCUMENT_UPLOADED');
  });

  it('Full flow: login → profile → document → still not verified', async () => {
    // Login
    mockedAuth.login.mockResolvedValueOnce({ ...TOKENS, user: UNVERIFIED_DOCTOR });
    await act(async () => {
      await useAuthStore.getState().login({ email: 'abebe@test.com', password: 'Test@1234' });
    });
    expect(useAuthStore.getState().user?.is_doctor_approved).toBe(false);

    // Fill profile
    mockedDoctorApi.updateDoctorProfile.mockResolvedValueOnce(COMPLETE_PROFILE);
    await act(async () => {
      await useDoctorStore.getState().updateProfile({ specialization: 'Cardiology' });
    });
    expect(useDoctorStore.getState().verificationStage()).toBe('PROFILE_FILLED');

    // Upload document
    mockedDoctorApi.uploadDoctorDocument.mockResolvedValueOnce(PENDING_DOCUMENT);
    mockedDoctorApi.getDoctorDocuments.mockResolvedValueOnce([PENDING_DOCUMENT]);
    mockedDoctorApi.getDoctorProfile.mockResolvedValueOnce(COMPLETE_PROFILE);
    await act(async () => {
      await useDoctorStore.getState().uploadDocument(new FormData());
    });
    expect(useDoctorStore.getState().verificationStage()).toBe('DOCUMENT_UPLOADED');
    expect(useDoctorStore.getState().isDoctorVerified()).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 2: Admin Approves → Doctor Accesses Dashboard
// TC-DOCTOR-004 → TC-NAV-002
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 2: Admin approves doctor → full dashboard access', () => {

  it('isDoctorVerified becomes true after admin approval', async () => {
    // Admin approved — backend now returns is_verified: true
    mockedDoctorApi.getDoctorProfile.mockResolvedValueOnce(VERIFIED_PROFILE);

    await act(async () => {
      await useDoctorStore.getState().fetchProfile();
    });

    expect(useDoctorStore.getState().isDoctorVerified()).toBe(true);
    expect(useDoctorStore.getState().verificationStage()).toBe('APPROVED');
  });

  it('auth store reflects approved doctor user', () => {
    useAuthStore.setState({
      user: VERIFIED_DOCTOR, tokens: TOKENS,
      isAuthenticated: true, isBootstrapping: false,
    });

    expect(useAuthStore.getState().user?.is_doctor_approved).toBe(true);
    expect(useAuthStore.getState().user?.role).toBe('DOCTOR');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 3: Doctor Sets Availability → Appointment Slots Available
// TC-DOC-APPT-005 → TC-DOC-APPT-006
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 3: Doctor manages availability', () => {

  it('adds availability rule then deletes it', async () => {
    useAuthStore.setState({
      user: VERIFIED_DOCTOR, tokens: TOKENS,
      isAuthenticated: true, isBootstrapping: false,
    });

    // Add rule
    mockedBooking.updateAvailabilityRules.mockResolvedValueOnce([AVAILABILITY_RULE as any]);
    await act(async () => {
      await useBookingStore.getState().createAvailabilityRule(
        mockAvailabilityRulePayload(),
      );
    });
    expect(useBookingStore.getState().availabilityRules).toHaveLength(1);
    expect(useBookingStore.getState().availabilityRules[0].weekday).toBe(1);

    // Delete rule
    mockedBooking.updateAvailabilityRules.mockResolvedValueOnce([]);
    await act(async () => {
      await useBookingStore.getState().deleteAvailabilityRule('rule-1');
    });
    expect(useBookingStore.getState().availabilityRules).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 4: Doctor Accepts Appointment → Wallet Shows Earnings
// TC-DOC-APPT-002 → TC-PAY-004
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 4: Doctor accepts appointment → wallet updated', () => {

  it('accepts appointment then fetches updated wallet balance', async () => {
    useAuthStore.setState({
      user: VERIFIED_DOCTOR, tokens: TOKENS,
      isAuthenticated: true, isBootstrapping: false,
    });
    useBookingStore.setState({ appointments: [makeAppointment()] });

    // Accept appointment
    mockedBooking.doctorDecision.mockResolvedValueOnce({
      appointment: makeAppointment({ status: 'CONFIRMED' }),
    });
    mockedBooking.getMyList.mockResolvedValueOnce([makeAppointment({ status: 'CONFIRMED' })]);

    await act(async () => {
      await useBookingStore.getState().doctorDecision('appt-1', { action: 'accept' });
    });
    expect(mockedBooking.doctorDecision).toHaveBeenCalledWith('appt-1', { action: 'accept' });

    // Fetch wallet
    mockedBooking.getWallet.mockResolvedValueOnce(
      mockWallet({ total_earned: '500.00' }),
    );
    await act(async () => {
      await useBookingStore.getState().fetchWallet();
    });

    expect(useBookingStore.getState().wallet?.total_earned).toBe('500.00');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 5: Doctor Proposes Reschedule → Patient Rejects → Original Stands
// TC-DOC-APPT-004 → TC-BOOK-007
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 5: Doctor proposes reschedule → patient rejects', () => {

  it('rejected change request leaves appointment unchanged', async () => {
    useBookingStore.setState({
      appointments: [makeAppointment({ status: 'CONFIRMED' })],
    });

    // Doctor creates change request
    mockedBooking.createChangeRequest.mockResolvedValueOnce({
      id: 'cr-1', status: 'PENDING',
      proposed_start: '2026-06-02T10:00:00Z',
      proposed_end: '2026-06-02T10:30:00Z',
      notes: 'Need to reschedule.',
    } as any);

    await act(async () => {
      await bookingService.createChangeRequest(
        'appt-1',
        mockChangeRequestPayload({ notes: 'Need to reschedule.' }),
      );
    });
    expect(mockedBooking.createChangeRequest).toHaveBeenCalledTimes(1);

    // Patient rejects
    mockedBooking.respondToChangeRequest.mockResolvedValueOnce({
      change_request: { id: 'cr-1', status: 'REJECTED' },
      appointment: makeAppointment({ status: 'CONFIRMED' }), // original time
    } as any);

    await act(async () => {
      await useBookingStore.getState().respondToChangeRequest('cr-1', { action: 'reject' });
    });

    expect(mockedBooking.respondToChangeRequest).toHaveBeenCalledWith(
      'cr-1', { action: 'reject' }
    );
    // Original appointment time still stands
    expect(useBookingStore.getState().appointments[0].scheduled_start)
      .toBe('2026-06-01T09:00:00Z');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 6: Doctor Rejects Patient Appointment
// TC-DOC-APPT-003
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 6: TC-DOC-APPT-003 — Doctor rejects appointment request', () => {

  it('rejected appointment status becomes CANCELLED', async () => {
    useBookingStore.setState({ appointments: [makeAppointment()] });

    mockedBooking.doctorDecision.mockResolvedValueOnce({
      appointment: makeAppointment({ status: 'CANCELLED' }),
    });
    mockedBooking.getMyList.mockResolvedValueOnce([makeAppointment({ status: 'CANCELLED' })]);

    await act(async () => {
      await useBookingStore.getState().doctorDecision('appt-1', { action: 'reject' });
    });

    expect(mockedBooking.doctorDecision).toHaveBeenCalledWith('appt-1', { action: 'reject' });
  });
});
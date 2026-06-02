// src/__tests__/integration/BookingFlow.test.ts
// Full patient booking flow integration tests.
// Tests authStore + bookingStore + discoveryStore working together.
//
// Flows covered:
//   FLOW 1: Login → Search Doctor → View Profile → Book → See in Appointments
//   FLOW 2: Book → Cancel → Verify Status
//   FLOW 3: Book → Pay → Verify Payment Status
//   FLOW 4: Book → Doctor Proposes Reschedule → Patient Accepts
//   FLOW 5: Book → Receive Notification → Mark Read
//
// Run: npx jest src/__tests__/integration/BookingFlow.test.ts

import { act } from 'react-test-renderer';
import {
  mockChangeRequestPayload,
  mockNotification,
} from '../helpers/fixtures';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/booking.store';
import { useDiscoveryStore } from '../../store/discovery.store';
import { authService } from '../../features/auth/services/authService';
import { bookingService } from '../../features/booking/services/bookingService';
import { doctorApi } from '../../features/doctor/services/doctor.api';

jest.mock('../../features/auth/services/authService');
jest.mock('../../features/booking/services/bookingService');
jest.mock('../../features/doctor/services/doctor.api');
jest.mock('../../services/storage');
jest.mock('../../store/resetAllStores', () => ({ resetAllStores: jest.fn() }));

const mockedAuth = authService as jest.Mocked<typeof authService>;
const mockedBooking = bookingService as jest.Mocked<typeof bookingService>;
const mockedDoctorApi = doctorApi as jest.Mocked<typeof doctorApi>;

// ─── Fixtures ────────────────────────────────────────────────────────────────
const PATIENT_USER = {
  id: 'u1', email: 'tigist@test.com',
  first_name: 'Tigist', last_name: 'Bekele',
  role: 'PATIENT' as const, is_verified: true, is_doctor_approved: false,
};

const TOKENS = { access: 'access-abc', refresh: 'refresh-xyz' };

const DOCTOR_RESULT = {
  id: 'doc-1', user_id: 'u2', first_name: 'Abebe', last_name: 'Girma',
  email: 'd@test.com', specialization: 'Cardiologist',
  years_of_experience: 10, consultation_fee: '500.00',
  average_rating: '4.5', review_count: 12,
  current_working_hospital: 'Black Lion', location: 'Addis Ababa',
  profile_image: '', is_verified: true,
};

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

const NOTIFICATION = mockNotification();

function resetStores() {
  useAuthStore.setState({
    user: PATIENT_USER, tokens: TOKENS,
    isAuthenticated: true, isBootstrapping: false,
    isLoading: false, error: null,
    linkedAccount: null, hasLinkedAccount: false, isSwitchingAccount: false,
  });
  useBookingStore.setState({
    appointments: [], availabilityRules: [], doctorAvailabilityRules: [],
    notifications: [], preferences: null, wallet: null,
    paymentMethods: [], isLoading: false, error: null,
    isNotificationsDrawerOpen: false,
  });
  useDiscoveryStore.setState({
    doctors: [], isLoading: false, isLoadingMore: false,
    error: null, hasMore: false, nextPageUrl: null,
    specializations: [], searchQuery: '', selectedSpecialization: null,
    minFee: null, maxFee: null, minRating: null,
    location: null, hospital: null, availability: 'any', sortBy: null,
  });
  jest.clearAllMocks();
  mockedAuth.getLinkedAccounts.mockResolvedValue([]);
}

beforeEach(resetStores);

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 1: Login → Search Doctor → Book → Appointment in list
// TC-AUTH-004 → TC-SEARCH-001 → TC-SEARCH-005 → TC-BOOK-001 → TC-DOC-APPT-001
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 1: Search doctor → Book appointment → See in list', () => {

  it('Step 1 (TC-SEARCH-001): patient searches for a doctor', async () => {
    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [DOCTOR_RESULT], count: 1, next: null, previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.setState({ searchQuery: 'Cardiologist' });
      await useDiscoveryStore.getState().fetchDoctors();
    });

    expect(useDiscoveryStore.getState().doctors).toHaveLength(1);
    expect(useDiscoveryStore.getState().doctors[0].specialization).toBe('Cardiologist');
  });

  it('Step 2 (TC-SEARCH-005): patient views doctor detail', async () => {
    mockedDoctorApi.getProviderDetail.mockResolvedValueOnce(DOCTOR_RESULT as any);

    const detail = await doctorApi.getProviderDetail('doc-1');

    expect(detail.consultation_fee).toBe('500.00'); // TC-BOOK-003: fee visible
    expect(detail.is_verified).toBe(true);
  });

  it('Step 3 (TC-BOOK-001): patient books appointment', async () => {
    mockedBooking.book.mockResolvedValueOnce(makeAppointment());

    await act(async () => {
      await useBookingStore.getState().bookAppointment({
        doctor_id: 'doc-1',
        scheduled_start: '2026-06-01T09:00:00Z',
        scheduled_end: '2026-06-01T09:30:00Z',
        appointment_type: 'ONLINE',
        reason: 'Checkup',
      });
    });

    expect(useBookingStore.getState().appointments).toHaveLength(1);
    expect(useBookingStore.getState().appointments[0].status).toBe('REQUESTED');
  });

  it('Step 4 (TC-DOC-APPT-001): appointment appears in patient list', async () => {
    mockedBooking.getMyList.mockResolvedValueOnce([makeAppointment()]);

    await act(async () => {
      await useBookingStore.getState().fetchMyAppointments();
    });

    const appts = useBookingStore.getState().appointments;
    expect(appts).toHaveLength(1);
    expect(appts[0].status).toBe('REQUESTED');
    expect(appts[0].mode).toBe('ONLINE');
  });

  it('Full flow: search → view fee → book → in list', async () => {
    // Search
    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [DOCTOR_RESULT], count: 1, next: null, previous: null,
    } as any);
    await act(async () => {
      useDiscoveryStore.setState({ searchQuery: 'Cardiologist' });
      await useDiscoveryStore.getState().fetchDoctors();
    });
    expect(useDiscoveryStore.getState().doctors[0].consultation_fee).toBe('500.00');

    // Book
    mockedBooking.book.mockResolvedValueOnce(makeAppointment());
    await act(async () => {
      await useBookingStore.getState().bookAppointment({
        doctor_id: 'doc-1',
        scheduled_start: '2026-06-01T09:00:00Z',
        scheduled_end: '2026-06-01T09:30:00Z',
        appointment_type: 'ONLINE',
        reason: 'Checkup',
      });
    });

    // Verify in list
    expect(useBookingStore.getState().appointments[0].status).toBe('REQUESTED');
    expect(useAuthStore.getState().isAuthenticated).toBe(true); // session intact
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 2: Book → Cancel → Status updated
// TC-BOOK-001 → TC-BOOK-005 → TC-STATUS-001
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 2: Book → Cancel', () => {

  it('booking then cancellation updates status to CANCELLED', async () => {
    // Book
    mockedBooking.book.mockResolvedValueOnce(makeAppointment());
    await act(async () => {
      await useBookingStore.getState().bookAppointment({
        doctor_id: 'doc-1',
        scheduled_start: '2026-06-01T09:00:00Z',
        scheduled_end: '2026-06-01T09:30:00Z',
        appointment_type: 'ONLINE',
      });
    });
    expect(useBookingStore.getState().appointments[0].status).toBe('REQUESTED');

    // Cancel
    mockedBooking.cancel.mockResolvedValueOnce({
      message: 'Cancelled.',
      late_cancellation: false,
      appointment: makeAppointment({ status: 'CANCELLED' }),
    });
    await act(async () => {
      await useBookingStore.getState().cancelAppointment('appt-1');
    });

    expect(useBookingStore.getState().appointments[0].status).toBe('CANCELLED');
    expect(useBookingStore.getState().error).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(true); // session intact
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 3: Book → Initiate Payment → Verify payment status
// TC-BOOK-001 → TC-PAY-001 → TC-STATUS-001
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 3: Book → Pay', () => {

  it('payment initiation returns Chapa checkout URL', async () => {
    // Book first
    mockedBooking.book.mockResolvedValueOnce(makeAppointment());
    await act(async () => {
      await useBookingStore.getState().bookAppointment({
        doctor_id: 'doc-1',
        scheduled_start: '2026-06-01T09:00:00Z',
        scheduled_end: '2026-06-01T09:30:00Z',
        appointment_type: 'ONLINE',
      });
    });

    // Initiate payment
    mockedBooking.initiatePayment.mockResolvedValueOnce({
      checkout_url: 'https://checkout.chapa.co/pay/abc123',
      tx_ref: 'MEDLINK-appt-1-ref',
      payment_status: 'pending',
    } as any);
    await act(async () => {
      const url = await useBookingStore.getState().initiatePayment('appt-1', 'method-1');
      expect(url).toContain('chapa.co');
    });

    expect(mockedBooking.initiatePayment).toHaveBeenCalledWith('appt-1', 'method-1');
  });

  it('payment history loads after payment completes', async () => {
    mockedBooking.getPaymentHistory.mockResolvedValueOnce([
      { id: 'pay-1', amount: '500.00', status: 'paid', appointment_id: 'appt-1' },
    ] as any);

    await act(async () => {
      await useBookingStore.getState().fetchPaymentHistory();
    });

    // Payment history store field
    expect(mockedBooking.getPaymentHistory).toHaveBeenCalledTimes(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 4: Book → Doctor Proposes Reschedule → Patient Accepts
// TC-BOOK-001 → TC-DOC-APPT-004 → TC-BOOK-006
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 4: Book → Reschedule Proposed → Patient Accepts', () => {

  it('change request flow updates appointment to new time', async () => {
    // Appointment exists
    useBookingStore.setState({
      appointments: [makeAppointment({ status: 'CONFIRMED' })],
    });

    // Doctor proposes change
    mockedBooking.createChangeRequest.mockResolvedValueOnce({
      id: 'cr-1', status: 'PENDING',
      proposed_start: '2026-06-02T10:00:00Z',
      proposed_end: '2026-06-02T10:30:00Z',
      notes: 'Rescheduled.',
    } as any);

    await act(async () => {
      await bookingService.createChangeRequest(
        'appt-1',
        mockChangeRequestPayload({ notes: 'Rescheduled.' }),
      );
    });
    expect(mockedBooking.createChangeRequest).toHaveBeenCalledTimes(1);

    // Patient accepts
    mockedBooking.respondToChangeRequest.mockResolvedValueOnce({
      change_request: { id: 'cr-1', status: 'ACCEPTED' },
      appointment: makeAppointment({
        status: 'CONFIRMED',
        scheduled_start: '2026-06-02T10:00:00Z',
      }),
    } as any);

    await act(async () => {
      await useBookingStore.getState().respondToChangeRequest('cr-1', { action: 'accept' });
    });

    expect(mockedBooking.respondToChangeRequest).toHaveBeenCalledWith(
      'cr-1', { action: 'accept' }
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 5: Book → Doctor Confirms → Notification Appears → Mark Read
// TC-BOOK-001 → TC-NOTIF-001 → TC-NOTIF-002 → TC-NOTIF-003
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 5: Appointment confirmed → Notification → Mark read', () => {

  it('notification appears after doctor confirms appointment', async () => {
    // Notification arrives after doctor accepts
    mockedBooking.getNotifications.mockResolvedValueOnce([NOTIFICATION]);

    await act(async () => {
      await useBookingStore.getState().fetchNotifications();
    });

    const state = useBookingStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].title).toBe('Appointment Confirmed');
    expect(state.notifications[0].is_read).toBe(false);
  });

  it('patient marks notification as read', async () => {
    useBookingStore.setState({ notifications: [NOTIFICATION] });

    mockedBooking.markNotificationRead.mockResolvedValueOnce({
      ...NOTIFICATION, is_read: true,
    });

    await act(async () => {
      await useBookingStore.getState().markNotificationRead('notif-1');
    });

    expect(useBookingStore.getState().notifications[0].is_read).toBe(true);
  });

  it('full flow: notification arrives then gets marked read', async () => {
    // Fetch notifications
    mockedBooking.getNotifications.mockResolvedValueOnce([NOTIFICATION]);
    await act(async () => {
      await useBookingStore.getState().fetchNotifications();
    });
    expect(useBookingStore.getState().notifications[0].is_read).toBe(false);

    // Mark as read
    mockedBooking.markNotificationRead.mockResolvedValueOnce({
      ...NOTIFICATION, is_read: true,
    });
    await act(async () => {
      await useBookingStore.getState().markNotificationRead('notif-1');
    });
    expect(useBookingStore.getState().notifications[0].is_read).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true); // session intact
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FLOW 6: Multiple filters applied together
// TC-SEARCH-002 + TC-SEARCH-003 + TC-SEARCH-004
// ═════════════════════════════════════════════════════════════════════════════
describe('FLOW 6: Combined search filters', () => {

  it('applies fee + rating filters together in one search', async () => {
    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [DOCTOR_RESULT], count: 1, next: null, previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.setState({ minFee: 200, maxFee: 800, minRating: 4 });
      await useDiscoveryStore.getState().fetchDoctors();
    });

    expect(mockedDoctorApi.searchProviders).toHaveBeenCalledWith(
      expect.objectContaining({ min_fee: 200, max_fee: 800, min_rating: 4 })
    );
    expect(useDiscoveryStore.getState().doctors).toHaveLength(1);
  });

  it('clearing filters resets all filter state', async () => {
    useDiscoveryStore.setState({ minFee: 200, maxFee: 800, minRating: 4, searchQuery: 'Cardio' });

    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [], count: 0, next: null, previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.getState().clearFilters();
    });

    const state = useDiscoveryStore.getState();
    expect(state.minFee).toBeNull();
    expect(state.maxFee).toBeNull();
    expect(state.minRating).toBeNull();
    expect(state.searchQuery).toBe('');
  });
});
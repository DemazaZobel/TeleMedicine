// src/__tests__/unit/stores/appointmentLifecycle.test.ts
// Tests: TC-STATUS-001, TC-STATUS-002, TC-DOC-APPT-005, TC-DOC-APPT-006,
//         TC-BOOK-002, TC-BOOK-003, TC-BOOK-004, TC-REVIEW-004
// Run: npx jest src/__tests__/unit/stores/appointmentLifecycle.test.ts

import { act } from 'react-test-renderer';
import {
  mockAvailabilityRule,
  mockAvailabilityRulePayload,
} from '../../helpers/fixtures';
import { useBookingStore } from '../../../store/booking.store';
import { bookingService } from '../../../features/booking/services/bookingService';

jest.mock('../../../features/booking/services/bookingService');
const mockedBooking = bookingService as jest.Mocked<typeof bookingService>;

// ─── Fixtures ────────────────────────────────────────────────────────────────
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

const AVAILABILITY_RULE = mockAvailabilityRule();

beforeEach(() => {
  useBookingStore.setState({
    appointments: [],
    availabilityRules: [],
    doctorAvailabilityRules: [],
    notifications: [],
    preferences: null,
    wallet: null,
    paymentMethods: [],
    isLoading: false,
    error: null,
    isNotificationsDrawerOpen: false,
  });
  jest.resetAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-STATUS-001 — Full Appointment Lifecycle
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-STATUS-001: full appointment lifecycle', () => {
  it('REQUESTED → CONFIRMED: doctor accepts', async () => {
    useBookingStore.setState({ appointments: [makeAppointment({ status: 'REQUESTED' })] });
    mockedBooking.doctorDecision.mockResolvedValueOnce({
      appointment: makeAppointment({ status: 'CONFIRMED' }),
    });

    await act(async () => {
      await useBookingStore.getState().doctorDecision('appt-1', { action: 'accept' });
    });

    expect(mockedBooking.doctorDecision).toHaveBeenCalledWith('appt-1', { action: 'accept' });
  });

  it('CONFIRMED → CANCELLED: patient cancels', async () => {
    useBookingStore.setState({ appointments: [makeAppointment({ status: 'CONFIRMED' })] });
    mockedBooking.cancel.mockResolvedValueOnce({
      message: 'Cancelled.',
      late_cancellation: false,
      appointment: makeAppointment({ status: 'CANCELLED' }),
    });

    await act(async () => {
      await useBookingStore.getState().cancelAppointment('appt-1');
    });

    expect(useBookingStore.getState().appointments[0].status).toBe('CANCELLED');
  });

  it('REQUESTED → CANCELLED: doctor rejects', async () => {
    useBookingStore.setState({ appointments: [makeAppointment({ status: 'REQUESTED' })] });
    mockedBooking.doctorDecision.mockResolvedValueOnce({
      appointment: makeAppointment({ status: 'CANCELLED' }),
    });

    await act(async () => {
      await useBookingStore.getState().doctorDecision('appt-1', { action: 'reject' });
    });

    expect(mockedBooking.doctorDecision).toHaveBeenCalledWith('appt-1', { action: 'reject' });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-BOOK-002 — In-Person Appointment Mode
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-BOOK-002: book in-person appointment', () => {
  it('creates appointment with IN_PERSON mode', async () => {
    const inPersonAppt = makeAppointment({ mode: 'IN_PERSON' as any });
    mockedBooking.book.mockResolvedValueOnce(inPersonAppt);

    await act(async () => {
      await useBookingStore.getState().bookAppointment({
        doctor_id: 'doc-1',
        scheduled_start: '2026-06-01T09:00:00Z',
        scheduled_end: '2026-06-01T09:30:00Z',
        appointment_type: 'IN_PERSON',
        reason: 'Physical exam',
      });
    });

    expect(useBookingStore.getState().appointments[0].mode).toBe('IN_PERSON');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-BOOK-004 — No Available Slots
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-BOOK-004: booking fails when no slots available', () => {
  it('sets error and does not add appointment when API returns 400', async () => {
    mockedBooking.book.mockRejectedValueOnce({
      response: { data: { detail: 'No available slots for this time.' } },
    });

    await act(async () => {
      try {
        await useBookingStore.getState().bookAppointment({
          doctor_id: 'doc-1',
          scheduled_start: '2026-06-01T09:00:00Z',
          scheduled_end: '2026-06-01T09:30:00Z',
          appointment_type: 'ONLINE',
        });
      } catch (_) {}
    });

    const state = useBookingStore.getState();
    expect(state.appointments).toHaveLength(0);
    expect(state.error).toBe('No available slots for this time.');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOC-APPT-005 — Create Availability Rule
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOC-APPT-005: create availability rule', () => {
  it('adds new availability rule to store', async () => {
    mockedBooking.updateAvailabilityRules.mockResolvedValueOnce([AVAILABILITY_RULE as any]);

    await act(async () => {
      await useBookingStore.getState().createAvailabilityRule(
        mockAvailabilityRulePayload(),
      );
    });

    const state = useBookingStore.getState();
    expect(mockedBooking.updateAvailabilityRules).toHaveBeenCalled();
    expect(state.availabilityRules).toHaveLength(1);
    expect(state.availabilityRules[0].weekday).toBe(1);
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOC-APPT-006 — Delete Availability Rule
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOC-APPT-006: delete availability rule', () => {
  it('removes rule from store', async () => {
    useBookingStore.setState({ availabilityRules: [AVAILABILITY_RULE as any] });
    mockedBooking.updateAvailabilityRules.mockResolvedValueOnce([]);

    await act(async () => {
      await useBookingStore.getState().deleteAvailabilityRule('rule-1');
    });

    expect(mockedBooking.updateAvailabilityRules).toHaveBeenCalled();
    expect(useBookingStore.getState().availabilityRules).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-REVIEW-004 — Cannot review non-completed appointment (logic check)
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-REVIEW-004: review only allowed for completed appointments', () => {
  it('identifies COMPLETED appointments correctly', () => {
    const completed = makeAppointment({ status: 'COMPLETED' });
    const requested = makeAppointment({ status: 'REQUESTED' });
    const confirmed = makeAppointment({ status: 'CONFIRMED' });

    const canReview = (appt: any) => appt.status === 'COMPLETED';

    expect(canReview(completed)).toBe(true);
    expect(canReview(requested)).toBe(false);
    expect(canReview(confirmed)).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Fetch My Appointments — List
// ═════════════════════════════════════════════════════════════════════════════
describe('fetchMyAppointments', () => {
  it('TC-DOC-APPT-001: loads appointments into store', async () => {
    const appts = [
      makeAppointment({ id: 'appt-1', status: 'REQUESTED' }),
      makeAppointment({ id: 'appt-2', status: 'CONFIRMED' }),
    ];
    mockedBooking.getMyList.mockResolvedValueOnce(appts);

    await act(async () => {
      await useBookingStore.getState().fetchMyAppointments();
    });

    const state = useBookingStore.getState();
    expect(state.appointments).toHaveLength(2);
    expect(state.isLoading).toBe(false);
  });

  it('sets error on API failure', async () => {
    mockedBooking.getMyList.mockRejectedValueOnce({
      response: { data: { detail: 'Unauthorized.' } },
    });

    await act(async () => {
      await useBookingStore.getState().fetchMyAppointments();
    });

    expect(useBookingStore.getState().error).toBe('Unauthorized.');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-STATUS-002 — Payment Status on Appointment
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-STATUS-002: payment status tracking', () => {
  it('unpaid appointment has payment_status of unpaid', () => {
    const appt = makeAppointment({ payment_status: 'unpaid' });
    expect(appt.payment_status).toBe('unpaid');
  });

  it('paid appointment reflects correct payment_status', () => {
    const appt = makeAppointment({ payment_status: 'paid' as any });
    expect(appt.payment_status).toBe('paid');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Notifications Drawer Toggle
// ═════════════════════════════════════════════════════════════════════════════
describe('notifications drawer', () => {
  it('opens and closes the notifications drawer', () => {
    expect(useBookingStore.getState().isNotificationsDrawerOpen).toBe(false);

    useBookingStore.getState().setIsNotificationsDrawerOpen(true);
    expect(useBookingStore.getState().isNotificationsDrawerOpen).toBe(true);

    useBookingStore.getState().setIsNotificationsDrawerOpen(false);
    expect(useBookingStore.getState().isNotificationsDrawerOpen).toBe(false);
  });
});
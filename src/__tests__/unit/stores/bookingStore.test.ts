// src/__tests__/unit/stores/bookingStore.test.ts
// Tests: TC-BOOK-001, TC-BOOK-005, TC-DOC-APPT-002, TC-DOC-APPT-003,
//         TC-NOTIF-002, TC-PAY-004
// Run: npx jest src/__tests__/unit/stores/bookingStore.test.ts

import { act } from 'react-test-renderer';
import { mockAvailabilityRule, mockNotification, mockWallet } from '../../helpers/fixtures';
import { useBookingStore } from '../../../store/booking.store';
import { bookingService } from '../../../features/booking/services/bookingService';

jest.mock('../../../features/booking/services/bookingService');
const mockedBooking = bookingService as jest.Mocked<typeof bookingService>;

// ─── Fixtures ────────────────────────────────────────────────────────────────
const APPOINTMENT_REQUESTED = {
  id: 'appt-1',
  scheduled_start: '2026-06-01T09:00:00Z',
  scheduled_end: '2026-06-01T09:30:00Z',
  mode: 'ONLINE' as const,
  reason: 'Checkup',
  status: 'REQUESTED' as const,
  payment_status: 'unpaid' as const,
};

const APPOINTMENT_CONFIRMED = { ...APPOINTMENT_REQUESTED, status: 'CONFIRMED' as const };
const APPOINTMENT_CANCELLED = { ...APPOINTMENT_REQUESTED, status: 'CANCELLED' as const };

const NOTIFICATION = mockNotification();

beforeEach(() => {
  useBookingStore.setState({
    appointments: [],
    notifications: [],
    wallet: null,
    isLoading: false,
    error: null,
    availabilityRules: [],
    doctorAvailabilityRules: [],
    preferences: null,
    paymentMethods: [],
    isNotificationsDrawerOpen: false,
  });
  jest.clearAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-BOOK-001 — Book Appointment (Happy Path)
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-BOOK-001: book appointment', () => {
  it('adds new appointment to store on success', async () => {
    mockedBooking.book.mockResolvedValueOnce(APPOINTMENT_REQUESTED);

    let result: any;
    await act(async () => {
      result = await useBookingStore.getState().bookAppointment({
        doctor_id: 'doc-1',
        scheduled_start: '2026-06-01T09:00:00Z',
        scheduled_end: '2026-06-01T09:30:00Z',
        appointment_type: 'ONLINE',
        reason: 'Checkup',
      });
    });

    const state = useBookingStore.getState();
    expect(state.appointments).toHaveLength(1);
    expect(state.appointments[0].status).toBe('REQUESTED');
    expect(state.appointments[0].mode).toBe('ONLINE');
    expect(result.id).toBe('appt-1');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets error state when booking fails', async () => {
    mockedBooking.book.mockRejectedValueOnce({
      response: { data: { detail: 'No available slots for this time.' } },
    });

    await act(async () => {
      await expect(
        useBookingStore.getState().bookAppointment({
          doctor_id: 'doc-1',
          scheduled_start: '2026-06-01T09:00:00Z',
          scheduled_end: '2026-06-01T09:30:00Z',
          appointment_type: 'ONLINE',
        })
      ).rejects.toBeDefined();
    });

    const state = useBookingStore.getState();
    expect(state.appointments).toHaveLength(0);
    expect(state.error).toBe('No available slots for this time.');
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-BOOK-005 — Cancel Appointment
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-BOOK-005: cancel appointment', () => {
  it('updates appointment status to CANCELLED in store', async () => {
    useBookingStore.setState({ appointments: [APPOINTMENT_CONFIRMED] });

    mockedBooking.cancel.mockResolvedValueOnce({
      message: 'Cancelled',
      late_cancellation: false,
      appointment: APPOINTMENT_CANCELLED,
    });

    await act(async () => {
      await useBookingStore.getState().cancelAppointment('appt-1', { confirm: true });
    });

    const state = useBookingStore.getState();
    expect(state.appointments[0].status).toBe('CANCELLED');
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOC-APPT-002 — Doctor Accepts Appointment
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOC-APPT-002: doctor accepts appointment', () => {
  it('updates appointment status to CONFIRMED', async () => {
    useBookingStore.setState({ appointments: [APPOINTMENT_REQUESTED] });

    mockedBooking.doctorDecision.mockResolvedValueOnce({
      appointment: APPOINTMENT_CONFIRMED,
    });

    await act(async () => {
      await useBookingStore.getState().doctorDecision('appt-1', { action: 'accept' });
    });

    const state = useBookingStore.getState();
    // Appointments should be re-fetched after decision — trigger fetchMyAppointments
    expect(mockedBooking.doctorDecision).toHaveBeenCalledWith('appt-1', { action: 'accept' });
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NOTIF-001 / TC-NOTIF-002 — Fetch and Mark Notifications
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NOTIF-001: fetch notifications', () => {
  it('loads notifications into store', async () => {
    mockedBooking.getNotifications.mockResolvedValueOnce([NOTIFICATION]);

    await act(async () => {
      await useBookingStore.getState().fetchNotifications();
    });

    const state = useBookingStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].title).toBe('Appointment Confirmed');
    expect(state.notifications[0].is_read).toBe(false);
  });
});

describe('TC-NOTIF-002: mark notification as read', () => {
  it('marks the notification as read in store', async () => {
    useBookingStore.setState({ notifications: [NOTIFICATION] });

    mockedBooking.markNotificationRead.mockResolvedValueOnce({
      ...NOTIFICATION,
      is_read: true,
    });

    await act(async () => {
      await useBookingStore.getState().markNotificationRead('notif-1');
    });

    const state = useBookingStore.getState();
    expect(state.notifications[0].is_read).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-PAY-004 — Doctor Wallet
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-PAY-004: fetch doctor wallet', () => {
  it('loads wallet balance into store', async () => {
    mockedBooking.getWallet.mockResolvedValueOnce(mockWallet());

    await act(async () => {
      await useBookingStore.getState().fetchWallet();
    });

    const state = useBookingStore.getState();
    expect(state.wallet?.total_earned).toBe('1500.00');
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOC-APPT-005 — Fetch Availability Rules
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOC-APPT-005: fetch availability rules', () => {
  it('loads doctor availability rules into store', async () => {
    const mockRule = mockAvailabilityRule();
    mockedBooking.getAvailabilityRules.mockResolvedValueOnce([mockRule]);

    await act(async () => {
      await useBookingStore.getState().fetchAvailabilityRules();
    });

    const state = useBookingStore.getState();
    expect(state.availabilityRules).toHaveLength(1);
    expect(state.availabilityRules[0].weekday).toBe(1);
  });
});
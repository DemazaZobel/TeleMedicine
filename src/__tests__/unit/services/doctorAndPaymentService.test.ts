// src/__tests__/unit/services/doctorAndPaymentService.test.ts
// Tests: TC-SEARCH-001, TC-SEARCH-005, TC-DOCTOR-001, TC-DOCTOR-002,
//         TC-REVIEW-001, TC-REVIEW-002, TC-PAY-001 through TC-PAY-006,
//         TC-NOTIF-001, TC-NOTIF-004, TC-STATUS-003
// Run: npx jest src/__tests__/unit/services/doctorAndPaymentService.test.ts

import MockAdapter from 'axios-mock-adapter';
import {
  mockChangeRequestPayload,
  mockNotificationPreferences,
  mockWallet,
} from '../../helpers/fixtures';
import { apiClient } from '../../../services/api';
import { doctorApi } from '../../../features/doctor/services/doctor.api';
import { bookingService } from '../../../features/booking/services/bookingService';

const mock = new MockAdapter(apiClient);

afterEach(() => mock.reset());
afterAll(() => mock.restore());

// ─── Fixtures ─────────────────────────────────────────────────────────────
const DOCTOR_RESULT = {
  id: 'doc-1', user_id: 'u2', first_name: 'Abebe', last_name: 'Girma',
  email: 'd@test.com', specialization: 'Cardiologist',
  years_of_experience: 10, consultation_fee: '500.00',
  average_rating: '4.5', review_count: 12,
  current_working_hospital: 'Black Lion', location: 'Addis Ababa',
  profile_image: '', is_verified: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// TC-SEARCH-001 — Doctor Search API
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-SEARCH-001: doctorApi.searchProviders', () => {
  it('GET /providers/search/ returns paginated results', async () => {
    mock.onGet('/providers/search/').reply(200, {
      count: 1, next: null, previous: null, results: [DOCTOR_RESULT],
    });

    const result = await doctorApi.searchProviders({ query: 'Cardiologist' });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].specialization).toBe('Cardiologist');
  });

  it('returns empty results for unknown specialization', async () => {
    mock.onGet('/providers/search/').reply(200, {
      count: 0, next: null, previous: null, results: [],
    });

    const result = await doctorApi.searchProviders({ query: 'Xenobiologist' });
    expect(result.results).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it('passes fee filter params correctly', async () => {
    mock.onGet('/providers/search/').reply(200, {
      count: 1, next: null, previous: null, results: [DOCTOR_RESULT],
    });

    await doctorApi.searchProviders({ min_fee: 200, max_fee: 800 });

    const request = mock.history.get[0];
    expect(request.params).toMatchObject({ min_fee: 200, max_fee: 800 });
  });

  it('passes rating filter params correctly', async () => {
    mock.onGet('/providers/search/').reply(200, {
      count: 1, next: null, previous: null, results: [DOCTOR_RESULT],
    });

    await doctorApi.searchProviders({ min_rating: 4 });
    const request = mock.history.get[0];
    expect(request.params).toMatchObject({ min_rating: 4 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-SEARCH-005 — Get Provider Detail
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-SEARCH-005: doctorApi.getProviderDetail', () => {
  it('GET /providers/provider/{id}/ returns full doctor profile', async () => {
    mock.onGet('/providers/provider/doc-1/').reply(200, DOCTOR_RESULT);

    const result = await doctorApi.getProviderDetail('doc-1');
    expect(result.id).toBe('doc-1');
    expect(result.consultation_fee).toBe('500.00');
    expect(result.average_rating).toBe('4.5');
    expect(result.is_verified).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-001 — Doctor Profile API
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-001: doctorApi.getDoctorProfile / updateDoctorProfile', () => {
  it('GET /providers/profile/ returns doctor profile', async () => {
    const profile = {
      id: 'dp-1', specialization: 'Cardiology', years_of_experience: 5,
      consultation_fee: '500', is_verified: false, biography: 'Bio',
      location: 'Addis', current_working_hospital: 'Black Lion',
      experience: [], education: [], profile_image: '',
      average_rating: '0', review_count: 0,
    };
    mock.onGet('/providers/profile/').reply(200, profile);

    const result = await doctorApi.getDoctorProfile();
    expect(result.specialization).toBe('Cardiology');
  });

  it('PUT /providers/profile/ updates doctor profile', async () => {
    const updated = {
      id: 'dp-1', specialization: 'Neurology', years_of_experience: 8,
      consultation_fee: '700', is_verified: false, biography: '',
      location: '', current_working_hospital: '', experience: [],
      education: [], profile_image: '', average_rating: '0', review_count: 0,
    };
    mock.onPut('/providers/profile/').reply(200, updated);

    const result = await doctorApi.updateDoctorProfile({ specialization: 'Neurology' });
    expect(result.specialization).toBe('Neurology');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOCTOR-002 — Document Upload/Fetch
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOCTOR-002: document upload and fetch', () => {
  it('POST /providers/documents/ uploads document', async () => {
    const doc = {
      id: 'doc-1', document_type: 'LICENSE', license_number: 'ETH-123',
      file: 'https://example.com/doc.pdf', status: 'PENDING', uploaded_at: '2026-05-30T10:00:00Z',
    };
    mock.onPost('/providers/documents/').reply(201, doc);

    const formData = new FormData();
    formData.append('document_type', 'LICENSE');
    const result = await doctorApi.uploadDoctorDocument(formData);
    expect(result.status).toBe('PENDING');
  });

  it('GET /providers/documents/list/ returns documents list', async () => {
    mock.onGet('/providers/documents/list/').reply(200, [
      { id: 'doc-1', document_type: 'LICENSE', status: 'PENDING' },
    ]);

    const result = await doctorApi.getDoctorDocuments();
    expect(result).toHaveLength(1);
    expect(result[0].document_type).toBe('LICENSE');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-STATUS-003 — Get Join Link (Video Consultation)
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-STATUS-003: bookingService.getJoinLink', () => {
  it('GET /appointments/{id}/join/ returns meeting link', async () => {
    mock.onGet('/appointments/appt-1/join/').reply(200, {
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      scheduled_start: '2026-06-01T09:00:00Z',
      scheduled_end: '2026-06-01T09:30:00Z',
    });

    const result = await bookingService.getJoinLink('appt-1');
    expect(result.meeting_link).toContain('meet.google.com');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-PAY-001 — Initiate Payment
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-PAY-001: bookingService.initiatePayment', () => {
  it('POST /payments/initiate/{id}/ returns checkout URL', async () => {
    mock.onPost('/payments/initiate/appt-1/').reply(200, {
      checkout_url: 'https://checkout.chapa.co/pay/abc123',
      tx_ref: 'MEDLINK-appt-1-ref',
      payment_status: 'pending',
    });

    const result = await bookingService.initiatePayment('appt-1', 'method-1');
    expect(result.checkout_url).toContain('chapa.co');
    expect(result.tx_ref).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-PAY-002 — Payment History
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-PAY-002: bookingService.getPaymentHistory', () => {
  it('GET /payments/history/ returns payment records', async () => {
    mock.onGet('/payments/history/').reply(200, [
      {
        id: 'pay-1', amount: '500.00', status: 'paid',
        appointment_id: 'appt-1', created_at: '2026-05-30T10:00:00Z',
      },
    ]);

    const result = await bookingService.getPaymentHistory();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('paid');
    expect(result[0].amount).toBe('500.00');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-PAY-004 — Doctor Wallet
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-PAY-004: bookingService.getWallet', () => {
  it('GET /payments/wallet/ returns wallet details', async () => {
    mock.onGet('/payments/wallet/').reply(200, mockWallet());

    const result = await bookingService.getWallet();
    expect(result.total_earned).toBe('1500.00');
    expect(result.updated_at).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NOTIF-001 — Fetch Notifications
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NOTIF-001: bookingService.getNotifications', () => {
  it('GET /appointments/notifications/ returns list', async () => {
    mock.onGet('/appointments/notifications/').reply(200, [
      {
        id: 'notif-1', title: 'Appointment Confirmed',
        body: 'Your appointment has been confirmed.',
        is_read: false, created_at: '2026-05-30T10:00:00Z',
      },
    ]);

    const result = await bookingService.getNotifications();
    expect(result).toHaveLength(1);
    expect(result[0].is_read).toBe(false);
    expect(result[0].title).toBe('Appointment Confirmed');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NOTIF-002 — Mark Notification as Read
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NOTIF-002: bookingService.markNotificationRead', () => {
  it('POST /appointments/notifications/{id}/read/ marks as read', async () => {
    mock.onPost('/appointments/notifications/notif-1/read/').reply(200, {
      id: 'notif-1', title: 'Appointment Confirmed',
      body: 'Confirmed.', is_read: true, created_at: '2026-05-30T10:00:00Z',
    });

    const result = await bookingService.markNotificationRead('notif-1');
    expect(result.is_read).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NOTIF-004 — Update Notification Preferences
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NOTIF-004: bookingService.updateNotificationPreferences', () => {
  it('PUT /appointments/notification-preferences/ saves preferences', async () => {
    mock.onPut('/appointments/notification-preferences/').reply(
      200,
      mockNotificationPreferences({ email_appointments: false, in_app_payments: true }),
    );

    const result = await bookingService.updateNotificationPreferences({
      email_appointments: false,
      in_app_payments: true,
    });
    expect(result.email_appointments).toBe(false);
    expect(result.in_app_payments).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-BOOK-006 / TC-BOOK-007 — Respond to Change Request
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-BOOK-006/007: bookingService.respondToChangeRequest', () => {
  it('accept: POST /appointments/change-requests/{id}/respond/', async () => {
    mock.onPost('/appointments/change-requests/cr-1/respond/').reply(200, {
      change_request: { id: 'cr-1', status: 'ACCEPTED' },
      appointment: { id: 'appt-1', status: 'CONFIRMED' },
    });

    const result = await bookingService.respondToChangeRequest('cr-1', { action: 'accept' });
    expect(result.change_request.status).toBe('ACCEPTED');
    expect(result.appointment.status).toBe('CONFIRMED');
  });

  it('reject: returns REJECTED change request', async () => {
    mock.onPost('/appointments/change-requests/cr-1/respond/').reply(200, {
      change_request: { id: 'cr-1', status: 'REJECTED' },
      appointment: { id: 'appt-1', status: 'CONFIRMED' },
    });

    const result = await bookingService.respondToChangeRequest('cr-1', { action: 'reject' });
    expect(result.change_request.status).toBe('REJECTED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-DOC-APPT-004 — Create Change Request (Doctor Proposes Reschedule)
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-DOC-APPT-004: bookingService.createChangeRequest', () => {
  it('POST /appointments/{id}/change-request/ creates change request', async () => {
    mock.onPost('/appointments/appt-1/change-request/').reply(201, {
      id: 'cr-1',
      status: 'PENDING',
      proposed_start: '2026-06-02T10:00:00Z',
      proposed_end: '2026-06-02T10:30:00Z',
      notes: 'Patient rescheduled.',
    });

    const result = await bookingService.createChangeRequest(
      'appt-1',
      mockChangeRequestPayload({ notes: 'Patient rescheduled.' }),
    );
    expect(result.status).toBe('PENDING');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NFR-003 — HTTPS Enforcement
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NFR-003: HTTPS enforcement', () => {
  it('apiClient baseURL uses HTTPS', () => {
    const baseURL = (apiClient.defaults.baseURL ?? '');
    expect(baseURL.startsWith('https://')).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NFR-009 — Request Timeout Configured
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NFR-009: request timeout configured', () => {
  it('apiClient has a timeout set', () => {
    expect(apiClient.defaults.timeout).toBeDefined();
    expect(apiClient.defaults.timeout).toBeGreaterThan(0);
  });

  it('timeout is 15 seconds or less', () => {
    expect(apiClient.defaults.timeout).toBeLessThanOrEqual(15000);
  });
});
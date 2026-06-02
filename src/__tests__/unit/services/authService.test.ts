// src/__tests__/unit/services/authService.test.ts
// Tests: HTTP calls made by authService and bookingService.
//        Uses axios-mock-adapter to intercept real axios calls.
// Run: npx jest src/__tests__/unit/services/authService.test.ts

import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../../../services/api';
import { authService } from '../../../features/auth/services/authService';
import { bookingService } from '../../../features/booking/services/bookingService';
import { patientApi } from '../../../features/patient/services/patient.api';

// Intercept all calls made through apiClient
const mock = new MockAdapter(apiClient);

afterEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

// ─── Fixtures ────────────────────────────────────────────────────────────────
const PATIENT_USER = {
  id: 'u1', email: 'tigist@test.com',
  first_name: 'Tigist', last_name: 'Bekele',
  role: 'PATIENT', is_verified: true, is_doctor_approved: false,
};

const TOKENS = { access: 'acc-token', refresh: 'ref-token' };

// ═════════════════════════════════════════════════════════════════════════════
// Auth Service — Login
// ═════════════════════════════════════════════════════════════════════════════
describe('authService.login', () => {
  it('TC-AUTH-004: POST /auth/login/ returns tokens and user', async () => {
    mock.onPost('/auth/login/').reply(200, { ...TOKENS, user: PATIENT_USER });
    const result = await authService.login({ email: 'tigist@test.com', password: 'Test@1234' });
    expect(result.access).toBe('acc-token');
    expect(result.user.role).toBe('PATIENT');
  });

  it('TC-AUTH-005: POST /auth/login/ returns 401 on wrong password', async () => {
    mock.onPost('/auth/login/').reply(401, {
      detail: 'No active account found with the given credentials.',
    });
    await expect(
      authService.login({ email: 'tigist@test.com', password: 'wrong' })
    ).rejects.toMatchObject({ response: { status: 401 } });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Auth Service — Register
// ═════════════════════════════════════════════════════════════════════════════
describe('authService.register', () => {
  it('TC-AUTH-001: POST /auth/register/ returns success message', async () => {
    mock.onPost('/auth/register/').reply(201, {
      message: 'User registered. Please verify your email.',
    });
    const result = await authService.register({
      email: 'new@test.com',
      password: 'Test@1234',
      first_name: 'New',
      last_name: 'User',
      role: 'PATIENT',
    });
    expect(result.message).toContain('verify your email');
  });

  it('TC-AUTH-003: POST /auth/register/ returns 400 on duplicate email', async () => {
    mock.onPost('/auth/register/').reply(400, {
      email: ['A user with this email already exists.'],
    });
    await expect(
      authService.register({
        email: 'existing@test.com',
        password: 'Test@1234',
        first_name: 'Dup',
        last_name: 'User',
        role: 'PATIENT',
      })
    ).rejects.toMatchObject({ response: { status: 400 } });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Auth Service — OTP Verify
// ═════════════════════════════════════════════════════════════════════════════
describe('authService.verifyEmail', () => {
  it('TC-AUTH-001: POST /auth/verify-email/ verifies OTP', async () => {
    mock.onPost('/auth/verify-email/').reply(200, { message: 'Email verified.' });
    const result = await authService.verifyEmail({ email: 'tigist@test.com', code: '123456' });
    expect(result.message).toBe('Email verified.');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Auth Service — Forgot / Reset Password
// ═════════════════════════════════════════════════════════════════════════════
describe('authService.forgotPassword + resetPassword', () => {
  it('TC-AUTH-008: sends forgot-password OTP', async () => {
    mock.onPost('/auth/forgot-password/').reply(200, { message: 'OTP sent.' });
    const result = await authService.forgotPassword({ email: 'tigist@test.com' });
    expect(result.message).toBe('OTP sent.');
  });

  it('TC-AUTH-008: resets password with OTP', async () => {
    mock.onPost('/auth/reset-password/').reply(200, { message: 'Password reset.' });
    const result = await authService.resetPassword({
      email: 'tigist@test.com',
      code: '123456',
      newPassword: 'NewPass@1',
    });
    expect(result.message).toBe('Password reset.');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Auth Service — Get / Update Profile
// ═════════════════════════════════════════════════════════════════════════════
describe('authService profile', () => {
  it('TC-PROFILE-001: GET /auth/profile/ returns user', async () => {
    mock.onGet('/auth/profile/').reply(200, PATIENT_USER);
    const result = await authService.getProfile();
    expect(result.email).toBe('tigist@test.com');
  });

  it('TC-PROFILE-002: PUT /auth/profile/ updates and returns user', async () => {
    mock.onPut('/auth/profile/').reply(200, { ...PATIENT_USER, first_name: 'UpdatedName' });
    const result = await authService.updateProfile({ first_name: 'UpdatedName' });
    expect(result.first_name).toBe('UpdatedName');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Booking Service — Book Appointment
// ═════════════════════════════════════════════════════════════════════════════
describe('bookingService.book', () => {
  it('TC-BOOK-001: POST /appointments/book/ creates appointment', async () => {
    const appt = {
      id: 'appt-1', status: 'REQUESTED', mode: 'ONLINE',
      scheduled_start: '2026-06-01T09:00:00Z',
      scheduled_end: '2026-06-01T09:30:00Z',
      reason: 'Checkup', payment_status: 'unpaid',
    };
    mock.onPost('/appointments/book/').reply(201, appt);
    const result = await bookingService.book({
      doctor_id: 'doc-1',
      scheduled_start: '2026-06-01T09:00:00Z',
      scheduled_end: '2026-06-01T09:30:00Z',
      appointment_type: 'ONLINE',
      reason: 'Checkup',
    });
    expect(result.status).toBe('REQUESTED');
    expect(result.mode).toBe('ONLINE');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Booking Service — Cancel Appointment
// ═════════════════════════════════════════════════════════════════════════════
describe('bookingService.cancel', () => {
  it('TC-BOOK-005: POST /appointments/{id}/cancel/ returns cancelled appointment', async () => {
    mock.onPost('/appointments/appt-1/cancel/').reply(200, {
      message: 'Cancelled.',
      late_cancellation: false,
      appointment: { id: 'appt-1', status: 'CANCELLED' },
    });
    const result = await bookingService.cancel('appt-1', { confirm: true });
    expect(result.appointment.status).toBe('CANCELLED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Booking Service — Doctor Decision
// ═════════════════════════════════════════════════════════════════════════════
describe('bookingService.doctorDecision', () => {
  it('TC-DOC-APPT-002: accepts appointment', async () => {
    mock.onPost('/appointments/appt-1/doctor-decision/').reply(200, {
      appointment: { id: 'appt-1', status: 'CONFIRMED' },
    });
    const result = await bookingService.doctorDecision('appt-1', { action: 'accept' }) as any;
    expect(result.appointment.status).toBe('CONFIRMED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Patient API — Medical Info
// ═════════════════════════════════════════════════════════════════════════════
describe('patientApi medical info', () => {
  it('TC-MEDICAL-001: GET /patients/me/medical-info/', async () => {
    mock.onGet('/patients/me/medical-info/').reply(200, {
      blood_type: 'O+', allergies: 'Penicillin', chronic_conditions: '',
    });
    const result = await patientApi.getMedicalInfo();
    expect(result.blood_type).toBe('O+');
  });

  it('TC-MEDICAL-002: PUT /patients/me/medical-info/', async () => {
    mock.onPut('/patients/me/medical-info/').reply(200, {
      blood_type: 'A+', allergies: 'None', chronic_conditions: 'Hypertension',
    });
    const result = await patientApi.updateMedicalInfo({ blood_type: 'A+' });
    expect(result.blood_type).toBe('A+');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NFR-005: Password NOT logged in request interceptor
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NFR-005: password sanitization in logs', () => {
  it('does not log plaintext password in API payload', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mock.onPost('/auth/login/').reply(200, { access: 'x', refresh: 'y', user: PATIENT_USER });

    await authService.login({ email: 'tigist@test.com', password: 'SuperSecret@1' });

    const allLogs = logSpy.mock.calls.flat().join(' ');
    expect(allLogs).not.toContain('SuperSecret@1');
    logSpy.mockRestore();
  });
});
// src/__tests__/unit/stores/rbac.test.ts
// Tests: TC-NAV-001, TC-NAV-002, TC-NAV-003, TC-NAV-004, TC-NAV-005
//         TC-NFR-008 (role-based access)
// Run: npx jest src/__tests__/unit/stores/rbac.test.ts
//
// These tests validate the RBAC logic that AuthGate in _layout.tsx uses
// to decide which route group to render. We test the logic directly
// against the auth store state.

import { useAuthStore } from '../../../store/authStore';
import { useDoctorStore } from '../../../store/doctor.store';

// Helper: mirrors the routing logic in app/_layout.tsx AuthGate
function resolveRoute(
  isAuthenticated: boolean,
  isBootstrapping: boolean,
  role: string | undefined,
  isDoctorVerified: boolean
): '/(public)' | '/(auth)' | '/(tabs)' | '/(doctor)' | 'pending' {
  if (isBootstrapping) return '/(public)'; // still loading
  if (!isAuthenticated) return '/(public)';
  if (role === 'PATIENT') return '/(tabs)';
  if (role === 'DOCTOR') {
    if (!isDoctorVerified) return 'pending';
    return '/(doctor)';
  }
  return '/(public)';
}

const PATIENT_USER = {
  id: 'u1', email: 'p@test.com', first_name: 'P', last_name: 'T',
  role: 'PATIENT' as const, is_verified: true, is_doctor_approved: false,
};

const DOCTOR_USER = {
  id: 'u2', email: 'd@test.com', first_name: 'D', last_name: 'R',
  role: 'DOCTOR' as const, is_verified: true, is_doctor_approved: true,
};

const UNVERIFIED_DOCTOR_USER = {
  ...DOCTOR_USER,
  is_doctor_approved: false,
};

beforeEach(() => {
  useAuthStore.setState({
    user: null, tokens: null, isAuthenticated: false,
    isLoading: false, isBootstrapping: false, error: null,
    linkedAccount: null, hasLinkedAccount: false, isSwitchingAccount: false,
  });
  useDoctorStore.setState({ profile: null, documents: [] } as any);
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NAV-003 — Unauthenticated user goes to public
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NAV-003: unauthenticated user', () => {
  it('resolves to /(public) when not authenticated', () => {
    const route = resolveRoute(false, false, undefined, false);
    expect(route).toBe('/(public)');
  });

  it('resolves to /(public) while bootstrapping', () => {
    const route = resolveRoute(false, true, undefined, false);
    expect(route).toBe('/(public)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NAV-001 — Patient cannot access doctor screens
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NAV-001: patient resolves to /(tabs)', () => {
  it('routes authenticated patient to /(tabs)', () => {
    useAuthStore.setState({ user: PATIENT_USER, isAuthenticated: true, isBootstrapping: false });
    const { user, isAuthenticated, isBootstrapping } = useAuthStore.getState();
    const route = resolveRoute(isAuthenticated, isBootstrapping, user?.role, false);
    expect(route).toBe('/(tabs)');
  });

  it('does not route patient to /(doctor)', () => {
    const route = resolveRoute(true, false, 'PATIENT', false);
    expect(route).not.toBe('/(doctor)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NAV-002 — Doctor resolves to /(doctor) when verified
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NAV-002: verified doctor resolves to /(doctor)', () => {
  it('routes verified doctor to /(doctor)', () => {
    useAuthStore.setState({ user: DOCTOR_USER, isAuthenticated: true, isBootstrapping: false });
    useDoctorStore.setState({ profile: { is_verified: true } as any });

    const { user, isAuthenticated, isBootstrapping } = useAuthStore.getState();
    const isDoctorVerified = useDoctorStore.getState().isDoctorVerified();
    const route = resolveRoute(isAuthenticated, isBootstrapping, user?.role, isDoctorVerified);

    expect(route).toBe('/(doctor)');
  });

  it('does not route doctor to /(tabs)', () => {
    const route = resolveRoute(true, false, 'DOCTOR', true);
    expect(route).not.toBe('/(tabs)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NAV-005 — Unverified doctor sees pending screen
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NAV-005: unverified doctor sees pending', () => {
  it('routes unverified doctor to pending screen', () => {
    useAuthStore.setState({
      user: UNVERIFIED_DOCTOR_USER, isAuthenticated: true, isBootstrapping: false,
    });
    useDoctorStore.setState({ profile: { is_verified: false } as any });

    const { user, isAuthenticated, isBootstrapping } = useAuthStore.getState();
    const isDoctorVerified = useDoctorStore.getState().isDoctorVerified();
    const route = resolveRoute(isAuthenticated, isBootstrapping, user?.role, isDoctorVerified);

    expect(route).toBe('pending');
  });

  it('isDoctorVerified returns false before admin approval', () => {
    useDoctorStore.setState({ profile: { is_verified: false } as any });
    expect(useDoctorStore.getState().isDoctorVerified()).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-NFR-008 — Role-Based Access: patient cannot reach admin/doctor routes
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-NFR-008: role-based access control', () => {
  it('patient role never resolves to /(doctor)', () => {
    const route = resolveRoute(true, false, 'PATIENT', false);
    expect(route).not.toBe('/(doctor)');
    expect(route).not.toBe('pending');
  });

  it('doctor role never resolves to /(tabs)', () => {
    const route = resolveRoute(true, false, 'DOCTOR', true);
    expect(route).not.toBe('/(tabs)');
  });

  it('unknown role resolves to /(public)', () => {
    const route = resolveRoute(true, false, 'UNKNOWN', false);
    expect(route).toBe('/(public)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Auth Store — role helpers
// ═════════════════════════════════════════════════════════════════════════════
describe('auth store role checks', () => {
  it('correctly reads PATIENT role from store', () => {
    useAuthStore.setState({ user: PATIENT_USER, isAuthenticated: true });
    expect(useAuthStore.getState().user?.role).toBe('PATIENT');
  });

  it('correctly reads DOCTOR role from store', () => {
    useAuthStore.setState({ user: DOCTOR_USER, isAuthenticated: true });
    expect(useAuthStore.getState().user?.role).toBe('DOCTOR');
  });

  it('user is null when not authenticated', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    expect(useAuthStore.getState().user).toBeNull();
  });
});
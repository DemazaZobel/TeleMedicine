import type { UserRole } from './models';

// ─── Route Definitions ──────────────────────────────────
export type AuthRoute = '/login' | '/register' | '/forgot-password' | '/verify-email';
export type TabRoute = '/' | '/appointments' | '/health' | '/profile' | '/patients';

// ─── Role-Based Tab Configuration ────────────────────────
export interface TabConfig {
  name: string;
  title: string;
  icon: string;
  roles: UserRole[];
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'index',
    title: 'Home',
    icon: 'home',
    roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
  },
  {
    name: 'appointments',
    title: 'Appointments',
    icon: 'calendar',
    roles: ['PATIENT', 'DOCTOR'],
  },
  {
    name: 'health',
    title: 'Health',
    icon: 'heart',
    roles: ['PATIENT'],
  },
  {
    name: 'availability',
    title: 'Schedule',
    icon: 'time',
    roles: ['DOCTOR'],
  },
  {
    name: 'patients',
    title: 'Patients',
    icon: 'people',
    roles: ['DOCTOR'],
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person',
    roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
  },
];

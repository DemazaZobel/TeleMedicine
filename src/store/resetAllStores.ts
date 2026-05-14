/**
 * resetAllStores — Clears all role-specific cached data across stores.
 * 
 * Called during account switching to prevent stale data from one role
 * (e.g., Doctor profile data) leaking into another role's UI (e.g., Patient).
 */
import { useDoctorStore } from './doctor.store';
import { useDiscoveryStore } from './discovery.store';
import { useBookingStore } from './booking.store';

export function resetAllStores() {
  useDoctorStore.getState().reset();
  useDiscoveryStore.getState().reset();
  useBookingStore.getState().reset();
}

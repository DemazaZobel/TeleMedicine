import { create } from 'zustand';

// ─── State ───────────────────────────────────────────────
interface BookingState {
  isImplemented: boolean;
}

// ─── Actions ─────────────────────────────────────────────
interface BookingActions {}

type BookingStore = BookingState & BookingActions;

const initialState: BookingState = {
  isImplemented: false,
};

/**
 * Skeleton store for the Booking feature.
 * Features are currently unimplemented on the backend.
 */
export const useBookingStore = create<BookingStore>(() => ({
  ...initialState,
}));

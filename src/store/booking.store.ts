import { create } from 'zustand';
import { bookingService } from '../features/booking/services/bookingService';
import type {
  AppointmentBookingPayload,
  AppointmentCancelPayload,
  AppointmentChangeRequestCreatePayload,
  AppointmentChangeResponsePayload,
  AppointmentDetail,
  AppointmentDoctorDecisionPayload,
  DoctorWalletDetail,
  NotificationDetail,
  NotificationPreferenceDetail,
  PaymentMethodDetail,
  ProviderAvailabilityRuleCreatePayload,
  ProviderAvailabilityRuleDetail
} from '../features/booking/types/bookingTypes';

interface BookingState {
  appointments: AppointmentDetail[];
  availabilityRules: ProviderAvailabilityRuleDetail[];
  doctorAvailabilityRules: ProviderAvailabilityRuleDetail[]; // Rules for the doctor being booked
  notifications: NotificationDetail[];
  preferences: NotificationPreferenceDetail | null;
  wallet: DoctorWalletDetail | null;
  paymentMethods: PaymentMethodDetail[];
  isLoading: boolean;
  error: string | null;
  isNotificationsDrawerOpen: boolean;
}

interface BookingActions {
  fetchMyAppointments: () => Promise<void>;
  bookAppointment: (payload: AppointmentBookingPayload) => Promise<AppointmentDetail>;
  cancelAppointment: (id: string | number, payload?: AppointmentCancelPayload) => Promise<{ message: string, late_cancellation: boolean }>;
  requestReschedule: (id: string | number, payload: AppointmentChangeRequestCreatePayload) => Promise<void>;
  getJoinLink: (id: string | number) => Promise<string>;
  fetchAvailabilityRules: () => Promise<void>;
  fetchDoctorAvailability: (doctorId: string | number) => Promise<void>;
  createAvailabilityRule: (payload: ProviderAvailabilityRuleCreatePayload) => Promise<void>;
  deleteAvailabilityRule: (id: string | number) => Promise<void>;
  doctorDecision: (id: string | number, payload: AppointmentDoctorDecisionPayload) => Promise<void>;
  respondToChangeRequest: (id: string | number, payload: AppointmentChangeResponsePayload) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string | number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (payload: Partial<NotificationPreferenceDetail>) => Promise<void>;

  // Payments
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (payload: any) => Promise<PaymentMethodDetail>;
  verifyPaymentMethod: (id: string | number, otp: string) => Promise<PaymentMethodDetail>;
  initiatePayment: (appointmentId: string | number, paymentMethodId: string | number) => Promise<string>;
  completeAppointment: (id: string | number) => Promise<void>;
  fetchWallet: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
  verifyPayment: (id: string | number) => Promise<void>;

  setIsNotificationsDrawerOpen: (open: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

type BookingStore = BookingState & BookingActions;

const initialState: BookingState = {
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
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  fetchMyAppointments: async () => {
    try {
      set({ isLoading: true, error: null });
      const appointments = await bookingService.getMyList();
      set({ appointments, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch appointments.'
      });
    }
  },

  bookAppointment: async (payload: AppointmentBookingPayload) => {
    try {
      set({ isLoading: true, error: null });
      const newAppointment = await bookingService.book(payload);
      set((state) => ({
        appointments: [newAppointment, ...state.appointments],
        isLoading: false,
      }));
      return newAppointment;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || error.message || 'Failed to book appointment.'
      });
      throw error;
    }
  },

  cancelAppointment: async (id: string | number, payload?: AppointmentCancelPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingService.cancel(id, payload);
      set((state) => ({
        appointments: state.appointments.map(app =>
          app.id === id ? response.appointment : app
        ),
        isLoading: false,
      }));
      return { message: response.message, late_cancellation: response.late_cancellation };
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || error.message || 'Failed to cancel appointment.'
      });
      throw error;
    }
  },

  getJoinLink: async (id: string | number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingService.getJoinLink(id);
      set({ isLoading: false });
      return response.meeting_link;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to get join link.'
      });
      throw error;
    }
  },

  requestReschedule: async (id: string | number, payload: AppointmentChangeRequestCreatePayload) => {
    try {
      set({ isLoading: true, error: null });
      await bookingService.createChangeRequest(id, payload);
      // We don't need to update the appointment here as it just creates a change request
      // The appointment status remains same until accepted.
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || error.message || 'Failed to request reschedule.'
      });
      throw error;
    }
  },

  fetchAvailabilityRules: async () => {
    try {
      set({ isLoading: true, error: null });
      const rules = await bookingService.getAvailabilityRules();
      set({ availabilityRules: rules, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to fetch availability rules.'
      });
    }
  },


  fetchDoctorAvailability: async (doctorId: string | number) => {
    try {
      set({ isLoading: true, error: null, doctorAvailabilityRules: [] }); // Clear previous
      const rules = await bookingService.getAvailabilityRules(doctorId);
      set({ doctorAvailabilityRules: rules, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to fetch doctor availability.'
      });
    }
  },

  createAvailabilityRule: async (payload: ProviderAvailabilityRuleCreatePayload) => {
    try {
      set({ isLoading: true, error: null });
      const rule = await bookingService.createAvailabilityRule(payload);
      set((state) => ({
        availabilityRules: [...state.availabilityRules, rule],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to create availability rule.'
      });
      throw error;
    }
  },


  deleteAvailabilityRule: async (id: string | number) => {
    try {
      console.log('[BookingStore] Deleting availability rule:', id);
      set({ isLoading: true, error: null });
      await bookingService.deleteAvailabilityRule(id);
      console.log('[BookingStore] Delete successful, updating state...');
      set((state) => ({
        availabilityRules: state.availabilityRules.filter((r) => String(r.id) !== String(id)),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('[BookingStore] Delete failed:', error);
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to delete availability rule.'
      });
      throw error;
    }
  },

  doctorDecision: async (id: string | number, payload: AppointmentDoctorDecisionPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingService.doctorDecision(id, payload);

      // The response can either be an AppointmentDetail directly (on accept) 
      // or an object with { message, appointment, change_request } (on propose change)
      const updatedAppointment = ('appointment' in response && response.appointment)
        ? response.appointment
        : (response as AppointmentDetail);

      if (updatedAppointment.id) {
        set((state) => ({
          appointments: state.appointments.map(app =>
            app.id === updatedAppointment.id ? updatedAppointment : app
          ),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to process decision.'
      });
      throw error;
    }
  },

  respondToChangeRequest: async (id: string | number, payload: AppointmentChangeResponsePayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingService.respondToChangeRequest(id, payload);
      set((state) => ({
        appointments: state.appointments.map(app =>
          app.id === response.appointment.id ? response.appointment : app
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to respond to change request.'
      });
      throw error;
    }
  },

  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });
      const notifications = await bookingService.getNotifications();
      set({ notifications, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to fetch notifications.'
      });
    }
  },

  markNotificationRead: async (id: string | number) => {
    try {
      await bookingService.markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      }));
    } catch (error) {
      // Ignore background errors for read receipts
    }
  },

  markAllNotificationsRead: async () => {
    const { notifications, markNotificationRead } = get();
    const unread = notifications.filter(n => !n.is_read);

    // Optimistically update UI
    set({
      notifications: notifications.map(n => ({ ...n, is_read: true }))
    });

    // Send requests in background
    Promise.allSettled(
      unread.map(n => bookingService.markNotificationRead(n.id))
    ).catch(() => { });
  },

  fetchPreferences: async () => {
    try {
      set({ isLoading: true, error: null });
      const preferences = await bookingService.getNotificationPreferences();
      set({ preferences, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to fetch preferences.'
      });
    }
  },

  updatePreferences: async (payload: Partial<NotificationPreferenceDetail>) => {
    try {
      set({ isLoading: true, error: null });
      const preferences = await bookingService.updateNotificationPreferences(payload);
      set({ preferences, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to update preferences.'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // ─── Payments ──────────────────────────────────────────

  fetchPaymentMethods: async () => {
    try {
      set({ isLoading: true, error: null });
      const methods = await bookingService.getPaymentMethods();
      set({ paymentMethods: methods, isLoading: false });
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.detail || error.message;
      set({
        isLoading: false,
        error: status ? `Error ${status}: ${message}` : message
      });
    }
  },

  addPaymentMethod: async (payload: any) => {
    try {
      set({ isLoading: true, error: null });
      const method = await bookingService.addPaymentMethod(payload);
      set((state) => ({ paymentMethods: [...state.paymentMethods, method], isLoading: false }));
      return method;
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.detail || error.message });
      throw error;
    }
  },

  verifyPaymentMethod: async (id: string | number, otp: string) => {
    try {
      set({ isLoading: true, error: null });
      const method = await bookingService.verifyPaymentMethod(id, otp);
      set((state) => ({
        paymentMethods: state.paymentMethods.map(m => m.id === id ? method : m),
        isLoading: false
      }));
      return method;
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.detail || error.message });
      throw error;
    }
  },

  initiatePayment: async (appointmentId: string | number, paymentMethodId: string | number) => {
    try {
      set({ isLoading: true, error: null });
      const { checkout_url } = await bookingService.initiatePayment(appointmentId, paymentMethodId);
      set({ isLoading: false });
      return checkout_url;
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.detail || error.message });
      throw error;
    }
  },

  completeAppointment: async (id: string | number) => {
    try {
      set({ isLoading: true, error: null });
      const updatedApp = await bookingService.completePayment(id);
      set((state) => ({
        appointments: state.appointments.map(app =>
          app.id === id ? updatedApp : app
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.detail || error.message });
      throw error;
    }
  },

  verifyPayment: async (id: string | number) => {
    try {
      set({ isLoading: true, error: null });
      // Since there is no dedicated verify-only endpoint yet, we refresh the entire list
      // to get the latest payment_status from the backend.
      const appointments = await bookingService.getMyList();
      set({ appointments, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
    }
  },

  fetchWallet: async () => {
    try {
      set({ isLoading: true, error: null });
      const wallet = await bookingService.getWallet();
      set({ wallet, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  fetchPaymentHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      await bookingService.getPaymentHistory();
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  setIsNotificationsDrawerOpen: (isNotificationsDrawerOpen) => set({ isNotificationsDrawerOpen }),

  reset: () => set(initialState),
}));

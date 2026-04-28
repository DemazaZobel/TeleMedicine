import { create } from 'zustand';
import { bookingService } from '../features/booking/services/bookingService';
import type {
  AppointmentDetail,
  AppointmentBookingPayload,
  AppointmentCancelPayload,
  ProviderAvailabilityRuleDetail,
  ProviderAvailabilityRuleCreatePayload,
  AppointmentChangeRequestDetail,
  AppointmentDoctorDecisionPayload,
  AppointmentChangeResponsePayload,
  NotificationDetail,
  NotificationPreferenceDetail
} from '../features/booking/types/bookingTypes';

interface BookingState {
  appointments: AppointmentDetail[];
  availabilityRules: ProviderAvailabilityRuleDetail[];
  notifications: NotificationDetail[];
  preferences: NotificationPreferenceDetail | null;
  wallet: DoctorWalletDetail | null;
  paymentMethods: PaymentMethodDetail[];
  isLoading: boolean;
  error: string | null;
}

interface BookingActions {
  fetchMyAppointments: () => Promise<void>;
  bookAppointment: (payload: AppointmentBookingPayload) => Promise<AppointmentDetail>;
  cancelAppointment: (id: string | number, payload?: AppointmentCancelPayload) => Promise<void>;
  fetchAvailabilityRules: () => Promise<void>;
  createAvailabilityRule: (payload: ProviderAvailabilityRuleCreatePayload) => Promise<void>;
  doctorDecision: (id: string | number, payload: AppointmentDoctorDecisionPayload) => Promise<void>;
  respondToChangeRequest: (id: string | number, payload: AppointmentChangeResponsePayload) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string | number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (payload: Partial<NotificationPreferenceDetail>) => Promise<void>;
  
  // Payments
  fetchPaymentMethods: () => Promise<void>;
  initiatePayment: (appointmentId: string | number, paymentMethodId: string | number) => Promise<string>;
  completeAppointment: (id: string | number) => Promise<void>;
  fetchWallet: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;

  clearError: () => void;
}

type BookingStore = BookingState & BookingActions;

const initialState: BookingState = {
  appointments: [],
  availabilityRules: [],
  notifications: [],
  preferences: null,
  wallet: null,
  paymentMethods: [],
  isLoading: false,
  error: null,
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
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || error.message || 'Failed to cancel appointment.'
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
    ).catch(() => {});
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
      const updatedApp = await bookingService.completeAppointment(id);
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
}));

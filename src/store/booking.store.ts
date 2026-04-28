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
  fetchPreferences: () => Promise<void>;
  updatePreferences: (payload: Partial<NotificationPreferenceDetail>) => Promise<void>;
  clearError: () => void;
}

type BookingStore = BookingState & BookingActions;

const initialState: BookingState = {
  appointments: [],
  availabilityRules: [],
  notifications: [],
  preferences: null,
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

  clearError: () => set({ error: null })
}));

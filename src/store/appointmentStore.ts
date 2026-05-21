// src/store/appointmentStore.ts

import { create } from "zustand";
import {
  Appointment,
  AppNotification,
  AppointmentBookingPayload,
  DoctorDecisionPayload,
  ChangeResponsePayload,
} from "../types/appointment";
import * as svc from "../services/appointmentService";

interface AppointmentState {
  // ── Data ──────────────────────────────────────────────────────────
  appointments: Appointment[];
  notifications: AppNotification[];
  unreadCount: number;

  // ── Loading / Error ───────────────────────────────────────────────
  loading: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────────
  fetchAppointments: () => Promise<void>;
  bookAppointment: (data: AppointmentBookingPayload) => Promise<Appointment>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  doctorDecision: (id: string, data: DoctorDecisionPayload) => Promise<void>;
  respondToChange: (
    changeRequestId: string,
    data: ChangeResponsePayload
  ) => Promise<void>;

  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;

  clearError: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // ── Appointments ──────────────────────────────────────────────────

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const data = await svc.getMyAppointments();
      set({ appointments: data, loading: false });
    } catch (e: any) {
      set({
        error: e?.response?.data?.detail ?? "Failed to load appointments.",
        loading: false,
      });
    }
  },

  bookAppointment: async (payload) => {
    set({ loading: true, error: null });
    try {
      const appointment = await svc.bookAppointment(payload);
      // Prepend new appointment to the list
      set((s) => ({
        appointments: [appointment, ...s.appointments],
        loading: false,
      }));
      return appointment;
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ?? "Failed to book appointment.";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  cancelAppointment: async (id, reason) => {
    set({ loading: true, error: null });
    try {
      const res = await svc.cancelAppointment(id, reason ? { reason } : undefined);
      // Update appointment in list
      set((s) => ({
        appointments: s.appointments.map((a) =>
          a.id === id ? res.appointment : a
        ),
        loading: false,
      }));
    } catch (e: any) {
      set({
        error: e?.response?.data?.detail ?? "Failed to cancel appointment.",
        loading: false,
      });
      throw e;
    }
  },

  doctorDecision: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await svc.doctorDecision(id, data);
      // The response may have .appointment or be the appointment itself
      const updated = res.appointment ?? res;
      set((s) => ({
        appointments: s.appointments.map((a) =>
          a.id === id ? updated : a
        ),
        loading: false,
      }));
    } catch (e: any) {
      set({
        error: e?.response?.data?.detail ?? "Action failed.",
        loading: false,
      });
      throw e;
    }
  },

  respondToChange: async (changeRequestId, data) => {
    set({ loading: true, error: null });
    try {
      const res = await svc.respondToChangeRequest(changeRequestId, data);
      if (res.appointment) {
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === res.appointment.id ? res.appointment : a
          ),
          loading: false,
        }));
      } else {
        set({ loading: false });
      }
    } catch (e: any) {
      set({
        error: e?.response?.data?.detail ?? "Failed to respond.",
        loading: false,
      });
      throw e;
    }
  },

  // ── Notifications ─────────────────────────────────────────────────

  fetchNotifications: async () => {
    try {
      const data = await svc.getNotifications();
      set({
        notifications: data,
        unreadCount: data.filter((n: AppNotification) => !n.is_read).length,
      });
    } catch {
      // Silently fail for notifications
    }
  },

  markNotificationRead: async (id) => {
    try {
      await svc.markNotificationRead(id);
      set((s) => {
        const updated = s.notifications.map((n: AppNotification) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.is_read).length,
        };
      });
    } catch {
      // Silently fail
    }
  },

  clearError: () => set({ error: null }),
}));

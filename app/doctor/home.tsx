import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppointmentCard from "../../components/AppointmentCard";
import { COLORS, RADII, SPACING } from "../../src/constants/theme";
import { useAppointmentStore } from "../../src/store/appointmentStore";
import { useAuthStore } from "../../src/store/authStore";

export default function DoctorHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { appointments, fetchAppointments, unreadCount, fetchNotifications } =
    useAppointmentStore();

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
  }, []);

  const pendingCount = appointments.filter(
    (a) => a.status === "REQUESTED"
  ).length;
  const todayAppointments = appointments.filter((a) => {
    const d = new Date(a.scheduled_start);
    const today = new Date();
    return (
      d.toDateString() === today.toDateString() &&
      (a.status === "CONFIRMED" || a.status === "REQUESTED")
    );
  });

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            Welcome back, Dr. {user?.last_name} 👋
          </Text>
          <Text style={styles.greetingSub}>
            Here's your overview for today
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
          <Ionicons name="hourglass" size={24} color="#92400E" />
          <Text style={[styles.statNumber, { color: "#92400E" }]}>
            {pendingCount}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
          <Ionicons name="today" size={24} color="#065F46" />
          <Text style={[styles.statNumber, { color: "#065F46" }]}>
            {todayAppointments.length}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
          <Ionicons name="calendar" size={24} color="#1E40AF" />
          <Text style={[styles.statNumber, { color: "#1E40AF" }]}>
            {appointments.filter((a) => a.status === "CONFIRMED").length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
      </View>

      {/* Today's appointments */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Appointments</Text>
        <TouchableOpacity
          onPress={() => router.push("/doctor/appointments" as any)}
        >
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {todayAppointments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="sunny-outline"
            size={40}
            color={`${COLORS.textMuted}60`}
          />
          <Text style={styles.emptyText}>
            No appointments scheduled for today
          </Text>
        </View>
      ) : (
        todayAppointments.slice(0, 3).map((apt) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            role="DOCTOR"
            onPress={() =>
              router.push({
                pathname: "/appointment/[id]",
                params: { id: apt.id },
              } as any)
            }
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 40,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  greetingSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.s,
    marginBottom: SPACING.l,
  },
  statCard: {
    flex: 1,
    borderRadius: RADII.l,
    padding: SPACING.m,
    alignItems: "center",
    gap: SPACING.xs,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.l,
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
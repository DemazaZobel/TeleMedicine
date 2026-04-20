import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import { Appointment, AppointmentStatus } from "../../src/types/appointment";

type FilterTab = "upcoming" | "past" | "cancelled";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

function filterAppointments(
  list: Appointment[],
  tab: FilterTab
): Appointment[] {
  const now = new Date();
  switch (tab) {
    case "upcoming":
      return list.filter(
        (a) =>
          (a.status === "REQUESTED" || a.status === "CONFIRMED") &&
          new Date(a.scheduled_start) >= now
      );
    case "past":
      return list.filter(
        (a) =>
          a.status === "COMPLETED" ||
          (a.status === "CONFIRMED" && new Date(a.scheduled_end) < now)
      );
    case "cancelled":
      return list.filter((a) => a.status === "CANCELLED");
    default:
      return list;
  }
}

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { appointments, loading, fetchAppointments, error, clearError } =
    useAppointmentStore();

  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const filtered = filterAppointments(appointments, activeTab);

  const renderEmpty = () => {
    if (loading) return null;
    const messages: Record<FilterTab, string> = {
      upcoming: "No upcoming appointments.\nBook one to get started!",
      past: "No past appointments yet.",
      cancelled: "No cancelled appointments.",
    };
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="calendar-outline"
          size={56}
          color={`${COLORS.textMuted}60`}
        />
        <Text style={styles.emptyText}>{messages[activeTab]}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Loading */}
      {loading && appointments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              role={user?.role ?? "PATIENT"}
              onPress={() =>
                router.push({
                  pathname: "/appointment/[id]",
                  params: { id: item.id },
                } as any)
              }
            />
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}

      {/* FAB — Book Appointment */}
      {user?.role === "PATIENT" && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={() => router.push("/appointment/book" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    gap: SPACING.s,
  },
  filterTab: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADII.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  filterLabelActive: {
    color: "#fff",
  },
  list: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: SPACING.m,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    marginHorizontal: SPACING.l,
    borderRadius: RADII.s,
    marginBottom: SPACING.s,
    justifyContent: "space-between",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    flex: 1,
    marginRight: SPACING.s,
  },
  fab: {
    position: "absolute",
    right: SPACING.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

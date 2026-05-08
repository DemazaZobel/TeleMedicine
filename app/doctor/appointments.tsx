import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import StatusBadge from "../../components/StatusBadge";
import { COLORS, RADII, SPACING } from "../../src/constants/theme";
import { useAppointmentStore } from "../../src/store/appointmentStore";
import { Appointment, AppointmentStatus } from "../../src/types/appointment";

type DoctorFilter = "requests" | "confirmed" | "all";

const FILTERS: { key: DoctorFilter; label: string }[] = [
  { key: "requests", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "all", label: "All" },
];

function filterForDoctor(list: Appointment[], tab: DoctorFilter): Appointment[] {
  switch (tab) {
    case "requests":
      return list.filter((a) => a.status === "REQUESTED");
    case "confirmed":
      return list.filter((a) => a.status === "CONFIRMED");
    case "all":
    default:
      return list;
  }
}

export default function DoctorAppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    appointments,
    loading,
    fetchAppointments,
    doctorDecision,
    error,
    clearError,
  } = useAppointmentStore();

  const [activeTab, setActiveTab] = useState<DoctorFilter>("requests");
  const [refreshing, setRefreshing] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const handleAccept = async (apt: Appointment) => {
    setActingOn(apt.id);
    try {
      await doctorDecision(apt.id, { action: "accept" });
      Alert.alert("Accepted", "Appointment confirmed successfully.");
    } catch {
      Alert.alert("Error", "Failed to accept appointment.");
    } finally {
      setActingOn(null);
    }
  };

  const filtered = filterForDoctor(appointments, activeTab);
  const requestCount = appointments.filter((a) => a.status === "REQUESTED").length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
        {requestCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{requestCount} pending</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((tab) => {
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

      {/* Error */}
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
            <View>
              <AppointmentCard
                appointment={item}
                role="DOCTOR"
                onPress={() =>
                  router.push({
                    pathname: "/appointment/[id]",
                    params: { id: item.id },
                  } as any)
                }
              />
              {/* Quick action for pending */}
              {item.status === "REQUESTED" && (
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.quickAccept}
                    onPress={() => handleAccept(item)}
                    disabled={actingOn === item.id}
                  >
                    {actingOn === item.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.quickAcceptText}>Accept</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickView}
                    onPress={() =>
                      router.push({
                        pathname: "/appointment/[id]",
                        params: { id: item.id },
                      } as any)
                    }
                  >
                    <Ionicons
                      name="eye-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.quickViewText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={56}
                color={`${COLORS.textMuted}60`}
              />
              <Text style={styles.emptyText}>
                {activeTab === "requests"
                  ? "No pending appointment requests"
                  : "No appointments found"}
              </Text>
            </View>
          }
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    gap: SPACING.s,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: RADII.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "700",
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
    paddingBottom: 40,
  },
  quickActions: {
    flexDirection: "row",
    gap: SPACING.s,
    marginTop: -SPACING.s,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.xs,
  },
  quickAccept: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADII.s,
  },
  quickAcceptText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  quickView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.primary}14`,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADII.s,
  },
  quickViewText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
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
});

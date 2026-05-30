import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "../../src/i18n";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  EmptyState,
  PageHeader,
  ScreenContainer,
} from "../../src/components/ui";

import { AppointmentCard } from "../../src/features/booking/components/AppointmentCard";
import { PendingApproval } from "../../src/features/doctor/components/PendingApproval";

import { useAuthStore } from "../../src/store/authStore";
import { useBookingStore } from "../../src/store/booking.store";
import { useDoctorStore } from "../../src/store/doctor.store";

import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

type DoctorFilter = "all" | "requests" | "confirmed";

const FILTERS: { key: DoctorFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "requests", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
];

export default function DoctorAppointmentsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();

  const user = useAuthStore((s) => s.user);
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());

  const {
    appointments,
    isLoading,
    fetchMyAppointments,
    doctorDecision,
  } = useBookingStore();

  const [activeTab, setActiveTab] = useState<DoctorFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

  useEffect(() => {
    if (isVerified) fetchMyAppointments();
  }, [isVerified]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyAppointments();
    setRefreshing(false);
  }, [fetchMyAppointments]);

  const handleAccept = async (id: string | number) => {
    setActingOn(String(id));
    try {
      await doctorDecision(id, { action: "accept" });
      Alert.alert(
        t("appointment:accepted"),
        t("appointment:confirmedSuccessMessage")
      );
    } catch {
      Alert.alert("Error", t("errors:acceptFailed"));
    } finally {
      setActingOn(null);
    }
  };

  const handleViewDetails = (id: string | number) => {
    router.push({
      pathname: "/appointment/[id]",
      params: { id },
    } as any);
  };

  if (!isVerified) return <PendingApproval />;

  const filtered = appointments.filter((a) => {
    if (activeTab === "requests") return a.status === "REQUESTED";
    if (activeTab === "confirmed") return a.status === "CONFIRMED";
    return a.status?.toUpperCase() !== "CANCELLED";
  });

  const requestCount = appointments.filter(
    (a) => a.status === "REQUESTED"
  ).length;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.pageWrapper}>
        {/* Header */}
        <PageHeader
          title="Appointments"
          subtitle="Manage your schedule"
          rightElement={
            requestCount > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {requestCount} pending
                </Text>
              </View>
            ) : undefined
          }
        />

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                ]}
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

        {/* Loading */}
        {isLoading && appointments.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title="No Appointments"
                description={
                  activeTab === "requests"
                    ? "No pending appointment requests"
                    : "No appointments found"
                }
              />
            }
            renderItem={({ item }) => (
              <View>
                <AppointmentCard
                  appointment={item}
                  isDoctor
                />

                {/* Quick actions */}
                {item.status === "REQUESTED" && (
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.quickAccept}
                      onPress={() => handleAccept(item.id)}
                      disabled={actingOn === String(item.id)}
                    >
                      {actingOn === String(item.id) ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#fff"
                          />
                          <Text style={styles.quickAcceptText}>
                            {t("common:accept")}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickView}
                      onPress={() => handleViewDetails(item.id)}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.quickViewText}>
                        {t("appointment:viewDetails")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },

  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  filterTabActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  filterLabelActive: {
    color: "#fff",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  countBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b45309",
  },

  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  quickAccept: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    gap: 5,
  },

  quickAcceptText: {
    color: "#fff",
    fontWeight: "600",
  },

  quickView: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
    alignItems: "center",
    gap: 5,
  },

  quickViewText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});
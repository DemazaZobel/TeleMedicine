import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList,
  RefreshControl,
  StyleSheet,
  Text, TouchableOpacity,
  useWindowDimensions, View,
} from "react-native";
import { EmptyState, PageHeader, ScreenContainer } from "../../src/components/ui";
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
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

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
      Alert.alert("Accepted", "Appointment confirmed successfully.");
    } catch {
      Alert.alert("Error", "Failed to accept appointment.");
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

  const requestCount = appointments.filter((a) => a.status === "REQUESTED").length;

  const { width } = useWindowDimensions();
  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

  const renderEmpty = () => {
    if (isLoading && !refreshing) return null;
    return (
      <EmptyState
        icon="calendar-outline"
        title="No Appointments"
        description={
          activeTab === "requests"
            ? "No pending appointment requests"
            : "No appointments found"
        }
      />
    );
  };

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
                <Text style={styles.countText}>{requestCount} pending</Text>
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
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        {isLoading && !refreshing && appointments.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            key={`grid-${numColumns}`}
            data={filtered}
            numColumns={numColumns}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
            renderItem={({ item }) => (
              <View style={[styles.cardContainer, { maxWidth: `${100 / numColumns}%` }]}>
                <AppointmentCard
                  appointment={item}
                  isDoctor
                  onAccept={() => handleAccept(item.id)}
                  onCancel={() => handleViewDetails(item.id)} // Maps clean interaction logic safely inside the primary container layout
                />
              </View>
            )}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pageWrapper: {
      flex: 1,
      width: "100%",
      maxWidth: 1100,
      alignSelf: "center",
    },
    filterRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    filterTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    filterLabelActive: {
      color: "#fff",
    },
    listContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: 100,
      paddingTop: theme.spacing.md,
      flexGrow: 1,
    },
    columnWrapper: {
      gap: theme.spacing.md,
    },
    cardContainer: {
      flex: 1,
      marginBottom: theme.spacing.md,
    },
    countBadge: {
      backgroundColor: theme.colors.warning + "20",
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.warning + "40",
    },
    countText: {
      color: theme.colors.warning,
      fontSize: 12,
      fontWeight: "700",
    },
    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
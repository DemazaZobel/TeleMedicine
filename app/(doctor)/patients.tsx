import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Button,
  Card,
  Input,
  PageHeader,
  ScreenContainer,
} from "../../src/components/ui";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { PendingApproval } from "../../src/features/doctor/components/PendingApproval";
import { useAuthStore } from "../../src/store/authStore";
import { useBookingStore } from "../../src/store/booking.store";
import { useDoctorStore } from "../../src/store/doctor.store";
import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

/** Doctor-only tab — hidden for PATIENT and ADMIN roles via the tabs layout. */
export default function PatientsScreen() {
  const isDoctor = useAuthStore((s) => s.user?.role === "DOCTOR");
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { appointments, isLoading, fetchMyAppointments } = useBookingStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (isDoctor && isVerified) {
      fetchMyAppointments();
    }
  }, [isDoctor, isVerified, fetchMyAppointments]);

  const uniquePatients = useMemo(() => {
    const map = new Map();
    appointments.forEach((app) => {
      // Safely access patient details from flat fields or legacy nested objects
      const patientId = app.patient?.id || app.patient_user_id;
      if (patientId && !map.has(patientId)) {
        const patientData = {
          id: patientId,
          first_name:
            app.patient?.user?.first_name ||
            app.patient_first_name ||
            "Unknown",
          last_name:
            app.patient?.user?.last_name || app.patient_last_name || "Patient",
          email: app.patient?.user?.email || "No email provided",
        };
        map.set(patientId, patientData);
      }
    });
    const uniqueArray = Array.from(map.values());

    // Filter
    let filtered = uniqueArray;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.first_name.toLowerCase().includes(q) ||
          p.last_name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
      const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
      if (sortOrder === "asc") return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });

    return filtered;
  }, [appointments, searchQuery, sortOrder]);

  if (isDoctor && !isVerified) {
    return <PendingApproval />;
  }

  const renderPatient = ({ item }: { item: any }) => {
    const initials =
      `${item.first_name?.[0] || ""}${item.last_name?.[0] || ""}`.toUpperCase();

    // Fallbacks since backend doesn't send this yet
    const allergies = item.allergies || "No known allergies reported.";
    const history = item.medical_history || "No medical history provided.";

    return (
      <View style={styles.patientCardWrapper}>
        <Card style={styles.patientCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.medicalInfoRow}>
            <View style={styles.medicalInfoBlock}>
              <Text style={styles.medicalLabel}>ALLERGIES</Text>
              <Text style={styles.medicalValue} numberOfLines={2}>
                {allergies}
              </Text>
            </View>
            <View style={styles.medicalInfoBlock}>
              <Text style={styles.medicalLabel}>MEDICAL HISTORY</Text>
              <Text style={styles.medicalValue} numberOfLines={2}>
                {history}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.pageWrapper}>
        <PageHeader
          title="Your Patients"
          subtitle="View and manage patients you have consulted with"
        />

        {/* ── Search & Filter Bar ── */}
        <View style={styles.toolbar}>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search patients by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={{ marginBottom: 0, flex: 1 }}
              leftIcon={
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={theme.colors.textTertiary}
                />
              }
            />
          </View>
          <Button
            title={sortOrder === "asc" ? "A-Z" : "Z-A"}
            variant="outline"
            icon={
              <Ionicons
                name="filter"
                size={16}
                color={theme.colors.primary}
                style={{ marginRight: 6 }}
              />
            }
            onPress={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            style={styles.sortBtn}
          />
        </View>

        {isLoading && uniquePatients.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={uniquePatients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPatient}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No Patients Yet"
                description="Patients will appear here once they book appointments with you."
              />
            }
            showsVerticalScrollIndicator={false}
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
    toolbar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    searchContainer: {
      flex: 1,
    },
    sortBtn: {
      height: 48, // Match input height
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 40,
      paddingHorizontal: theme.spacing.xl,
    },
    patientCardWrapper: {
      marginBottom: theme.spacing.lg,
    },
    patientCard: {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.04)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.primaryLight + "40",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    avatarInitials: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    infoContainer: {
      flex: 1,
    },
    name: {
      ...theme.typography.h4,
      fontSize: 17,
      color: theme.colors.text,
      marginBottom: 2,
    },
    email: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 14,
    },
    medicalInfoRow: {
      flexDirection: "row",
      gap: 16,
    },
    medicalInfoBlock: {
      flex: 1,
    },
    medicalLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.colors.textTertiary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    medicalValue: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
  });

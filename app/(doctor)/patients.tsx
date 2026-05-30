import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from '../../src/i18n';
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View,
} from "react-native";
import {
  EmptyState, PageHeader, ScreenContainer,
} from "../../src/components/ui";
import type { AppointmentDetail } from "../../src/features/booking/types/bookingTypes";
import { useBookingStore } from "../../src/store/booking.store";
import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientSummary {
  userId: string;
  firstName: string;
  lastName: string;
  // Latest appointment info
  latestAppointment: AppointmentDetail;
  // All appointments with this patient
  totalAppointments: number;
  completedAppointments: number;
  // Medical info from latest appointment's patient_profile
  profile?: AppointmentDetail["patient_profile"];
}

type FilterStatus = "all" | "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusConfig(status: string, theme: any) {
  switch (status) {
    case "CONFIRMED": return { color: theme.colors.primary, icon: "checkmark-circle-outline", label: "Confirmed" };
    case "COMPLETED": return { color: theme.colors.success, icon: "checkmark-done-outline", label: "Completed" };
    case "CANCELLED": return { color: theme.colors.error, icon: "close-circle-outline", label: "Cancelled" };
    case "REQUESTED": return { color: theme.colors.warning, icon: "time-outline", label: "Requested" };
    default: return { color: theme.colors.textSecondary, icon: "ellipse-outline", label: status };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

function getInitials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

// Consistent avatar color per patient
const AVATAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#10B981", "#EF4444",
  "#F59E0B", "#06B6D4", "#F97316", "#EC4899",
];
function avatarColor(userId: string): string {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientsScreen() {
  const { t } = useTranslation();
  const isDoctor = useAuthStore((s) => s.user?.role === "DOCTOR");
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { appointments, fetchMyAppointments, isLoading } = useBookingStore();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchMyAppointments(); }, []);

  // ── Derive unique patients from appointments ──────────────────────────────
  const patients = useMemo<PatientSummary[]>(() => {
    const map = new Map<string, PatientSummary>();

    // Sort newest first so latestAppointment is correct
    const sorted = [...appointments].sort(
      (a, b) => new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime()
    );

    for (const appt of sorted) {
      const uid = appt.patient_user_id ?? appt.patient?.user?.id?.toString();
      if (!uid) continue;

      if (!map.has(uid)) {
        map.set(uid, {
          userId: uid,
          firstName: appt.patient_first_name ?? appt.patient?.user?.first_name ?? "Unknown",
          lastName: appt.patient_last_name ?? appt.patient?.user?.last_name ?? "",
          latestAppointment: appt,
          totalAppointments: 0,
          completedAppointments: 0,
          profile: (appt as any).patient_profile,
        });
      }

      const p = map.get(uid)!;
      p.totalAppointments += 1;
      if (appt.status === "COMPLETED") p.completedAppointments += 1;
    }

    return [...map.values()];
  }, [appointments]);

  // ── Filter + search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesFilter =
        filter === "all" ||
        p.latestAppointment.status === filter;

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.profile?.email?.toLowerCase().includes(q) ||
        p.profile?.city?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [patients, filter, search]);

  // ── Render ────────────────────────────────────────────────────────────────

  const renderPatient = ({ item }: { item: PatientSummary }) => {
    const appt = item.latestAppointment;
    const status = getStatusConfig(appt.status, theme);
    const color = avatarColor(item.userId);
    const isOpen = expandedId === item.userId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpandedId(isOpen ? null : item.userId)}
        activeOpacity={0.85}
      >
        {/* ── Row ── */}
        <View style={styles.cardRow}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: color + "20" }]}>
            <Text style={[styles.avatarText, { color }]}>
              {getInitials(item.firstName, item.lastName)}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.patientName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.appointmentMeta}>
              {formatDate(appt.scheduled_start)} · {formatTime(appt.scheduled_start)}
            </Text>
            <View style={styles.tagRow}>
              {/* Status badge */}
              <View style={[styles.badge, { backgroundColor: status.color + "15" }]}>
                <Ionicons name={status.icon as any} size={11} color={status.color} />
                <Text style={[styles.badgeText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
              {/* Mode badge */}
              <View style={[styles.badge, { backgroundColor: theme.colors.primary + "10" }]}>
                <Ionicons
                  name={appt.mode === "ONLINE" ? "videocam-outline" : "location-outline"}
                  size={11}
                  color={theme.colors.primary}
                />
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                  {appt.mode === "ONLINE" ? "Online" : "In-Person"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.medicalInfoRow}>
            <View style={styles.medicalInfoBlock}>
              <Text style={styles.medicalLabel}>{t("doctor:allergiesTitle")}</Text>
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
        )}
      </TouchableOpacity>
    );
  };

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "REQUESTED", label: "Requested" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.pageWrapper}>
        <PageHeader
          title={t("doctor:yourPatients")}
          subtitle={t("doctor:patientsSub")}
        />

        {/* ── Search & Filter Bar ── */}
        <View style={styles.toolbar}>
          <View style={styles.searchContainer}>
            <Input
              placeholder={t("doctor:searchPatientsPlaceholder")}
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
                title={t("doctor:noPatientsYet")}
                description={t("doctor:noPatientsDesc")}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        }
      />
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: Theme) => StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  filterRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: "#fff",
  },
  list: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  appointmentMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tagRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: 4,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardRight: {
    alignItems: "center",
  },
  apptCount: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  apptCountLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },

  // Expanded
  expandedSection: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  expandDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    minWidth: 70,
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "500",
  },
  statsFooter: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  statNum: {
    fontSize: 16,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    padding: 0,
  },
});
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View,
} from "react-native";
import {
  PageHeader, ScreenContainer
} from "../../src/components/ui";
import { EmptyState } from "../../src/components/ui/EmptyState";
import type { AppointmentDetail } from "../../src/features/booking/types/bookingTypes";
import { useTranslation } from "../../src/i18n";
import { useBookingStore } from "../../src/store/booking.store";
import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientSummary {
  userId: string;
  firstName: string;
  lastName: string;
  latestAppointment: AppointmentDetail;
  totalAppointments: number;
  completedAppointments: number;
  profile?: AppointmentDetail["patient_profile"];
}

type FilterStatus = "all" | "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusConfig(status: string, theme: any, t: (key: string) => string) {
  switch (status) {
    case "CONFIRMED": return { color: theme.colors.primary, label: t("patientsScreen.status.confirmed") };
    case "COMPLETED": return { color: theme.colors.success, label: t("patientsScreen.status.completed") };
    case "CANCELLED": return { color: theme.colors.error, label: t("patientsScreen.status.cancelled") };
    case "REQUESTED": return { color: theme.colors.warning, label: t("patientsScreen.status.requested") };
    default: return { color: theme.colors.textSecondary, label: status };
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

const AVATAR_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#EF4444", "#F59E0B"];
function avatarColor(userId: string): string {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] || "#3B82F6";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation("patient");

  const { appointments, fetchMyAppointments } = useBookingStore();
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);
  const router = useRouter();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchMyAppointments(); }, []);

  const patients = useMemo<PatientSummary[]>(() => {
    const map = new Map<string, PatientSummary>();
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

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesFilter = filter === "all" || p.latestAppointment.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.profile?.email?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [patients, filter, search]);

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: "all", label: t("patientsScreen.filters.all") },
    { key: "REQUESTED", label: t("patientsScreen.filters.requested") },
    { key: "CONFIRMED", label: t("patientsScreen.filters.confirmed") },
    { key: "COMPLETED", label: t("patientsScreen.filters.completed") },
  ];

  const renderPatient = ({ item }: { item: PatientSummary }) => {
    const appt = item.latestAppointment;
    const status = getStatusConfig(appt.status, theme, t);
    const color = avatarColor(item.userId);
    const isOpen = expandedId === item.userId;

    return (
      <TouchableOpacity
        style={[styles.card, isOpen && styles.cardExpanded]}
        onPress={() => setExpandedId(isOpen ? null : item.userId)}
        activeOpacity={0.7}
      >
        {/* Main Content Area */}
        <View style={styles.cardRow}>
          {/* Left: Minimal Avatar Circle */}
          <View style={[styles.avatar, { borderColor: color }]}>
            <Text style={[styles.avatarText, { color }]}>
              {getInitials(item.firstName, item.lastName)}
            </Text>
          </View>

          {/* Middle: Core Information Details */}
          <View style={styles.cardInfo}>
            <Text style={styles.patientName}>
              {item.firstName} {item.lastName}
            </Text>

            <Text style={styles.appointmentMeta}>
              {formatDate(appt.scheduled_start)} · {formatTime(appt.scheduled_start)}
            </Text>

            <View style={styles.tagRow}>
              {/* Clean Status Indicator */}
              <View style={styles.badge}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={styles.badgeText}>{status.label}</Text>
              </View>

              <Text style={styles.tagSeparator}>·</Text>

              {/* Mode indicator */}
              <View style={styles.badge}>
                <Ionicons
                  name={appt.mode === "ONLINE" ? "videocam-outline" : "location-outline"}
                  size={12}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.badgeText}>
                  {appt.mode === "ONLINE"
                    ? t("patientsScreen.mode.online")
                    : t("patientsScreen.mode.inPerson")}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Area: Structured Minimal Stats */}
          <View style={styles.cardRight}>
            <View style={styles.visitBadge}>
              <Text style={styles.visitCount}>{item.totalAppointments}</Text>
              <Text style={styles.visitLabel}>
                {item.totalAppointments === 1
                  ? t("patientsScreen.visit_one")
                  : t("patientsScreen.visit_other")}
              </Text>
            </View>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={14}
              color={theme.colors.textTertiary}
            />
          </View>
        </View>

        {/* Collapsible Section Layout */}
        {isOpen && (
          <View style={styles.expandedSection}>
            {appt.reason && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("patientsScreen.details.reason")}</Text>
                <Text style={styles.detailValue}>{appt.reason}</Text>
              </View>
            )}

            {item.profile?.blood_type && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("patientsScreen.details.bloodType")}</Text>
                <Text style={styles.detailValue}>{item.profile.blood_type}</Text>
              </View>
            )}

            {item.profile?.allergies && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("patientsScreen.details.allergies")}</Text>
                <Text style={styles.detailValue}>{item.profile.allergies}</Text>
              </View>
            )}

            {item.profile?.phone_number && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("patientsScreen.details.phone")}</Text>
                <Text style={styles.detailValue}>{item.profile.phone_number}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer scrollable={false} padded constrained style={styles.container}>
      <PageHeader
        title={t("patientsScreen.title")}
        subtitle={t("patientsScreen.subtitle_other", { count: patients.length })}
      />

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={theme.colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("patientsScreen.searchPlaceholder")}
          placeholderTextColor={theme.colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.userId}
        renderItem={renderPatient}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={t("patientsScreen.noPatients.title")}
            description={t("patientsScreen.noPatients.description")}
          />
        }
      />
    </ScreenContainer>
  );
}
// ─── Modern Minimal Styles ───────────────────────────────────────────────────

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  cardExpanded: {
    borderColor: theme.colors.textSecondary,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    letterSpacing: -0.1,
  },
  appointmentMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "400",
  },
  tagSeparator: {
    color: theme.colors.textTertiary,
    fontSize: 12,
  },

  // ─── Beautiful Redesigned Message Action ───
  messageButtonContainer: {
    alignSelf: "flex-start", // Prevents full-width expansion completely
    marginTop: 2,
  },
  messageButtonStyle: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "transparent",
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "500",
    alignSelf: "flex-start", // Prevents full-width expansion completely
    marginTop: 2,
  },
  messageButtonTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "500",

  },

  cardRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 68,
  },
  visitBadge: {
    alignItems: "flex-end",
  },
  visitCount: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  visitLabel: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },

  // ─── Minimal Expanded Layout ───
  expandedSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
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
});

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { EmptyState, PageHeader, ScreenContainer } from "../../src/components/ui";
import { AppointmentCard } from "../../src/features/booking/components/AppointmentCard";
import { PendingApproval } from "../../src/features/doctor/components/PendingApproval";
import { useTranslation } from "../../src/i18n";
import { useAuthStore } from "../../src/store/authStore";
import { useBookingStore } from "../../src/store/booking.store";
import { useDoctorStore } from "../../src/store/doctor.store";
import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

type FilterKey = "all" | "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// Counts per filter key
function getCounts(appointments: any[]) {
  return {
    all: appointments.filter(a => a.status !== 'CANCELLED').length,
    REQUESTED: appointments.filter(a => a.status === 'REQUESTED').length,
    CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
  };
}

export default function DoctorAppointmentsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation('appointment');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const user = useAuthStore((s) => s.user);
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const { appointments, isLoading, fetchMyAppointments, doctorDecision } = useBookingStore();

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [refreshing, setRefreshing] = useState(false);

  const isDesktop = width > 900;
  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

  // Built here so labels are reactive to language changes
  const FILTERS: { key: FilterKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "all", label: t('filters.all'), icon: "apps-outline" },
    { key: "REQUESTED", label: t('filters.requested'), icon: "time-outline" },
    { key: "CONFIRMED", label: t('filters.confirmed'), icon: "checkmark-circle-outline" },
    { key: "COMPLETED", label: t('filters.completed'), icon: "trophy-outline" },
    { key: "CANCELLED", label: t('filters.cancelled'), icon: "close-circle-outline" },
  ];

  useEffect(() => {
    if (isVerified) fetchMyAppointments();
  }, [isVerified]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyAppointments();
    setRefreshing(false);
  }, [fetchMyAppointments]);

  const handleAccept = async (id: string | number) => {
    try {
      await doctorDecision(id, { action: "accept" });
      Alert.alert(
        t('alerts.acceptSuccess.title'),
        t('alerts.acceptSuccess.message')
      );
    } catch {
      Alert.alert(
        t('alerts.acceptError.title'),
        t('alerts.acceptError.message')
      );
    }
  };

  if (!isVerified) return <PendingApproval />;

  const counts = getCounts(appointments);

  const filtered = appointments.filter((a) => {
    if (activeFilter === "all") return a.status !== "CANCELLED";
    return a.status === activeFilter;
  });

  // Sort: REQUESTED first, then by date
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'REQUESTED' && b.status !== 'REQUESTED') return -1;
    if (b.status === 'REQUESTED' && a.status !== 'REQUESTED') return 1;
    return new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime();
  });

  // Map FilterKey → lowercase JSON key
  const filterKeyMap: Record<FilterKey, string> = {
    all: 'all',
    REQUESTED: 'requested',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };

  const renderEmpty = () => {
    if (isLoading && !refreshing) return null;
    const jsonKey = filterKeyMap[activeFilter];
    return (
      <EmptyState
        icon="calendar-outline"
        title={t(`empty.${jsonKey}.title`)}
        description={t(`empty.${jsonKey}.desc`)}
      />
    );
  };

  const summaryItems = [
    { label: t('summary.upcoming'), value: counts.CONFIRMED, color: theme.colors.primary },
    { label: t('summary.pending'), value: counts.REQUESTED, color: theme.colors.warning },
    { label: t('summary.completed'), value: counts.COMPLETED, color: theme.colors.success },
    { label: t('summary.cancelled'), value: counts.CANCELLED, color: theme.colors.error },
  ];

  return (
    <ScreenContainer scrollable={false} padded={false} constrained>
      <View style={styles.pageWrapper}>

        {/* ── Header ── */}
        <PageHeader
          title={t('screen.title')}
          subtitle={t('screen.subtitle', { active: counts.all, pending: counts.REQUESTED })}
          rightElement={
            counts.REQUESTED > 0 ? (
              <View style={styles.pendingBadge}>
                <View style={styles.pendingDot} />
                <Text style={styles.pendingText}>
                  {t('screen.pendingBadge', { count: counts.REQUESTED })}
                </Text>
              </View>
            ) : undefined
          }
        />

        {/* ── Summary strip ── */}
        <View style={styles.summaryStrip}>
          {summaryItems.map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.summaryDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Filter tabs ── */}
        <View style={styles.filterWrap}>
          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={f => f.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            renderItem={({ item: f }) => {
              const isActive = activeFilter === f.key;
              const count = counts[f.key];
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={f.icon}
                    size={14}
                    color={isActive ? '#fff' : theme.colors.textSecondary}
                  />
                  <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                    {f.label}
                  </Text>
                  {count > 0 && (
                    <View style={[
                      styles.filterCount,
                      isActive ? styles.filterCountActive : null,
                    ]}>
                      <Text style={[
                        styles.filterCountText,
                        isActive && styles.filterCountTextActive,
                      ]}>
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* ── List ── */}
        {isLoading && !refreshing && appointments.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            key={`grid-${numColumns}`}
            data={sorted}
            numColumns={numColumns}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
            renderItem={({ item }) => (
              <View style={[styles.cardWrap, { maxWidth: `${100 / numColumns}%` as any }]}>
                <AppointmentCard
                  appointment={item}
                  isDoctor
                  onAccept={() => handleAccept(item.id)}
                  onRefreshList={onRefresh}
                  onCancel={() => router.push({
                    pathname: "/appointment/[id]",
                    params: { id: item.id },
                  } as any)}
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
      maxWidth: 1200,
      alignSelf: "center",
    },

    // ── Pending badge ────────────────────────────────────
    pendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.warning + '18',
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.warning + '35',
    },
    pendingDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.warning,
    },
    pendingText: {
      color: theme.colors.warning,
      fontSize: 12,
      fontWeight: '700',
    },

    // ── Summary strip ────────────────────────────────────
    summaryStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    summaryVal: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 2,
    },
    summaryLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    summaryDivider: {
      width: 1,
      height: 36,
      backgroundColor: theme.colors.border,
    },

    // ── Filter chips ─────────────────────────────────────
    filterWrap: {
      marginBottom: theme.spacing.md,
    },
    filterList: {
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    filterLabelActive: {
      color: '#fff',
    },
    filterCount: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    filterCountActive: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    filterCountText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    filterCountTextActive: {
      color: '#fff',
    },

    // ── List ─────────────────────────────────────────────
    listContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.md,
      paddingBottom: 120,
      flexGrow: 1,
    },
    columnWrapper: {
      gap: theme.spacing.md,
    },
    cardWrap: {
      flex: 1,
    },
    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
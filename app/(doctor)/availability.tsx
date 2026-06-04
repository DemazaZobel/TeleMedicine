import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList,
  Platform,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import {
  EmptyState, PageHeader, ScreenContainer,
} from "../../src/components/ui";
import { AddAvailabilityModal } from "../../src/features/booking/components/AddAvailabilityModal";
import { useTranslation } from "../../src/i18n";
import { useBookingStore } from "../../src/store/booking.store";
import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

// Python weekday index → translation key (Mon=0 … Sun=6)
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const DAY_COLORS = [
  "#3B82F6", // Monday
  "#8B5CF6", // Tuesday
  "#10B981", // Wednesday
  "#EF4444", // Thursday
  "#F59E0B", // Friday
  "#06B6D4", // Saturday
  "#F97316", // Sunday
];

function to12Hour(time24: string): string {
  if (!time24) return '';
  const [hourStr, minStr] = time24.split(':');
  let h = parseInt(hourStr, 10);
  const m = minStr?.slice(0, 2) ?? '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

function slotDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function AvailabilityScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation('availability');
  const styles = createStyles(theme);

  const {
    availabilityRules,
    isLoading,
    fetchAvailabilityRules,
    createAvailabilityRule,
    deleteAvailabilityRule,
  } = useBookingStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { fetchAvailabilityRules(); }, []);

  const handleDelete = (id: string | number) => {
    if (!id) {
      console.warn('[AvailabilityScreen] handleDelete: invalid id', id);
      return;
    }

    const doDelete = () => {
      console.log('[AvailabilityScreen] Deleting rule id:', id);
      deleteAvailabilityRule(id)
        .then(() => console.log('[AvailabilityScreen] Delete successful'))
        .catch((e: any) => {
          console.error('[AvailabilityScreen] Delete error:', e?.response?.data || e?.message);
          Alert.alert(t('delete.errorTitle'), t('delete.errorMessage'));
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('delete.webConfirm'))) doDelete();
      return;
    }

    Alert.alert(
      t('delete.alertTitle'),
      t('delete.alertMessage'),
      [
        { text: t('delete.cancel'), style: "cancel" },
        { text: t('delete.confirm'), style: "destructive", onPress: doDelete },
      ]
    );
  };

  // Build grouped data — day names come from translations
  const grouped = DAY_KEYS.map((dayKey, index) => ({
    dayKey,
    dayName: t(`days.${dayKey}`),
    index,
    color: DAY_COLORS[index],
    rules: [...(availabilityRules || [])]
      .filter((r) => r.weekday === index)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter((g) => g.rules.length > 0);

  const totalSlots = availabilityRules?.length ?? 0;
  const activeDays = grouped.length;

  const renderDayGroup = ({ item }: { item: typeof grouped[0] }) => (
    <View style={styles.dayGroup}>
      <View style={styles.dayHeader}>
        <View style={[styles.dayAccent, { backgroundColor: item.color }]} />
        <View style={[styles.dayBadge, { backgroundColor: item.color + "15" }]}>
          <Text style={[styles.dayBadgeText, { color: item.color }]}>
            {item.dayName.substring(0, 3).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dayFullText}>{item.dayName}</Text>
        <View style={styles.slotCount}>
          <Text style={styles.slotCountText}>
            {t(
              item.rules.length === 1 ? 'slots.count_one' : 'slots.count_other',
              { count: item.rules.length }
            )}
          </Text>
        </View>
      </View>

      {item.rules.map((rule) => {
        console.log("Rule:", rule.id, rule.weekday, rule.start_time);
        return (
          <View key={String(rule.id)} style={styles.slotRow}>
            <View style={styles.slotTimeWrapper}>
              <Ionicons name="time-outline" size={14} color={item.color} />
              <Text style={styles.slotTime}>{to12Hour(rule.start_time)}</Text>
              <View style={styles.slotDash} />
              <Text style={styles.slotTime}>{to12Hour(rule.end_time)}</Text>
              {slotDuration(rule.start_time, rule.end_time) ? (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {slotDuration(rule.start_time, rule.end_time)}
                  </Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(rule.id)}
              style={styles.deleteBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.6}
            >
              <Ionicons name="trash-outline" size={15} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );

  return (
    <ScreenContainer scrollable={false} padded constrained>
      <PageHeader
        title={t('screen.title')}
        subtitle={t('screen.subtitle')}
        rightElement={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>{t('addButton')}</Text>
          </TouchableOpacity>
        }
      />

      {totalSlots > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeDays}</Text>
            <Text style={styles.statLabel}>{t('stats.activeDays')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalSlots}</Text>
            <Text style={styles.statLabel}>{t('stats.totalSlots')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{7 - activeDays}</Text>
            <Text style={styles.statLabel}>{t('stats.daysOff')}</Text>
          </View>
        </View>
      )}

      {isLoading && totalSlots === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => String(item.index)}
          renderItem={renderDayGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title={t('empty.title')}
              description={t('empty.description')}
            />
          }
        />
      )}

      <AddAvailabilityModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={createAvailabilityRule}
        isLoading={isLoading}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
    },
    addButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    statsRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      ...theme.shadows.sm,
    },
    statCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    statNumber: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.sm,
    },
    listContent: {
      paddingBottom: 100,
      flexGrow: 1,
    },
    dayGroup: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
      overflow: "hidden",
      ...theme.shadows.sm,
    },
    dayHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dayAccent: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
    },
    dayBadge: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    dayBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    dayFullText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
    },
    slotCount: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    slotCountText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    slotRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + "60",
    },
    slotTimeWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    slotTime: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    slotDash: {
      width: 16,
      height: 1.5,
      backgroundColor: theme.colors.textTertiary,
      borderRadius: 1,
    },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.error + "10",
      alignItems: "center",
      justifyContent: "center",
    },
    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    durationBadge: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginLeft: 4,
    },
    durationText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  });
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
import { useBookingStore } from "../../src/store/booking.store";
import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

// Python weekday: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
const PYTHON_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

const DAY_COLORS = [
  "#3B82F6", // Monday
  "#8B5CF6", // Tuesday
  "#10B981", // Wednesday
  "#EF4444", // Thursday
  "#F59E0B", // Friday
  "#06B6D4", // Saturday
  "#F97316", // Sunday
];

export default function AvailabilityScreen() {
  const { theme } = useTheme();
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


  // Replace handleDelete:
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
          Alert.alert("Error", "Could not delete this slot. Please try again.");
        });
    };

    // ✅ Alert.alert buttons are broken on web Expo — use window.confirm instead
    if (Platform.OS === 'web') {
      if (window.confirm("Delete this working hour?")) doDelete();
      return;
    }

    Alert.alert("Remove Schedule", "Are you sure you want to delete this working hour?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doDelete },
    ]);
  };

  const grouped = PYTHON_DAYS.map((day, index) => ({
    day,
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
            {item.day.substring(0, 3).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dayFullText}>{item.day}</Text>
        <View style={styles.slotCount}>
          <Text style={styles.slotCountText}>
            {item.rules.length} slot{item.rules.length > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {item.rules.map((rule) => {
        // Debug: log the rule id to confirm it's present
        console.log("Rule:", rule.id, rule.weekday, rule.start_time);
        return (
          <View key={String(rule.id)} style={styles.slotRow}>
            <View style={styles.slotTimeWrapper}>
              <Ionicons name="time-outline" size={14} color={item.color} />
              <Text style={styles.slotTime}>{rule.start_time.slice(0, 5)}</Text>
              <View style={styles.slotDash} />
              <Text style={styles.slotTime}>{rule.end_time.slice(0, 5)}</Text>
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
        title="Working Hours"
        subtitle="Set your weekly consultation schedule"
        rightElement={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Hours</Text>
          </TouchableOpacity>
        }
      />

      {totalSlots > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeDays}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalSlots}</Text>
            <Text style={styles.statLabel}>Total Slots</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{7 - activeDays}</Text>
            <Text style={styles.statLabel}>Days Off</Text>
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
              title="No Schedule Set"
              description="Patients cannot book you until you set your working hours."
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
  });
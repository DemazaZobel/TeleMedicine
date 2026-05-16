import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from "react-native";
import {
  Button,
  EmptyState,
  ScreenContainer,
} from "../../src/components/ui";
import { useBookingStore } from "../../src/store/booking.store";
import { Theme, useTheme } from "../../src/theme";
import { AddAvailabilityModal } from "../../src/features/booking/components/AddAvailabilityModal";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityScreen() {
  const router = useRouter();
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

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  // Group rules by day for a more professional "Schedule" view
  const groupedRules = useMemo(() => {
    const groups: Record<number, any[]> = {};
    
    // Initialize all days
    for (let i = 0; i < 7; i++) groups[i] = [];

    availabilityRules.forEach(rule => {
      // If it's a specific date, we'll handle it separately or group it by its weekday
      const day = rule.specific_date ? new Date(rule.specific_date).getDay() : rule.weekday;
      groups[day].push(rule);
    });

    // Sort rules within each day
    Object.keys(groups).forEach(key => {
      groups[Number(key)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return groups;
  }, [availabilityRules]);

  const handleDelete = (id: string | number) => {
    if (Platform.OS === 'web') {
        if (confirm("Remove these hours? Patients won't be able to book this slot anymore.")) {
            deleteAvailabilityRule(id);
        }
        return;
    }
    Alert.alert(
      "Remove Hours",
      "Patients won't be able to book this specific slot anymore. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteAvailabilityRule(id) },
      ]
    );
  };

  const renderDayGroup = (dayIndex: number) => {
    const rules = groupedRules[dayIndex];
    if (rules.length === 0) return null;

    return (
      <View key={dayIndex} style={styles.dayGroup}>
        <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{DAYS[dayIndex]}</Text>
            <View style={styles.dayDot} />
        </View>
        <View style={styles.slotsContainer}>
            {rules.map((rule) => {
                const isSpecific = !!rule.specific_date;
                return (
                    <View key={rule.id} style={styles.slotRow}>
                        <View style={styles.slotMain}>
                            <View style={styles.timeBlock}>
                                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                                <Text style={styles.timeRange}>
                                    {rule.start_time.slice(0, 5)} — {rule.end_time.slice(0, 5)}
                                </Text>
                            </View>
                            {isSpecific && (
                                <View style={styles.specificBadge}>
                                    <Text style={styles.specificText}>
                                        {new Date(rule.specific_date!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleDelete(rule.id)}
                            style={styles.deleteAction}
                        >
                            <Ionicons name="close-circle-outline" size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                );
            })}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer padded={false} style={styles.screen}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>Working Hours</Text>
                <Text style={styles.subtitle}>Set your weekly recurring and one-time availability.</Text>
            </View>
            <Button
                title="Add Hours"
                variant="primary"
                onPress={() => setShowAddModal(true)}
                icon={<Ionicons name="add" size={18} color="#FFF" />}
                style={styles.headerAddBtn}
            />
        </View>

        {isLoading && availabilityRules.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : availabilityRules.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Your schedule is empty"
            description="Add your first working hour block to start accepting appointments."
            action={{
              label: "Add Hours",
              onPress: () => setShowAddModal(true)
            }}
          />
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.grid}>
                {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => renderDayGroup(dayIndex))}
            </View>
          </ScrollView>
        )}
      </View>

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
    screen: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
      maxWidth: 900,
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
      paddingTop: Platform.OS === 'web' ? 60 : 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 48,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 6,
    },
    headerAddBtn: {
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 20,
        ...theme.shadows.sm,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    grid: {
        gap: 24,
    },
    dayGroup: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    dayName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    dayDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.primary,
        opacity: 0.3,
    },
    slotsContainer: {
        gap: 12,
    },
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border + '40',
    },
    slotMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeRange: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    specificBadge: {
        backgroundColor: theme.colors.primary + '10',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    specificText: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },
    deleteAction: {
        padding: 6,
        opacity: 0.5,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
    },
  });

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
} from "react-native";
import {
  Button,
  Card,
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

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [activeDayFilter, setActiveDayFilter] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  const sortedRules = useMemo(() => {
    let rules = [...availabilityRules].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.start_time.localeCompare(b.start_time);
    });
    
    if (activeDayFilter !== null) {
      rules = rules.filter(r => r.weekday === activeDayFilter);
    }
    return rules;
  }, [availabilityRules, activeDayFilter]);

  const coverageByDay = useMemo(() => {
    const coverage: Record<number, boolean> = {};
    availabilityRules.forEach(r => {
      coverage[r.weekday] = true;
    });
    return coverage;
  }, [availabilityRules]);

  const handleDelete = (id: string | number) => {
    Alert.alert(
      "Remove Hours",
      "Patients won't be able to book this specific slot anymore. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteAvailabilityRule(id)
        },
      ]
    );
  };

  const renderRule = ({ item }: { item: any }) => {
    const isSpecific = !!item.specific_date;
    const dateLabel = isSpecific 
      ? new Date(item.specific_date).toLocaleDateString(undefined, { dateStyle: 'medium' })
      : DAYS[item.weekday];

    return (
      <View style={styles.ruleCard}>
        <View style={styles.ruleMain}>
          <View style={styles.dayIndicator}>
             <Text style={styles.dayText}>{dateLabel}</Text>
             <View style={[styles.recurringBadge, isSpecific && styles.specificBadge]}>
               <Ionicons 
                name={isSpecific ? "calendar-outline" : "repeat"} 
                size={10} 
                color={isSpecific ? theme.colors.primary : theme.colors.success} 
              />
               <Text style={[styles.recurringText, isSpecific && styles.specificText]}>
                 {isSpecific ? "One-time" : "Weekly"}
               </Text>
             </View>
          </View>
          <View style={styles.timeSection}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={styles.timeText}>
              {item.start_time.slice(0, 5)} — {item.end_time.slice(0, 5)}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer padded={false} style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>My Schedule</Text>
          <Text style={styles.subtitle}>Manage your recurring availability</Text>
        </View>
        <TouchableOpacity 
          style={styles.addIconBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* WEEKLY VISUALIZER */}
      <View style={styles.visualizerContainer}>
        <Text style={styles.sectionLabel}>Weekly Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
          {SHORT_DAYS.map((day, index) => {
            const hasCoverage = coverageByDay[index];
            const isActive = activeDayFilter === index;
            return (
              <TouchableOpacity 
                key={day} 
                style={[
                  styles.visualDay, 
                  hasCoverage && styles.visualDayHasCoverage,
                  isActive && styles.visualDayActive
                ]}
                onPress={() => setActiveDayFilter(isActive ? null : index)}
              >
                <Text style={[
                  styles.visualDayText, 
                  hasCoverage && styles.visualDayTextHasCoverage,
                  isActive && styles.activeText
                ]}>
                  {day}
                </Text>
                {hasCoverage && !isActive && <View style={styles.coverageDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionLabel}>
            {activeDayFilter !== null ? `${DAYS[activeDayFilter]} Slots` : 'All Working Hours'}
          </Text>
          {activeDayFilter !== null && (
            <TouchableOpacity onPress={() => setActiveDayFilter(null)}>
              <Text style={styles.clearFilter}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading && availabilityRules.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={sortedRules}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRule}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title={activeDayFilter !== null ? "No slots for this day" : "No Schedule Set"}
                description={activeDayFilter !== null 
                  ? `You haven't set any working hours for ${DAYS[activeDayFilter]} yet.`
                  : "Set your weekly working hours so patients can start booking appointments."}
              />
            }
          />
        )}
      </View>

      <View style={styles.fabContainer}>
         <Button
            title="Add Working Hours"
            onPress={() => setShowAddModal(true)}
            style={styles.fab}
            icon={<Ionicons name="add" size={20} color="#FFF" />}
         />
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 40,
      paddingBottom: 20,
      backgroundColor: theme.colors.surface,
    },
    headerInfo: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    addIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
    },
    visualizerContainer: {
      paddingVertical: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: theme.spacing.xl,
      marginBottom: 12,
    },
    daysScroll: {
      paddingHorizontal: theme.spacing.xl,
      gap: 12,
    },
    visualDay: {
      width: 50,
      height: 60,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    visualDayHasCoverage: {
      borderColor: theme.colors.primary + '40',
      backgroundColor: theme.colors.primary + '05',
    },
    visualDayActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...theme.shadows.md,
    },
    visualDayText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textTertiary,
    },
    visualDayTextHasCoverage: {
      color: theme.colors.primary,
    },
    activeText: {
      color: '#FFF',
    },
    coverageDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
    },
    content: {
      flex: 1,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 8,
    },
    clearFilter: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
    },
    listContainer: {
      padding: theme.spacing.xl,
      paddingBottom: 100,
    },
    ruleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 20,
      marginBottom: 16,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.03)',
    },
    ruleMain: {
      flex: 1,
    },
    dayIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    dayText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    recurringBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.success + '10',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    recurringText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.success,
    },
    specificBadge: {
      backgroundColor: theme.colors.primary + '10',
    },
    specificText: {
      color: theme.colors.primary,
    },
    timeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timeText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.error + '08',
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
    },
    fabContainer: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
    },
    fab: {
      height: 56,
      borderRadius: 28,
      ...theme.shadows.md,
    }
  });

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  Button,
  ScreenContainer,
} from "../../src/components/ui";
import { useBookingStore } from "../../src/store/booking.store";
import { Theme, useTheme } from "../../src/theme";
import { AddAvailabilityModal } from "../../src/features/booking/components/AddAvailabilityModal";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);
  const {
    availabilityRules,
    isLoading,
    fetchAvailabilityRules,
    createAvailabilityRule,
    deleteAvailabilityRule,
  } = useBookingStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  // Calendar Logic
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }
    
    // Next month padding
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate]);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
  };

  const handleDelete = (id: string | number) => {
    if (Platform.OS === 'web') {
        if (confirm("Delete this availability block?")) {
            deleteAvailabilityRule(id);
        }
        return;
    }
    Alert.alert("Remove Hours", "Delete this slot?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAvailabilityRule(id) },
    ]);
  };

  const getRulesForDate = (day: number, month: number, year: number) => {
    const targetDate = new Date(year, month, day);
    const targetWeekday = targetDate.getDay();
    const dateISO = targetDate.toISOString().split('T')[0];

    return availabilityRules.filter(rule => {
      if (rule.specific_date) {
        return rule.specific_date === dateISO;
      }
      return rule.weekday === targetWeekday;
    }).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  return (
    <ScreenContainer padded={false} style={styles.screen}>
      <View style={styles.contentWrapper}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.monthTitle}>
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
            <Text style={styles.subtitle}>Manage your schedule across the month</Text>
          </View>
          
          <View style={styles.headerActions}>
            <View style={styles.navGroup}>
              <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentDate(new Date())} style={styles.todayBtn}>
                <Text style={styles.todayText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Button
              title="Add Availability"
              variant="primary"
              size="sm"
              onPress={() => setShowAddModal(true)}
              icon={<Ionicons name="add" size={18} color="#FFF" />}
              style={styles.addBtn}
            />
          </View>
        </View>

        {/* CALENDAR GRID */}
        <View style={styles.calendarContainer}>
          {/* Weekday Labels */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map(day => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayLabel}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.grid}>
            {monthData.map((item, index) => {
              const dayRules = getRulesForDate(item.day, item.month, item.year);
              const isToday = new Date().toDateString() === new Date(item.year, item.month, item.day).toDateString();
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.dayCell, 
                    !item.isCurrentMonth && styles.notCurrentMonth,
                    index % 7 === 6 && { borderRightWidth: 0 }
                  ]}
                >
                  <View style={styles.dayCellHeader}>
                    <Text style={[
                      styles.dayNumber, 
                      !item.isCurrentMonth && styles.dayNumberInactive,
                      isToday && styles.todayNumber
                    ]}>
                      {item.day}
                    </Text>
                  </View>
                  
                  <ScrollView style={styles.dayContent} showsVerticalScrollIndicator={false}>
                    {dayRules.map(rule => (
                      <TouchableOpacity 
                        key={rule.id} 
                        style={[styles.rulePill, !!rule.specific_date && styles.specificPill]}
                        onLongPress={() => handleDelete(rule.id)}
                      >
                        <Text style={[styles.ruleText, !!rule.specific_date && styles.specificRuleText]} numberOfLines={1}>
                          {rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        </View>
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

const createStyles = (theme: Theme, width: number) =>
  StyleSheet.create({
    screen: {
      backgroundColor: '#F8F9FA', // Subtle dashboard grey
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: Platform.OS === 'web' ? 40 : 10,
      paddingTop: Platform.OS === 'web' ? 40 : 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    monthTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    navGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 4,
    },
    navBtn: {
      padding: 8,
    },
    todayBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      marginHorizontal: 4,
    },
    todayText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
    },
    addBtn: {
      height: 40,
      borderRadius: 10,
      paddingHorizontal: 16,
    },
    calendarContainer: {
      flex: 1,
      backgroundColor: '#FFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
      marginBottom: 40,
    },
    weekdayRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: '#FBFCFD',
    },
    weekdayCell: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    weekdayLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    grid: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      height: '16.66%',
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border + '50',
      padding: 8,
    },
    notCurrentMonth: {
      backgroundColor: '#FAFAFA',
    },
    dayCellHeader: {
      marginBottom: 6,
    },
    dayNumber: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    dayNumberInactive: {
      color: theme.colors.textTertiary,
      opacity: 0.5,
    },
    todayNumber: {
      color: theme.colors.primary,
      fontWeight: '900',
    },
    dayContent: {
      flex: 1,
    },
    rulePill: {
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 4,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    specificPill: {
      backgroundColor: '#6366F115',
      borderLeftColor: '#6366F1',
    },
    ruleText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    specificRuleText: {
      color: '#6366F1',
    },
  });

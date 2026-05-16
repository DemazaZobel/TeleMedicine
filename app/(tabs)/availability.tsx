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

const HOUR_HEIGHT = 80;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);
  const {
    availabilityRules,
    appointments,
    isLoading,
    fetchAvailabilityRules,
    fetchMyAppointments,
    createAvailabilityRule,
    deleteAvailabilityRule,
  } = useBookingStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchAvailabilityRules();
    fetchMyAppointments();
  }, []);

  // Calculate the current week's dates
  const weekDates = useMemo(() => {
    const dates = [];
    const tempDate = new Date(currentDate);
    const day = tempDate.getDay();
    const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    tempDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return dates;
  }, [currentDate]);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setShowAddModal(true);
  };

  const handleDelete = (id: string | number) => {
    if (Platform.OS === 'web') {
      if (confirm("Remove this availability block?")) {
        deleteAvailabilityRule(id);
      }
      return;
    }
    Alert.alert("Remove Hours", "Delete this slot?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAvailabilityRule(id) },
    ]);
  };

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const getPositionStyle = (startTime: string, endTime: string) => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const duration = endMins - startMins;

    return {
      top: (startMins / 60) * HOUR_HEIGHT,
      height: (duration / 60) * HOUR_HEIGHT,
    };
  };

  const renderTimeline = () => (
    <View style={styles.timeAxis}>
      {HOURS.map(hour => (
        <View key={hour} style={styles.timeLabelCell}>
          <Text style={styles.timeLabel}>
            {hour === 0 ? '12 AM' : hour > 12 ? `${hour - 12} PM` : `${hour} ${hour === 12 ? 'PM' : 'AM'}`}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScreenContainer padded={false} style={styles.screen}>
      <View style={styles.contentWrapper}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Weekly Schedule</Text>
            <Text style={styles.subtitle}>
              Week of {weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <View style={styles.navGroup}>
              <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentDate(new Date())} style={styles.todayBtn}>
                <Text style={styles.todayText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Button
              title="Add Availability"
              variant="primary"
              size="sm"
              onPress={() => {
                setEditingRule(null);
                setShowAddModal(true);
              }}
              icon={<Ionicons name="add" size={18} color="#FFF" />}
              style={styles.addBtn}
            />
          </View>
        </View>

        {/* CALENDAR BOARD */}
        <View style={styles.board}>
          {/* Header Row */}
          <View style={styles.boardHeader}>
            <View style={styles.timeAxisSpace} />
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <View key={i} style={styles.dayHeaderCell}>
                  <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{WEEKDAYS[i]}</Text>
                  <Text style={[styles.dateLabel, isToday && styles.todayDateLabel]}>{date.getDate()}</Text>
                </View>
              );
            })}
          </View>

          {/* Grid Content */}
          <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.gridBody}>
              {renderTimeline()}
              
              <View style={styles.daysContainer}>
                {weekDates.map((date, dayIdx) => {
                  const dateISO = date.toISOString().split('T')[0];
                  const weekday = date.getDay();
                  // Correcting for Mon=0, Tue=1... Sun=6
                  const adjustedWeekday = weekday === 0 ? 6 : weekday - 1;

                  // Get items for this specific day
                  const dayRules = availabilityRules.filter(r => {
                    if (r.specific_date) return r.specific_date === dateISO;
                    return r.weekday === (adjustedWeekday === 6 ? 6 : adjustedWeekday);
                  });

                  const dayAppointments = appointments.filter(app => 
                    app.scheduled_start.startsWith(dateISO) && app.status !== 'CANCELLED'
                  );

                  return (
                    <View key={dayIdx} style={styles.dayColumn}>
                      {/* Grid Lines */}
                      {HOURS.map(h => (
                        <View key={h} style={styles.hourGridLine} />
                      ))}

                      {/* Availability Blocks */}
                      {dayRules.map(rule => (
                        <TouchableOpacity
                          key={`rule-${rule.id}`}
                          style={[
                            styles.ruleCard,
                            !!rule.specific_date && styles.specificRuleCard,
                            getPositionStyle(rule.start_time, rule.end_time)
                          ]}
                          onPress={() => handleEdit(rule)}
                          onLongPress={() => handleDelete(rule.id)}
                        >
                           <View style={styles.ruleCardIndicator} />
                           <Text style={styles.ruleTimeText}>{rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}</Text>
                           <Text style={styles.ruleTypeLabel}>{!!rule.specific_date ? 'One-time' : 'Weekly'}</Text>
                        </TouchableOpacity>
                      ))}

                      {/* Appointment Blocks */}
                      {dayAppointments.map(app => {
                        const start = app.scheduled_start.split('T')[1].slice(0, 5);
                        const end = app.scheduled_end?.split('T')[1].slice(0, 5) || start;
                        const patientName = app.patient_first_name 
                          ? `${app.patient_first_name} ${app.patient_last_name || ''}`.trim()
                          : 'Patient';

                        return (
                          <View
                            key={`app-${app.id}`}
                            style={[
                              styles.appointmentCard,
                              getPositionStyle(start, end)
                            ]}
                          >
                             <View style={styles.appointmentIndicator} />
                             <Text style={styles.appTimeText}>{start} - {end}</Text>
                             <Text style={styles.appNameText} numberOfLines={1}>{patientName}</Text>
                             <View style={[styles.statusBadge, styles[`status_${app.status}` as keyof typeof styles]]}>
                                <Text style={styles.statusText}>{app.status}</Text>
                             </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <AddAvailabilityModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingRule(null);
        }}
        onConfirm={createAvailabilityRule}
        isLoading={isLoading}
        initialData={editingRule}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme, width: number) =>
  StyleSheet.create({
    screen: {
      backgroundColor: '#FFF',
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
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -1,
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
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      padding: 4,
    },
    navBtn: {
      padding: 8,
    },
    todayBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#FFF',
      borderRadius: 8,
      marginHorizontal: 4,
      ...theme.shadows.sm,
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
    board: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: '#FFF',
    },
    boardHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: '#F9FAFB',
    },
    timeAxisSpace: {
      width: 60,
    },
    dayHeaderCell: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border + '50',
    },
    dayLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    dateLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
    },
    todayLabel: {
      color: theme.colors.primary,
    },
    todayDateLabel: {
      color: theme.colors.primary,
    },
    gridScroll: {
      flex: 1,
    },
    gridBody: {
      flexDirection: 'row',
      height: 24 * HOUR_HEIGHT,
    },
    timeAxis: {
      width: 60,
      paddingTop: HOUR_HEIGHT / 2,
    },
    timeLabelCell: {
      height: HOUR_HEIGHT,
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textTertiary,
    },
    daysContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    dayColumn: {
      flex: 1,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border + '50',
      position: 'relative',
    },
    hourGridLine: {
      height: HOUR_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    // CARDS
    ruleCard: {
      position: 'absolute',
      left: 4,
      right: 4,
      backgroundColor: theme.colors.primary + '08',
      borderRadius: 10,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
      zIndex: 1,
    },
    specificRuleCard: {
      backgroundColor: '#6366F108',
      borderColor: '#6366F130',
    },
    ruleCardIndicator: {
      width: 3,
      position: 'absolute',
      left: 0,
      top: 8,
      bottom: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
    },
    ruleTimeText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.text,
      marginLeft: 6,
    },
    ruleTypeLabel: {
      fontSize: 9,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginLeft: 6,
      marginTop: 2,
    },
    appointmentCard: {
      position: 'absolute',
      left: 4,
      right: 4,
      backgroundColor: theme.colors.warning + '08',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.colors.warning + '40',
      zIndex: 2,
      ...theme.shadows.sm,
    },
    appointmentIndicator: {
      width: 4,
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      backgroundColor: theme.colors.warning,
      borderRadius: 4,
    },
    appTimeText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.text,
      marginLeft: 8,
    },
    appNameText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      marginLeft: 8,
      marginTop: 2,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      marginTop: 6,
      marginLeft: 8,
    },
    statusText: {
      fontSize: 8,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    status_REQUESTED: { backgroundColor: '#FFEDD5' },
    status_CONFIRMED: { backgroundColor: '#DCFCE7' },
    status_COMPLETED: { backgroundColor: '#DBEAFE' },
    // status text colors
    status_REQUESTED_text: { color: '#9A3412' },
    status_CONFIRMED_text: { color: '#166534' },
  });

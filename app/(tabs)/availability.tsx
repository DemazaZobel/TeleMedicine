import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useRef } from "react";
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
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Button,
  ScreenContainer,
  EmptyState,
} from "../../src/components/ui";
import { useBookingStore } from "../../src/store/booking.store";
import { Theme, useTheme } from "../../src/theme";
import { AddAvailabilityModal } from "../../src/features/booking/components/AddAvailabilityModal";
import { ProviderAvailabilityRuleDetail, AppointmentDetail } from "../../src/features/booking/types/bookingTypes";

type CalendarItem = 
  | (ProviderAvailabilityRuleDetail & { type: 'rule' })
  | (AppointmentDetail & { type: 'appointment' });

type ViewMode = 'calendar' | 'list';

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateInputRef = useRef<any>(null);

  // Filters & State
  const [filterType, setFilterType] = useState<'all' | 'recurring' | 'one-time'>('all');
  const [showBooked, setShowBooked] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAvailabilityRules();
    fetchMyAppointments();
  }, []);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, currentDate.getDate());
    setCurrentDate(newDate);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setCurrentDate(selectedDate);
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setShowAddModal(true);
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

  const getItemsForDate = (day: number, month: number, year: number): CalendarItem[] => {
    const targetDate = new Date(year, month, day);
    const targetWeekday = targetDate.getDay();
    const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let filteredRules = availabilityRules.filter(rule => {
      if (rule.specific_date) {
        if (filterType === 'recurring') return false;
        return rule.specific_date === dateISO;
      }
      if (filterType === 'one-time') return false;
      return rule.weekday === targetWeekday;
    });

    const dateAppointments = showBooked ? appointments.filter(app => {
        return app.scheduled_start.startsWith(dateISO) && app.status !== 'CANCELLED';
    }) : [];

    const items: CalendarItem[] = [
        ...filteredRules.map(r => ({ ...r, type: 'rule' as const })),
        ...dateAppointments.map(a => ({ ...a, type: 'appointment' as const }))
    ];

    return items.sort((a, b) => {
        const timeA = a.type === 'rule' ? a.start_time : a.scheduled_start.split('T')[1];
        const timeB = b.type === 'rule' ? b.start_time : b.scheduled_start.split('T')[1];
        return timeA.localeCompare(timeB);
    });
  };

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, month: month - 1, year, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, isCurrentMonth: true });
    }
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, month: month + 1, year, isCurrentMonth: false });
    }
    return days;
  }, [currentDate]);

  const appointmentsToday = useMemo(() => {
    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return appointments.filter(app => app.scheduled_start.startsWith(todayISO) && app.status !== 'CANCELLED').length;
  }, [appointments]);

  const listItems = useMemo(() => {
    return getItemsForDate(currentDate.getDate(), currentDate.getMonth(), currentDate.getFullYear());
  }, [currentDate, availabilityRules, appointments, filterType, showBooked]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: theme.colors.success, icon: 'checkmark-sharp', label: 'Completed' };
      case 'CANCELLED': return { color: theme.colors.error, icon: 'close-sharp', label: 'Canceled' };
      case 'CONFIRMED': return { color: theme.colors.primary, icon: 'time-outline', label: 'Scheduled' };
      default: return { color: theme.colors.warning, icon: 'person', label: 'Patient is waiting' };
    }
  };

  const renderAppointmentCard = (entry: AppointmentDetail, isMini = false) => {
    const config = getStatusConfig(entry.status);
    const name = entry.patient_first_name ? `${entry.patient_first_name} ${entry.patient_last_name || ''}`.trim() : 'Patient';
    const timeRange = `${entry.scheduled_start.split('T')[1].slice(0, 5)} - ${entry.scheduled_end?.split('T')[1]?.slice(0, 5) || '...'}`;
    
    return (
        <View key={`app-${entry.id}`} style={[styles.richCard, { borderLeftColor: config.color }, isMini && styles.miniCard]}>
            <Text style={styles.cardTime}>{timeRange}</Text>
            <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
            {(!isMini || entry.reason?.length < 20) && entry.reason && (
                <Text style={styles.cardReason} numberOfLines={1}>{entry.reason}</Text>
            )}
            <View style={[styles.cardBadge, { backgroundColor: config.color + '15' }]}>
                <Ionicons name={config.icon as any} size={isMini ? 10 : 12} color={config.color} />
                <Text style={[styles.cardStatus, { color: config.color }]}>{config.label}</Text>
            </View>
        </View>
    );
  };

  return (
    <ScreenContainer padded={false} style={styles.screen}>
      <View style={styles.contentWrapper}>
        {/* HEADER & TOGGLES */}
        <View style={styles.topActions}>
            <View style={styles.viewToggle}>
                <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}>
                    <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? theme.colors.text : theme.colors.textTertiary} />
                    <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('calendar')} style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]}>
                    <Ionicons name="calendar-outline" size={16} color={viewMode === 'calendar' ? theme.colors.text : theme.colors.textTertiary} />
                    <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>Calendar</Text>
                </TouchableOpacity>
            </View>
            <Button
              title="Add Availability"
              variant="primary"
              size="sm"
              onPress={() => { setEditingRule(null); setShowAddModal(true); }}
              icon={<Ionicons name="add" size={18} color="#FFF" />}
              style={styles.addBtn}
            />
        </View>

        <View style={styles.subHeader}>
            <View style={styles.dateNav}>
                <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navArrow}>
                    <Ionicons name="chevron-back" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <View style={styles.dateDisplayWrapper}>
                    <View style={styles.dateDisplay}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={styles.dateDisplayText}>
                            {currentDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </View>
                    {Platform.OS === 'web' ? (
                        <input type="date" style={styles.webPickerOverlay} onChange={(e) => {
                            if (e.target.value) {
                                const parts = e.target.value.split('-');
                                setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                            }
                        }} />
                    ) : (
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={StyleSheet.absoluteFill} />
                    )}
                </View>
                <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navArrow}>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.centerStat}>
                <Text style={styles.statCount}>{appointmentsToday}</Text>
                <Text style={styles.statLabel}>appointments today</Text>
            </View>

            <View style={styles.rightGroup}>
                <TouchableOpacity style={[styles.iconAction, showFilters && styles.iconActionActive]} onPress={() => setShowFilters(!showFilters)}>
                    <Ionicons name="options-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.iconActionText}>Filter</Text>
                </TouchableOpacity>
            </View>
        </View>

        {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker value={currentDate} mode="date" onChange={onDateChange} />
        )}

        {showFilters && (
            <View style={styles.filterBar}>
                {['all', 'recurring', 'one-time'].map((t) => (
                    <TouchableOpacity key={t} onPress={() => setFilterType(t as any)} style={[styles.filterChip, filterType === t && styles.filterChipActive]}>
                        <Text style={[styles.filterText, filterType === t && styles.filterTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowBooked(!showBooked)} style={[styles.filterChip, showBooked && styles.filterChipActiveBooked]}>
                    <Text style={[styles.filterText, showBooked && styles.filterTextActiveBooked]}>Appointments</Text>
                </TouchableOpacity>
            </View>
        )}

        {viewMode === 'calendar' ? (
            <View style={styles.calendarContainer}>
                <View style={styles.weekdayRow}>
                    {WEEKDAYS.map(day => (
                    <View key={day} style={styles.weekdayCell}><Text style={styles.weekdayLabel}>{day}</Text></View>
                    ))}
                </View>
                <View style={styles.grid}>
                    {monthData.map((item, index) => {
                    const dayItems = getItemsForDate(item.day, item.month, item.year);
                    const isToday = new Date().toDateString() === new Date(item.year, item.month, item.day).toDateString();
                    const isSelected = currentDate.toDateString() === new Date(item.year, item.month, item.day).toDateString();
                    
                    return (
                        <TouchableOpacity 
                            key={index} 
                            style={[styles.dayCell, !item.isCurrentMonth && styles.notCurrentMonth, isSelected && styles.selectedDayCell, index % 7 === 6 && { borderRightWidth: 0 }]}
                            onPress={() => setCurrentDate(new Date(item.year, item.month, item.day))}
                        >
                        <View style={styles.dayCellHeader}>
                            <Text style={[styles.dayNumber, !item.isCurrentMonth && styles.dayNumberInactive, isToday && styles.todayNumber]}>{item.day}</Text>
                        </View>
                        <View style={styles.dayContent}>
                            {dayItems.map((entry, idx) => {
                                if (entry.type === 'rule') {
                                    const isSpecific = !!entry.specific_date;
                                    return (
                                        <View key={`rule-${entry.id}`} style={[styles.rulePill, isSpecific && styles.specificPill]}>
                                            <Text style={[styles.ruleText, isSpecific && styles.specificRuleText]} numberOfLines={1}>{entry.start_time.slice(0, 5)}</Text>
                                        </View>
                                    );
                                } else {
                                    return renderAppointmentCard(entry, true);
                                }
                            })}
                        </View>
                        </TouchableOpacity>
                    );
                    })}
                </View>
            </View>
        ) : (
            <View style={styles.listViewContainer}>
                <View style={styles.listHeader}><Text style={styles.listTitle}>Schedule for {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text></View>
                {listItems.length === 0 ? (
                    <EmptyState icon="calendar-outline" title="No items found" description="No availability or appointments for this date." actionLabel="Add Hours" onAction={() => setShowAddModal(true)} />
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
                        {listItems.map((entry, idx) => entry.type === 'appointment' ? renderAppointmentCard(entry) : (
                            <View key={idx} style={styles.ruleItem}>
                                <View style={styles.ruleIcon}><Ionicons name="time-outline" size={20} color={theme.colors.primary} /></View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.listItemTitle}>{entry.specific_date ? 'One-time Availability' : 'Weekly Availability'}</Text>
                                    <Text style={styles.listItemSubtitle}>{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</Text>
                                </View>
                                <View style={styles.listItemActions}>
                                    <TouchableOpacity onPress={() => handleEdit(entry)} style={styles.listActionBtn}><Ionicons name="create-outline" size={18} color={theme.colors.primary} /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.listActionBtn}><Ionicons name="trash-outline" size={18} color={theme.colors.error} /></TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        )}
      </View>
      <AddAvailabilityModal visible={showAddModal} onClose={() => { setShowAddModal(false); setEditingRule(null); }} onConfirm={createAvailabilityRule} isLoading={isLoading} initialData={editingRule} />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme, width: number) =>
  StyleSheet.create({
    screen: { backgroundColor: '#F9FAFB', flex: 1 },
    contentWrapper: { flex: 1, paddingHorizontal: Platform.OS === 'web' ? 40 : 10, paddingTop: Platform.OS === 'web' ? 40 : 20 },
    topActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    viewToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 4, borderRadius: 12 },
    toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 8 },
    toggleBtnActive: { backgroundColor: '#FFF', ...theme.shadows.sm },
    toggleText: { fontSize: 13, fontWeight: '600', color: theme.colors.textTertiary },
    toggleTextActive: { color: theme.colors.text },
    subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 24 },
    dateNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    navArrow: { padding: 10, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    dateDisplayWrapper: { position: 'relative', borderRadius: 10, overflow: 'hidden' },
    dateDisplay: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 38, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    dateDisplayText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    webPickerOverlay: { position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' },
    centerStat: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    statCount: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
    statLabel: { fontSize: 14, color: theme.colors.textTertiary },
    rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconAction: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 38, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
    iconActionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '05' },
    iconActionText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
    filterBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary },
    filterChipActiveBooked: { backgroundColor: theme.colors.warning + '10', borderColor: theme.colors.warning },
    filterText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
    filterTextActive: { color: theme.colors.primary },
    filterTextActiveBooked: { color: theme.colors.warning },
    addBtn: { height: 44, borderRadius: 12, paddingHorizontal: 20 },
    calendarContainer: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', ...theme.shadows.sm, marginBottom: 40 },
    weekdayRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#FAFBFC' },
    weekdayCell: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    weekdayLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1.5 },
    grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', minHeight: 180, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', padding: 8 },
    selectedDayCell: { backgroundColor: theme.colors.primary + '03', borderColor: theme.colors.primary + '30' },
    notCurrentMonth: { backgroundColor: '#F9FAFB' },
    dayCellHeader: { marginBottom: 8 },
    dayNumber: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
    dayNumberInactive: { color: theme.colors.textTertiary, opacity: 0.4 },
    todayNumber: { color: theme.colors.primary, fontWeight: '900' },
    dayContent: { flex: 1, gap: 6 },
    rulePill: { backgroundColor: theme.colors.primary + '10', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
    specificPill: { backgroundColor: '#6366F115', borderLeftColor: '#6366F1' },
    ruleText: { fontSize: 9, fontWeight: '800', color: theme.colors.primary },
    specificRuleText: { color: '#6366F1' },
    
    // RICH CARD STYLES
    richCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: '#F3F4F6', gap: 4, ...theme.shadows.sm },
    miniCard: { padding: 6, gap: 2 },
    cardTime: { fontSize: 10, color: theme.colors.textTertiary, fontWeight: '600' },
    cardName: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
    cardReason: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '500' },
    cardBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 4, marginTop: 4 },
    cardStatus: { fontSize: 9, fontWeight: '800' },
    
    // LIST VIEW
    listViewContainer: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', ...theme.shadows.sm, marginBottom: 40, padding: 24 },
    listHeader: { marginBottom: 24 },
    listTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
    listScroll: { gap: 16 },
    ruleItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
    ruleIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    listItemTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    listItemSubtitle: { fontSize: 13, color: theme.colors.textTertiary, fontWeight: '600' },
    listItemActions: { flexDirection: 'row', gap: 8 },
    listActionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }
  });

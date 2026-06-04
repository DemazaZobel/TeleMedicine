import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { Button, Input } from "../../../components/ui";
import { ModalBase } from "../../../components/ui/ModalBase";
import { useAuthStore } from "../../../store/authStore";
import { useBookingStore } from "../../../store/booking.store";
import { useDiscoveryStore } from "../../../store/discovery.store";
import type { Theme } from "../../../theme";
import { useTheme } from "../../../theme";
import type { AppointmentMode } from "../types/bookingTypes";

// JS getDay() 0=Sun…6=Sat  ➔  Python weekday() 0=Mon…6=Sun
const JS_TO_PYTHON_WEEKDAY = [6, 0, 1, 2, 3, 4, 5];

function toStandardISOString(date: Date): string {
  return date.toISOString();
}

interface BookingModalProps {
  visible: boolean;
  doctorId: string | number;
  initialSlotIndex?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ visible, doctorId, initialSlotIndex, onClose, onSuccess }: BookingModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    bookAppointment,
    fetchMyAppointments,
    fetchDoctorAvailability,
    doctorAvailabilityRules,
    appointments,
    isLoading,
    error,
  } = useBookingStore();

  const [mode, setMode] = useState<AppointmentMode>("ONLINE");
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // ✅ Controlled state for managing custom dropdown overlay visibility
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { doctors } = useDiscoveryStore();
  const linkedAccount = useAuthStore((s) => s.linkedAccount);

  const isSelfBooking = useMemo(() => {
    const doctor = doctors.find((d) => String(d.id) === String(doctorId));
    if (!doctor || !linkedAccount) return false;
    return String(doctor.user_id) === String(linkedAccount.id);
  }, [doctors, doctorId, linkedAccount]);

  useEffect(() => {
    if (visible && doctorId) {
      fetchDoctorAvailability(doctorId);
    }
  }, [visible, doctorId]);

  const allSlots = useMemo(() => {
    if (!doctorAvailabilityRules || doctorAvailabilityRules.length === 0) return [];

    const generatedSlots: { start: Date; end: Date; isBooked: boolean }[] = [];
    const today = new Date();

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);

      const jsWeekday = currentDay.getDay();
      const pyWeekday = JS_TO_PYTHON_WEEKDAY[jsWeekday];
      const dateISO = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;

      const rulesForDay = doctorAvailabilityRules.filter(
        (r) => r.is_active && (r.specific_date ? r.specific_date === dateISO : r.weekday === pyWeekday)
      );

      for (const rule of rulesForDay) {
        const [h, m] = rule.start_time.split(":").map(Number);
        const [eh, em] = rule.end_time.split(":").map(Number);

        const ruleEnd = new Date(currentDay);
        ruleEnd.setHours(eh, em, 0, 0);

        let cursor = new Date(currentDay);
        cursor.setHours(h, m, 0, 0);

        while (cursor.getTime() + 3600000 <= ruleEnd.getTime()) {
          const slotStart = new Date(cursor);
          const slotEnd = new Date(cursor.getTime() + 3600000);

          const hasOverlap = appointments.some((appt) => {
            const apptStart = new Date(appt.scheduled_start).getTime();
            const apptEnd = new Date(appt.scheduled_end).getTime();
            const statusMatch = ["requested", "confirmed"].includes(appt.status?.toLowerCase() || "");

            if (!statusMatch) return false;
            return slotStart.getTime() < apptEnd && slotEnd.getTime() > apptStart;
          });

          generatedSlots.push({
            start: slotStart,
            end: slotEnd,
            isBooked: hasOverlap,
          });

          cursor.setTime(cursor.getTime() + 3600000);
        }
      }
    }

    return generatedSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [doctorAvailabilityRules, appointments]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, typeof allSlots> = {};
    allSlots.forEach(slot => {
      const dateKey = slot.start.toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(slot);
    });
    return groups;
  }, [allSlots]);

  const uniqueDates = useMemo(() => Object.keys(groupedSlots), [groupedSlots]);

  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  const activeDaySlots = useMemo(
    () => (selectedDate ? groupedSlots[selectedDate] : []) || [],
    [selectedDate, groupedSlots]
  );

  const hasActiveAppointment = useMemo(() => {
    const doctor = doctors.find((d) => String(d.id) === String(doctorId));
    return appointments.some((a) => {
      const docId = String(a.doctor?.id || a.doctor);
      const matchId = docId === String(doctorId) || (doctor && docId === String(doctor.user_id));
      const matchStatus = ["requested", "confirmed", "pending"].includes(a.status?.toLowerCase() || "");
      return matchId && matchStatus;
    });
  }, [appointments, doctorId, doctors]);

  useEffect(() => {
    if (visible) {
      setReason("");
      setMode("ONLINE");
      setSelectedSlotIndex(null);
      setSelectedDate(null);
      setDropdownOpen(false);
      fetchMyAppointments();
    }
  }, [visible]);

  const handleBook = async () => {
    if (selectedSlotIndex === null || !selectedDate) return;
    if (hasActiveAppointment) {
      Alert.alert("Booking Exists", "You already have an active appointment with this doctor.");
      return;
    }
    if (isSelfBooking) {
      Alert.alert("Invalid Booking", "You cannot book an appointment with your own Doctor profile.");
      return;
    }

    const selectedSlot = activeDaySlots[selectedSlotIndex];
    if (selectedSlot.isBooked) {
      Alert.alert("Slot Taken", "This slot has already been booked. Please pick another time.");
      return;
    }

    const startStr = toStandardISOString(selectedSlot.start);
    const endStr = toStandardISOString(selectedSlot.end);

    try {
      await bookAppointment({
        doctor_id: doctorId,
        scheduled_start: startStr,
        scheduled_end: endStr,
        appointment_type: mode,
        reason,
      });
      onSuccess();
    } catch (e: any) {
      console.error('[BookingModal] Booking failed:', e?.response?.data || e?.message);
    }
  };

  // Label configuration mapping utility
  const formatSlotLabel = (slot: typeof allSlots[number]) => {
    const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${slot.start.toLocaleTimeString([], opts)} - ${slot.end.toLocaleTimeString([], opts)}`;
  };

  const selectionSummary = useMemo(() => {
    if (selectedSlotIndex === null || !selectedDate) return null;
    const slot = activeDaySlots[selectedSlotIndex];
    if (!slot) return null;

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return `${slot.start.toLocaleDateString(undefined, dateOptions)} @ ${formatSlotLabel(slot)} (1 hour)`;
  }, [selectedSlotIndex, selectedDate, activeDaySlots]);

  return (
    <ModalBase visible={visible} onClose={onClose} title="Book Appointment"
      subtitle="Select a date and time that works best for you." maxWidth={520}>
      <View style={styles.container}>

        {isSelfBooking ? (
          <View style={[styles.warningBanner, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '20' }]}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
            <Text style={[styles.warningText, { color: theme.colors.error }]}>
              You cannot book an appointment with your own Doctor profile.
            </Text>
          </View>
        ) : hasActiveAppointment ? (
          <View style={styles.warningBanner}>
            <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
            <Text style={styles.warningText}>You have an active booking with this doctor.</Text>
          </View>
        ) : null}

        {/* ── 1. SELECT DATE STRIP ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>1. Select Date</Text>
          {selectedDate && (
            <Text style={styles.monthHeader}>
              {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.dateStrip} contentContainerStyle={styles.dateStripContent}>
          {uniqueDates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color={theme.colors.textTertiary} />
              <Text style={styles.emptyText}>
                {isLoading ? "Loading availability..." : "No available dates."}
              </Text>
            </View>
          ) : uniqueDates.map((dateKey) => {
            const date = new Date(dateKey);
            const isActive = selectedDate === dateKey;
            return (
              <TouchableOpacity key={dateKey}
                style={[styles.dateCard, isActive && styles.dateCardActive]}
                onPress={() => { setSelectedDate(dateKey); setSelectedSlotIndex(null); setDropdownOpen(false); }}>
                <Text style={[styles.dateMonth, isActive && styles.activeText]}>
                  {date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.dateDay, isActive && styles.activeText]}>
                  {date.getDate()}
                </Text>
                <Text style={[styles.dateWeekday, isActive && styles.activeText]}>
                  {date.toLocaleDateString(undefined, { weekday: 'short' })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── 2. SELECT TIME (DROPDOWN MODAL IMPL) ── */}
        <Text style={styles.label}>2. Select Time Window</Text>

        {activeDaySlots.length > 0 ? (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={[styles.dropdownHeader, dropdownOpen && styles.dropdownHeaderActive, hasActiveAppointment && styles.dropdownDisabled]}
              disabled={hasActiveAppointment}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <View style={styles.dropdownValueRow}>
                <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
                <Text style={[styles.dropdownValueText, selectedSlotIndex === null && { color: theme.colors.textTertiary }]}>
                  {selectedSlotIndex !== null
                    ? formatSlotLabel(activeDaySlots[selectedSlotIndex])
                    : "Choose an available time slot..."}
                </Text>
              </View>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownListWrapper}>
                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {activeDaySlots.map((slot, index) => {
                    const isSelected = selectedSlotIndex === index;
                    // Filter out already booked slots directly from selection list entries
                    if (slot.isBooked) return null;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                        onPress={() => {
                          setSelectedSlotIndex(index);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                          {formatSlotLabel(slot)}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={32} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No times available on this day.</Text>
          </View>
        )}

        {/* ── 3. CONSULTATION MODE ── */}
        <Text style={styles.label}>3. Consultation Mode</Text>
        <View style={styles.modeContainer}>
          {([
            { value: "ONLINE", icon: "videocam", label: "Online" },
            { value: "IN_PERSON", icon: "people", label: "In Person" },
          ] as const).map((opt) => (
            <TouchableOpacity key={opt.value}
              style={[styles.modeOption, mode === opt.value && styles.modeOptionActive]}
              onPress={() => setMode(opt.value)}>
              <Ionicons name={opt.icon} size={18}
                color={mode === opt.value ? theme.colors.primary : theme.colors.textTertiary} />
              <Text style={[styles.modeLabel, mode === opt.value && { color: theme.colors.primary }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Reason for Visit" placeholder="E.g., General checkup..."
          value={reason} onChangeText={setReason} containerStyle={styles.reasonInput} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* ── SUMMARY BREAKDOWN BADGE ── */}
        {selectionSummary && !dropdownOpen && (
          <View style={[styles.summaryBadge, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '20' }]}>
            <Ionicons name="calendar" size={16} color={theme.colors.primary} />
            <Text style={[styles.summaryText, { color: theme.colors.primary }]}>
              Selected: <Text style={{ fontWeight: '600' }}>{selectionSummary}</Text>
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Button title="Cancel" variant="outline" onPress={onClose} style={styles.footerBtn} />
          <Button title="Confirm Booking" onPress={handleBook} loading={isLoading}
            disabled={isLoading || !reason || selectedSlotIndex === null || isSelfBooking || hasActiveAppointment || dropdownOpen}
            style={styles.footerBtn} />
        </View>
      </View>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { paddingBottom: 10 },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.warning + '10', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.warning + '20' },
  warningText: { fontSize: 13, fontWeight: '600', color: theme.colors.warning, flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  monthHeader: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  label: { fontSize: 11, fontWeight: '800', color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  dateStrip: { marginBottom: 20 },
  dateStripContent: { paddingRight: 20, gap: 10 },
  dateCard: { width: 70, height: 90, backgroundColor: theme.colors.background, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 8 },
  dateCardActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, ...theme.shadows.md },
  dateMonth: { fontSize: 10, fontWeight: '800', color: theme.colors.textTertiary, marginBottom: 2 },
  dateWeekday: { fontSize: 11, fontWeight: '600', color: theme.colors.textTertiary, marginTop: 2 },
  dateDay: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  activeText: { color: '#FFF' },

  // ✅ Brand New Custom Dropdown Component Layout Engine Styles
  dropdownContainer: { position: 'relative', zIndex: 50, marginBottom: 20, borderColor: theme.colors.primary },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, height: 48, backgroundColor: theme.colors.background, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  dropdownHeaderActive: { borderColor: theme.colors.primary },
  dropdownDisabled: { opacity: 0.5 },
  dropdownValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dropdownValueText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  dropdownListWrapper: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 5, zIndex: 100 },
  dropdownScroll: { maxHeight: 180 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border + '30' },
  dropdownItemActive: { backgroundColor: theme.colors.primary + '05' },
  dropdownItemText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
  dropdownItemTextActive: { color: theme.colors.primary, fontWeight: '700' },

  emptyState: { padding: 30, backgroundColor: theme.colors.background, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { fontSize: 13, color: theme.colors.textTertiary, marginTop: 6, textAlign: 'center' },
  modeContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  modeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: theme.colors.background, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  modeOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '08' },
  modeLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textTertiary },
  reasonInput: { marginBottom: 12 },
  errorText: { color: theme.colors.error, fontSize: 12, textAlign: 'center', marginBottom: 10 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerBtn: { flex: 1 },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16, gap: 8 },
  summaryText: { fontSize: 13, flex: 1 },
});
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from '../../../i18n';
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

// JS getDay() 0=Sun…6=Sat  →  Python weekday() 0=Mon…6=Sun
const JS_TO_PYTHON_WEEKDAY = [6, 0, 1, 2, 3, 4, 5];

function toLocalISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

interface BookingModalProps {
  visible: boolean;
  doctorId: string | number;
  initialSlotIndex?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({
  visible,
  doctorId,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const { t } = useTranslation();
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

  const { doctors } = useDiscoveryStore();
  const linkedAccount = useAuthStore((s) => s.linkedAccount);

  const isSelfBooking = useMemo(() => {
    const doctor = doctors.find((d) => String(d.id) === String(doctorId));
    if (!doctor || !linkedAccount) return false;
    return String(doctor.user_id) === String(linkedAccount.id);
  }, [doctors, doctorId, linkedAccount]);

  useEffect(() => {
    if (visible && doctorId) {
      console.log('[BookingModal] Fetching availability for doctor:', doctorId);
      fetchDoctorAvailability(doctorId);
    }
  }, [visible, doctorId]);

  // ✅ Fixed: use JS_TO_PYTHON_WEEKDAY when matching rules
  const allSlots = useMemo(() => {
    if (!doctorAvailabilityRules || doctorAvailabilityRules.length === 0) {
      console.log('[BookingModal] No availability rules found');
      return [];
    }

    console.log('[BookingModal] Building slots from rules:', doctorAvailabilityRules.map(r => ({
      weekday: r.weekday, start: r.start_time, end: r.end_time
    })));

    const generatedSlots: { start: Date; end: Date }[] = [];
    const today = new Date();

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) { // ✅ start from 1, not 0 (no same-day booking)
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);

      const jsWeekday = currentDay.getDay();
      const pyWeekday = JS_TO_PYTHON_WEEKDAY[jsWeekday]; // ✅ convert before comparing
      const dateISO = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;

      const rulesForDay = doctorAvailabilityRules.filter(
        (r) => r.is_active && (
          r.specific_date
            ? r.specific_date === dateISO           // one-time rule
            : r.weekday === pyWeekday               // ✅ Python weekday match
        )
      );

      for (const rule of rulesForDay) {
        const [h, m] = rule.start_time.split(":").map(Number);
        const [eh, em] = rule.end_time.split(":").map(Number);

        const ruleEnd = new Date(currentDay);
        ruleEnd.setHours(eh, em, 0, 0);

        let cursor = new Date(currentDay);
        cursor.setHours(h, m, 0, 0);

        while (cursor.getTime() + 3600000 <= ruleEnd.getTime()) {
          generatedSlots.push({
            start: new Date(cursor),
            end: new Date(cursor.getTime() + 3600000),
          });
          cursor.setTime(cursor.getTime() + 3600000);
        }
      }
    }

    console.log('[BookingModal] Generated', generatedSlots.length, 'slots');
    return generatedSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [doctorAvailabilityRules]);

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
      fetchMyAppointments();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && initialSlotIndex !== undefined && allSlots.length > 0) {
      const slot = allSlots[initialSlotIndex];
      if (slot) {
        const dateKey = slot.start.toDateString();
        setSelectedDate(dateKey);
        const slotsForDate = groupedSlots[dateKey] || [];
        const slotIdx = slotsForDate.findIndex(
          (s) => s.start.getTime() === slot.start.getTime()
        );
        setSelectedSlotIndex(slotIdx !== -1 ? slotIdx : null);
      }
    }
  }, [allSlots, visible, initialSlotIndex, groupedSlots]);

  const handleBook = async () => {
    if (selectedSlotIndex === null || !selectedDate) return;
    if (hasActiveAppointment) {
      Alert.alert(t("appointment:bookingExists"), t("errors:duplicateBookingErrorShort"));
      return;
    }
    if (isSelfBooking) {
      Alert.alert(t("errors:invalidBooking"), t("errors:bookSelfError"));
      return;
    }

    const selectedSlot = activeDaySlots[selectedSlotIndex];
    const startStr = toLocalISOString(selectedSlot.start);
    const endStr = toLocalISOString(selectedSlot.end);

    console.log('[BookingModal] Booking:', { doctorId, start: startStr, end: endStr, mode });

    try {
      // ✅ Use "doctor" and "mode" — matching backend AppointmentBookingSerializer
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

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Book Appointment"
      subtitle={t("appointment:selectBestTimeDesc")}
      maxWidth={520}
    >
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

        {/* DATE STRIP */}
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
                {isLoading ? "Loading availability..." : "No available dates in the next 14 days."}
              </Text>
            </View>
          ) : uniqueDates.map((dateKey) => {
            const date = new Date(dateKey);
            const isActive = selectedDate === dateKey;
            return (
              <TouchableOpacity key={dateKey}
                style={[styles.dateCard, isActive && styles.dateCardActive]}
                onPress={() => { setSelectedDate(dateKey); setSelectedSlotIndex(null); }}>
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

        {/* TIME GRID */}
        <Text style={styles.label}>2. Select Time</Text>
        {activeDaySlots.length > 0 ? (
          <View style={styles.timeGrid}>
            {activeDaySlots.map((slot, index) => {
              const isActive = selectedSlotIndex === index;
              return (
                <TouchableOpacity key={index}
                  style={[styles.timeSlot, isActive && styles.timeSlotActive]}
                  onPress={() => setSelectedSlotIndex(index)}>
                  <Text style={[styles.timeText, isActive && styles.activeText]}>
                    {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={32} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>
              {isLoading ? "Fetching slots..." : "No slots available on this day."}
            </Text>
          </View>
        )}

        {/* MODE */}
        <Text style={styles.label}>3. Consultation Mode</Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeOption, mode === 'ONLINE' && styles.modeOptionActive]}
            onPress={() => setMode('ONLINE')}
          >
            <Ionicons name="videocam" size={18} color={mode === 'ONLINE' ? theme.colors.primary : theme.colors.textTertiary} />
            <Text style={[styles.modeLabel, mode === 'ONLINE' && { color: theme.colors.primary }]}>{t("appointment:online")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeOption, mode === 'IN_PERSON' && styles.modeOptionActive]}
            onPress={() => setMode('IN_PERSON')}
          >
            <Ionicons name="people" size={18} color={mode === 'IN_PERSON' ? theme.colors.primary : theme.colors.textTertiary} />
            <Text style={[styles.modeLabel, mode === 'IN_PERSON' && { color: theme.colors.primary }]}>{t("appointment:inPerson")}</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Reason for Visit"
          placeholder={t("appointment:reasonEgp")}
          value={reason}
          onChangeText={setReason}
          containerStyle={styles.reasonInput}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.footer}>
          <Button title="Cancel" variant="outline" onPress={onClose} style={styles.footerBtn} />
          <Button title="Confirm Booking" onPress={handleBook} loading={isLoading}
            disabled={isLoading || !reason || selectedSlotIndex === null || isSelfBooking}
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
  label: { fontSize: 12, fontWeight: '800', color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  dateStrip: { marginBottom: 24 },
  dateStripContent: { paddingRight: 20, gap: 10 },
  dateCard: { width: 70, height: 90, backgroundColor: theme.colors.background, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 8 },
  dateCardActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, ...theme.shadows.md },
  dateMonth: { fontSize: 10, fontWeight: '800', color: theme.colors.textTertiary, marginBottom: 2 },
  dateWeekday: { fontSize: 11, fontWeight: '600', color: theme.colors.textTertiary, marginTop: 2 },
  dateDay: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  activeText: { color: '#FFF' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  timeSlot: { width: '31%', paddingVertical: 12, backgroundColor: theme.colors.background, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  timeSlotActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  timeText: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  emptyState: { padding: 30, backgroundColor: theme.colors.background, borderRadius: 16, alignItems: 'center', marginBottom: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { fontSize: 13, color: theme.colors.textTertiary, marginTop: 10, textAlign: 'center' },
  modeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: theme.colors.background, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  modeOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '08' },
  modeLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textTertiary },
  reasonInput: { marginBottom: 10 },
  errorText: { color: theme.colors.error, fontSize: 12, textAlign: 'center', marginBottom: 10 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerBtn: { flex: 1 },
});
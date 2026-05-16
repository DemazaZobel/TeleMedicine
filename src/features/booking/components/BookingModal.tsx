import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Button, Input } from "../../../components/ui";
import { ModalBase } from "../../../components/ui/ModalBase";
import { useBookingStore } from "../../../store/booking.store";
import { useDiscoveryStore } from "../../../store/discovery.store";
import type { Theme } from "../../../theme";
import { useTheme } from "../../../theme";
import type { AppointmentMode } from "../types/bookingTypes";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookingModalProps {
  visible: boolean;
  doctorId: string | number;
  onClose: () => void;
  onSuccess: () => void;
  initialSlotIndex?: number;
}

export function BookingModal({
  visible,
  doctorId,
  onClose,
  onSuccess,
}: BookingModalProps) {
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

  // Fetch real availability when modal opens
  useEffect(() => {
    if (visible && doctorId) {
      fetchDoctorAvailability(doctorId);
    }
  }, [visible, doctorId]);

  // Generate real slots from doctor rules
  const allSlots = useMemo(() => {
    if (!doctorAvailabilityRules || doctorAvailabilityRules.length === 0)
      return [];

    const generatedSlots = [];
    const today = new Date();

    // Generate slots for the next 14 days
    for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);
      const weekday = currentDay.getDay();

      const rulesForDay = doctorAvailabilityRules.filter(
        (r) => r.weekday === weekday && r.is_active,
      );

      for (const rule of rulesForDay) {
        const [h, m] = rule.start_time.split(":").map(Number);
        const [eh, em] = rule.end_time.split(":").map(Number);

        const ruleEnd = new Date(currentDay);
        ruleEnd.setHours(eh, em, 0, 0);

        let currentSlotStart = new Date(currentDay);
        currentSlotStart.setHours(h, m, 0, 0);

        while (currentSlotStart.getTime() + 3600000 <= ruleEnd.getTime()) {
          if (dayOffset > 0 || currentSlotStart.getTime() > today.getTime()) {
            generatedSlots.push({
              start: new Date(currentSlotStart),
              end: new Date(currentSlotStart.getTime() + 3600000),
            });
          }
          currentSlotStart.setTime(currentSlotStart.getTime() + 3600000);
        }
      }
    }

    return generatedSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [doctorAvailabilityRules]);

  // Group slots by date for the horizontal selector
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

  // Set initial selected date
  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  const activeDaySlots = useMemo(() => {
    return selectedDate ? groupedSlots[selectedDate] : [];
  }, [selectedDate, groupedSlots]);

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
      fetchMyAppointments();
    }
  }, [visible, fetchMyAppointments]);

  const handleBook = async () => {
    if (selectedSlotIndex === null || !selectedDate) return;
    if (hasActiveAppointment) {
      Alert.alert("Booking Exists", "You already have an active appointment with this doctor.");
      return;
    }

    try {
      const selectedSlot = activeDaySlots[selectedSlotIndex];
      await bookAppointment({
        doctor_id: doctorId,
        scheduled_start: selectedSlot.start.toISOString(),
        scheduled_end: selectedSlot.end.toISOString(),
        appointment_type: mode,
        reason,
      });
      onSuccess();
    } catch { }
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Book Appointment"
      subtitle="Select a date and time that works best for you."
      maxWidth={520}
    >
      <View style={styles.container}>
        {hasActiveAppointment && (
          <View style={styles.warningBanner}>
            <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              You have an active booking with this doctor.
            </Text>
          </View>
        )}

        {/* DATE STRIP */}
        <Text style={styles.label}>1. Select Date</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.dateStrip}
          contentContainerStyle={styles.dateStripContent}
        >
          {uniqueDates.map((dateKey) => {
            const date = new Date(dateKey);
            const isActive = selectedDate === dateKey;
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <TouchableOpacity
                key={dateKey}
                style={[styles.dateCard, isActive && styles.dateCardActive]}
                onPress={() => {
                  setSelectedDate(dateKey);
                  setSelectedSlotIndex(null);
                }}
              >
                <Text style={[styles.dateWeekday, isActive && styles.activeText]}>
                  {date.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.dateDay, isActive && styles.activeText]}>
                  {date.getDate()}
                </Text>
                {isToday && <View style={[styles.todayDot, isActive && { backgroundColor: '#FFF' }]} />}
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
                <TouchableOpacity
                  key={index}
                  style={[styles.timeSlot, isActive && styles.timeSlotActive]}
                  onPress={() => setSelectedSlotIndex(index)}
                >
                  <Text style={[styles.timeText, isActive && styles.activeText]}>
                    {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={32} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>
              {isLoading ? "Fetching slots..." : "No availability on this day."}
            </Text>
          </View>
        )}

        {/* MODE SELECTOR */}
        <Text style={styles.label}>3. Consultation Mode</Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeOption, mode === 'ONLINE' && styles.modeOptionActive]}
            onPress={() => setMode('ONLINE')}
          >
            <Ionicons name="videocam" size={18} color={mode === 'ONLINE' ? theme.colors.primary : theme.colors.textTertiary} />
            <Text style={[styles.modeLabel, mode === 'ONLINE' && { color: theme.colors.primary }]}>Online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeOption, mode === 'IN_PERSON' && styles.modeOptionActive]}
            onPress={() => setMode('IN_PERSON')}
          >
            <Ionicons name="people" size={18} color={mode === 'IN_PERSON' ? theme.colors.primary : theme.colors.textTertiary} />
            <Text style={[styles.modeLabel, mode === 'IN_PERSON' && { color: theme.colors.primary }]}>In Person</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Reason for Visit"
          placeholder="E.g., General checkup, follow-up..."
          value={reason}
          onChangeText={setReason}
          containerStyle={styles.reasonInput}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.footer}>
          <Button title="Cancel" variant="outline" onPress={onClose} style={styles.footerBtn} />
          <Button 
            title="Confirm Booking" 
            onPress={handleBook} 
            loading={isLoading}
            disabled={isLoading || !reason || selectedSlotIndex === null}
            style={styles.footerBtn}
          />
        </View>
      </View>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: 10,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.colors.warning + '10',
      padding: 12,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.warning + '20',
    },
    warningText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.warning,
      flex: 1,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    dateStrip: {
      marginBottom: 24,
    },
    dateStripContent: {
      paddingRight: 20,
    },
    dateCard: {
      width: 60,
      height: 80,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dateCardActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...theme.shadows.md,
    },
    dateWeekday: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.textTertiary,
      marginBottom: 4,
    },
    dateDay: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
    },
    todayDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
      marginTop: 6,
    },
    activeText: {
      color: '#FFF',
    },
    timeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
    },
    timeSlot: {
      width: '31%',
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    timeSlotActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    timeText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    emptyState: {
      padding: 30,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 24,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      marginTop: 10,
      textAlign: 'center',
    },
    modeContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    modeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modeOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '08',
    },
    modeLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textTertiary,
    },
    reasonInput: {
      marginBottom: 10,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 10,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 10,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    footerBtn: {
      flex: 1,
    }
  });

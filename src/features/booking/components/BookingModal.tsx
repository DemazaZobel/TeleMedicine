import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Input } from "../../../components/ui";
import { ModalBase } from "../../../components/ui/ModalBase";
import { useBookingStore } from "../../../store/booking.store";
import { useDiscoveryStore } from "../../../store/discovery.store";
import type { Theme } from "../../../theme";
import { useTheme } from "../../../theme";
import type { AppointmentMode } from "../types/bookingTypes";

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
  initialSlotIndex = 0,
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
  const [selectedIndex, setSelectedIndex] = useState(initialSlotIndex);

  const { doctors } = useDiscoveryStore();

  // Fetch real availability when modal opens
  useEffect(() => {
    if (visible && doctorId) {
      fetchDoctorAvailability(doctorId);
    }
  }, [visible, doctorId]);

  // Generate real slots from doctor rules
  const slots = useMemo(() => {
    if (!doctorAvailabilityRules || doctorAvailabilityRules.length === 0)
      return [];

    const generatedSlots = [];
    const today = new Date();

    // Generate slots for the next 14 days (including today)
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

        // Generate hourly slots within the rule's window
        while (currentSlotStart.getTime() + 3600000 <= ruleEnd.getTime()) {
          // If it's today, only show future slots
          if (dayOffset > 0 || currentSlotStart.getTime() > today.getTime()) {
            generatedSlots.push({
              start: new Date(currentSlotStart),
              end: new Date(currentSlotStart.getTime() + 3600000),
            });
          }
          // Move to next hour
          currentSlotStart.setTime(currentSlotStart.getTime() + 3600000);
        }
      }
    }

    // Sort slots by date
    return generatedSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [doctorAvailabilityRules]);

  const hasActiveAppointment = useMemo(() => {
    const doctor = doctors.find((d) => String(d.id) === String(doctorId));
    return appointments.some((a) => {
      const docId = String(a.doctor?.id || a.doctor);
      const matchId =
        docId === String(doctorId) ||
        (doctor && docId === String(doctor.user_id));
      const matchStatus = ["requested", "confirmed", "pending"].includes(
        a.status?.toLowerCase() || "",
      );
      return matchId && matchStatus;
    });
  }, [appointments, doctorId, doctors]);

  useEffect(() => {
    if (visible) {
      setReason("");
      setMode("ONLINE");
      setSelectedIndex(initialSlotIndex);
      fetchMyAppointments(); // Fetch latest to ensure accurate double-booking check
    }
  }, [visible, fetchMyAppointments, initialSlotIndex]);

  const handleBook = async () => {
    if (hasActiveAppointment) {
      Alert.alert(
        "Booking Exists",
        "You already have an active appointment with this doctor.",
      );
      return;
    }

    try {
      const selectedSlot = slots[selectedIndex];
      const start = selectedSlot.start;
      const end = new Date(start.getTime() + 60 * 60 * 1000); // Default to 1 hour duration
      
      console.log('[BookingModal] Booking appointment:', {
        doctorId,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      await bookAppointment({
        doctor_id: doctorId,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        appointment_type: mode,
        reason,
      });
      onSuccess();
    } catch {
      // Error is stored by the hook
    }
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Book Appointment"
      subtitle="Select your preferred mode and provide a reason."
      maxWidth={520}
    >
      <View>
        {hasActiveAppointment && (
          <View
            style={[
              styles.warningBanner,
              { backgroundColor: theme.colors.amber50 },
            ]}
          >
            <Text
              style={[styles.warningText, { color: theme.colors.amber700 }]}
            >
              You already have a pending or confirmed appointment with this
              doctor.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Select Available Slot</Text>
        {slots && slots.length > 0 ? (
          <View style={styles.slotsGrid}>
            {slots.slice(0, 9).map((slot, index) => {
              const isActive = index === selectedIndex;
              const isToday = slot.start.toDateString() === new Date().toDateString();
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.gridSlot, isActive && styles.gridSlotActive]}
                  onPress={() => setSelectedIndex(index)}
                >
                  <Text style={[styles.gridDayName, isActive && styles.activeText]}>
                    {isToday ? 'TODAY' : slot.start.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase()}
                  </Text>
                  <Text style={[styles.gridTime, isActive && styles.activeText]}>
                    {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptySlots}>
            <Ionicons name="calendar-outline" size={32} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>
              {isLoading
                ? "Fetching doctor's schedule..."
                : "No available slots found for the next two weeks."}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Consultation Mode</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              mode === "ONLINE" && styles.segmentButtonActive,
            ]}
            onPress={() => setMode("ONLINE")}
          >
            <View style={styles.segmentInner}>
              <Ionicons
                name="videocam"
                size={18}
                color={
                  mode === "ONLINE"
                    ? theme.colors.primary
                    : theme.colors.textTertiary
                }
              />
              <Text
                style={[
                  styles.segmentText,
                  mode === "ONLINE" && styles.segmentTextActive,
                ]}
              >
                Online
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              mode === "IN_PERSON" && styles.segmentButtonActive,
            ]}
            onPress={() => setMode("IN_PERSON")}
          >
            <View style={styles.segmentInner}>
              <Ionicons
                name="location"
                size={18}
                color={
                  mode === "IN_PERSON"
                    ? theme.colors.primary
                    : theme.colors.textTertiary
                }
              />
              <Text
                style={[
                  styles.segmentText,
                  mode === "IN_PERSON" && styles.segmentTextActive,
                ]}
              >
                In Person
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Input
          label="Reason for Visit"
          placeholder="E.g., Follow up, General checkup"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={3}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            disabled={isLoading}
            style={styles.actionBtn}
          />
          <Button
            title={isLoading ? "Booking..." : "Confirm Book"}
            onPress={handleBook}
            disabled={isLoading || !reason || hasActiveAppointment}
            style={styles.actionBtn}
            loading={isLoading}
          />
        </View>
      </View>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    warningBanner: {
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
    },
    warningText: {
      ...theme.typography.bodySm,
      fontWeight: "600",
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    slotsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: theme.spacing.xl,
    },
    gridSlot: {
      width: '31%',
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: 'center',
    },
    gridSlotActive: {
      backgroundColor: theme.colors.primaryLight + "10",
      borderColor: theme.colors.primary,
    },
    slotDateBox: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
      marginBottom: 4,
    },
    gridDayNum: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
    },
    gridDayName: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    gridTime: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    activeText: {
      color: theme.colors.primary,
    },
    emptySlots: {
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
    },
    emptyText: {
      ...theme.typography.bodySm,
      color: theme.colors.textTertiary,
      textAlign: "center",
      marginTop: 8,
    },
    segmentedControl: {
      flexDirection: "row",
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: 4,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: theme.radius.sm,
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    segmentInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    segmentText: {
      ...theme.typography.bodySm,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    segmentTextActive: {
      color: theme.colors.text,
    },
    errorText: {
      ...theme.typography.bodySm,
      color: theme.colors.error,
      marginTop: theme.spacing.sm,
      textAlign: "center",
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.md,
    },
    actionBtn: {
      flex: 1,
      height: 48,
    },
  });

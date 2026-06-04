import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Input } from "../../../components/ui";
import { ModalBase } from "../../../components/ui/ModalBase";
import { useBookingStore } from "../../../store/booking.store";
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

interface RescheduleModalProps {
  visible: boolean;
  doctorId: string | number;
  isDoctor?: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => void;
  isLoading: boolean;
}

export function RescheduleModal({
  visible,
  doctorId,
  isDoctor = false,
  onClose,
  onConfirm,
  isLoading,
}: RescheduleModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { fetchDoctorAvailability, fetchAvailabilityRules, doctorAvailabilityRules, availabilityRules } = useBookingStore();

  const rules = isDoctor ? availabilityRules : doctorAvailabilityRules;

  const [mode, setMode] = useState<AppointmentMode>("ONLINE");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Dropdown Picker Overlay States
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      if (isDoctor) {
        fetchAvailabilityRules();
      } else if (doctorId) {
        fetchDoctorAvailability(doctorId);
      }
    }
  }, [visible, doctorId, isDoctor]);

  const allSlots = useMemo(() => {
    if (!rules || rules.length === 0) return [];
    const generatedSlots = [];
    const today = new Date();

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);

      const jsWeekday = currentDay.getDay();
      const pyWeekday = JS_TO_PYTHON_WEEKDAY[jsWeekday];
      const dateISO = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;

      const rulesForDay = rules.filter(
        (r) => r.is_active && (r.specific_date ? r.specific_date === dateISO : r.weekday === pyWeekday)
      );

      for (const rule of rulesForDay) {
        const [h, m] = rule.start_time.split(":").map(Number);
        const [eh, em] = rule.end_time.split(":").map(Number);

        const ruleEnd = new Date(currentDay);
        ruleEnd.setHours(eh, em, 0, 0);

        let currentSlotStart = new Date(currentDay);
        currentSlotStart.setHours(h, m, 0, 0);

        while (currentSlotStart.getTime() + 3600000 <= ruleEnd.getTime()) {
          generatedSlots.push({
            start: new Date(currentSlotStart),
            end: new Date(currentSlotStart.getTime() + 3600000),
          });
          currentSlotStart.setTime(currentSlotStart.getTime() + 3600000);
        }
      }
    }
    return generatedSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [rules]);

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
    if (uniqueDates.length > 0) {
      setSelectedDate(uniqueDates[0]);
    } else {
      setSelectedDate(null);
    }
  }, [uniqueDates]);

  const activeDaySlots = useMemo(() => {
    return (selectedDate ? groupedSlots[selectedDate] : []) || [];
  }, [selectedDate, groupedSlots]);

  useEffect(() => {
    if (visible) {
      setNotes("");
      setMode("ONLINE");
      setSelectedSlotIndex(null);
      setSelectedDate(null);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (selectedSlotIndex === null || !selectedDate) return;
    const selectedSlot = activeDaySlots[selectedSlotIndex];
    onConfirm({
      proposed_start: toLocalISOString(selectedSlot.start),
      proposed_end: toLocalISOString(selectedSlot.end),
      proposed_mode: mode,
      notes,
      expires_at: toLocalISOString(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    });
  };

  // UI Format Helpers
  const formatDropdownDate = (dateString: string | null) => {
    if (!dateString) return "Select a date";
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDropdownTime = (index: number | null) => {
    if (index === null || !activeDaySlots[index]) return "Select a time";
    return activeDaySlots[index].start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Propose Reschedule"
      subtitle="Suggest a new time and mode for this appointment."
      maxWidth={520}
    >
      <View style={styles.container}>

        {/* DROPDOWNS ROW */}
        <View style={styles.dropdownRow}>
          <View style={styles.dropdownField}>
            <Text style={styles.label}>Select New Date</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDatePickerVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>{formatDropdownDate(selectedDate)}</Text>
              <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.dropdownField}>
            <Text style={styles.label}>Select New Time</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !selectedDate && styles.dropdownDisabled]}
              disabled={!selectedDate}
              onPress={() => setTimePickerVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>{formatDropdownTime(selectedSlotIndex)}</Text>
              <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* CONSULTATION MODE SELECTOR */}
        <Text style={styles.label}>Consultation Mode</Text>
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

        {/* REASON INPUT */}
        <Input
          label="Reason for Change"
          placeholder="E.g., I have a conflicting meeting..."
          value={notes}
          onChangeText={setNotes}
          containerStyle={styles.reasonInput}
        />

        {/* ACTION FOOTER */}
        <View style={styles.footer}>
          <Button title="Cancel" variant="outline" onPress={onClose} disabled={isLoading} style={styles.footerBtn} />
          <Button
            title="Propose"
            onPress={handleConfirm}
            loading={isLoading}
            disabled={isLoading || allSlots.length === 0 || selectedSlotIndex === null}
            style={styles.footerBtn}
          />
        </View>
      </View>

      {/* ==================== SELECTOR DROPDOWN OVERLAYS ==================== */}

      {/* Date Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDatePickerVisible(false)}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Available Dates</Text>
            <ScrollView bounces={false}>
              {uniqueDates.map((dateKey) => (
                <TouchableOpacity
                  key={dateKey}
                  style={[styles.pickerOption, selectedDate === dateKey && styles.pickerOptionSelected]}
                  onPress={() => {
                    setSelectedDate(dateKey);
                    setSelectedSlotIndex(null); // Reset time when date changes
                    setDatePickerVisible(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, selectedDate === dateKey && styles.pickerOptionTextSelected]}>
                    {formatDropdownDate(dateKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={timePickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTimePickerVisible(false)}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Available Slots</Text>
            {activeDaySlots.length > 0 ? (
              <ScrollView bounces={false}>
                {activeDaySlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.pickerOption, selectedSlotIndex === index && styles.pickerOptionSelected]}
                    onPress={() => {
                      setSelectedSlotIndex(index);
                      setTimePickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerOptionText, selectedSlotIndex === index && styles.pickerOptionTextSelected]}>
                      {slot.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noSlotsText}>Please select a valid date first.</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: 10,
    },
    label: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    dropdownRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    dropdownField: {
      flex: 1,
    },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      height: 48,
    },
    dropdownDisabled: {
      opacity: 0.5,
    },
    dropdownButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    modeContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
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
      height: 46,
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
    },
    /* Modal Overlay Selector Pickers styles */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    pickerCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      paddingVertical: 16,
      maxHeight: 320,
      ...theme.shadows.md,
    },
    pickerTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.text,
      paddingHorizontal: 20,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pickerOption: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    pickerOptionSelected: {
      backgroundColor: theme.colors.primary + '10',
    },
    pickerOptionText: {
      fontSize: 15,
      color: theme.colors.textSecondary,
    },
    pickerOptionTextSelected: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    noSlotsText: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      color: theme.colors.textTertiary,
      fontStyle: 'italic',
    },
  });
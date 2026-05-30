import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  Button,
  Card,
  Input,
  PageHeader,
  ScreenContainer,
} from "../../src/components/ui";
import { useAppointmentStore } from "../../src/store/appointmentStore";
import type { Theme } from "../../src/theme";
import { useTheme } from "../../src/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentMode = "IN_PERSON" | "ONLINE";

interface AvailabilityRule {
  id: number;
  weekday: number; // 0=Monday … 6=Sunday  (Python convention)
  start_time: string; // "HH:MM:SS"
  end_time: string;
  is_active: boolean;
}

interface TimeSlot {
  label: string; // "09:00 – 10:00"
  start: Date;
  end: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// JS getDay(): 0=Sun,1=Mon…6=Sat  →  Python weekday(): 0=Mon…6=Sun
const JS_TO_PYTHON_WEEKDAY = [6, 0, 1, 2, 3, 4, 5];

const SLOT_DURATION_MINUTES = 60;

const WEEKDAY_LABELS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTime(timeStr: string): { h: number; m: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { h, m };
}

/** Generate hourly slots between rule start and end for a given calendar date */
function generateSlots(date: Date, rules: AvailabilityRule[]): TimeSlot[] {
  const pyWeekday = JS_TO_PYTHON_WEEKDAY[date.getDay()];
  const dayRules = rules.filter(
    (r) => r.weekday === pyWeekday && r.is_active
  );

  const slots: TimeSlot[] = [];

  for (const rule of dayRules) {
    const { h: startH, m: startM } = parseTime(rule.start_time);
    const { h: endH, m: endM } = parseTime(rule.end_time);

    let cursor = new Date(date);
    cursor.setHours(startH, startM, 0, 0);

    const ruleEnd = new Date(date);
    ruleEnd.setHours(endH, endM, 0, 0);

    while (cursor < ruleEnd) {
      const slotEnd = new Date(
        cursor.getTime() + SLOT_DURATION_MINUTES * 60 * 1000
      );
      if (slotEnd > ruleEnd) break;

      const fmt = (d: Date) =>
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      slots.push({
        label: `${fmt(cursor)} – ${fmt(slotEnd)}`,
        start: new Date(cursor),
        end: new Date(slotEnd),
      });

      cursor = slotEnd;
    }
  }

  return slots;
}

/** Next N calendar days starting from tomorrow */
function getSelectableDates(n = 14): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { bookAppointment, loading } = useAppointmentStore();

  // Step 1 – doctor lookup
  const [doctorId, setDoctorId] = useState("");
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesLoaded, setRulesLoaded] = useState(false);

  // Step 2 – slot selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Step 3 – details
  const [mode, setMode] = useState<AppointmentMode>("IN_PERSON");
  const [reason, setReason] = useState("");

  const dates = useMemo(() => getSelectableDates(14), []);

  const slots = useMemo(
    () => (selectedDate ? generateSlots(selectedDate, rules) : []),
    [selectedDate, rules]
  );

  // Reset slot when date changes
  useEffect(() => { setSelectedSlot(null); }, [selectedDate]);

  // ── Fetch availability rules when doctor ID is entered ──────────────────────
  const fetchRules = useCallback(async () => {
    const id = doctorId.trim();
    if (!id) return;

    setRulesLoading(true);
    setRulesLoaded(false);
    setRules([]);
    setSelectedDate(null);
    setSelectedSlot(null);

    try {
      // Adjust base URL to your API config
      const res = await fetch(
        `/api/appointments/availability/?doctor_id=${id}`
      );
      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Not found", err.detail ?? "Doctor not found.");
        return;
      }
      const data: AvailabilityRule[] = await res.json();
      setRules(data);
      setRulesLoaded(true);
    } catch {
      Alert.alert("Error", "Could not fetch doctor availability.");
    } finally {
      setRulesLoading(false);
    }
  }, [doctorId]);

  // ── Available weekdays for the date strip ──────────────────────────────────
  const availableWeekdays = useMemo(() => {
    const active = rules.filter((r) => r.is_active).map((r) => r.weekday);
    return new Set(active);
  }, [rules]);

  const isDateAvailable = useCallback(
    (d: Date) => availableWeekdays.has(JS_TO_PYTHON_WEEKDAY[d.getDay()]),
    [availableWeekdays]
  );
  function toLocalISOString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
  }
  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedSlot) {
      Alert.alert("Required", "Please select a time slot.");
      return;
    }
    try {
      await bookAppointment({
        doctor: doctorId.trim(),
        // ✅ Local time, not UTC
        scheduled_start: toLocalISOString(selectedSlot.start),
        scheduled_end: toLocalISOString(selectedSlot.end),
        mode,
        reason: reason.trim() || undefined,
      });
      Alert.alert("Submitted!", "Your appointment request has been sent.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Booking Failed", e.message ?? "Something went wrong.");
    }
  };
  // ── Active weekday names for the "Available days" hint ─────────────────────
  const availableDayNames = useMemo(
    () =>
      [...availableWeekdays]
        .sort()
        .map((d) => WEEKDAY_LABELS[d])
        .join(", "),
    [availableWeekdays]
  );

  return (
    <ScreenContainer scrollable padded constrained>
      <PageHeader
        title="Book Appointment"
        subtitle="Choose a slot within your doctor's availability"
        rightElement={
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />

      {/* ── Step 1: Doctor ID ── */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="person-outline" size={15} /> Doctor
        </Text>
        <Input
          label="Doctor ID"
          placeholder="Enter the doctor's profile ID"
          value={doctorId}
          onChangeText={(t) => {
            setDoctorId(t);
            setRulesLoaded(false);
          }}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={fetchRules}
        />
        <Button
          title="Check Availability"
          onPress={fetchRules}
          loading={rulesLoading}
          fullWidth
          variant="outline"
          style={{ marginTop: theme.spacing.sm }}
        />

        {rulesLoaded && rules.length === 0 && (
          <View style={styles.hintBox}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.hintText}>
              This doctor has no availability set yet.
            </Text>
          </View>
        )}

        {rulesLoaded && rules.length > 0 && (
          <View style={[styles.hintBox, styles.hintSuccess]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={theme.colors.success}
            />
            <Text style={[styles.hintText, { color: theme.colors.success }]}>
              Available on: {availableDayNames}
            </Text>
          </View>
        )}
      </Card>

      {/* ── Step 2: Date + Slot ── */}
      {rulesLoaded && rules.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar-outline" size={15} /> Select Date
          </Text>

          {/* Date strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateStrip}
            contentContainerStyle={{ gap: theme.spacing.sm }}
          >
            {dates.map((d, i) => {
              const available = isDateAvailable(d);
              const selected =
                selectedDate?.toDateString() === d.toDateString();
              return (
                <TouchableOpacity
                  key={i}
                  disabled={!available}
                  onPress={() => setSelectedDate(d)}
                  style={[
                    styles.dateChip,
                    selected && styles.dateChipSelected,
                    !available && styles.dateChipDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateChipText,
                      selected && styles.dateChipTextSelected,
                      !available && styles.dateChipTextDisabled,
                    ]}
                  >
                    {formatDateShort(d)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Slot grid */}
          {selectedDate && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>
                <Ionicons name="time-outline" size={15} /> Available Slots
              </Text>

              {slots.length === 0 ? (
                <View style={styles.hintBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.hintText}>
                    No slots available on this day.
                  </Text>
                </View>
              ) : (
                <View style={styles.slotGrid}>
                  {slots.map((slot, i) => {
                    const selected = selectedSlot?.label === slot.label;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          selected && styles.slotChipSelected,
                        ]}
                      >
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={
                            selected
                              ? "#fff"
                              : theme.colors.primary
                          }
                        />
                        <Text
                          style={[
                            styles.slotChipText,
                            selected && styles.slotChipTextSelected,
                          ]}
                        >
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </Card>
      )}

      {/* ── Step 3: Mode + Reason ── */}
      {selectedSlot && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="options-outline" size={15} /> Consultation Details
          </Text>

          {/* Selected slot summary */}
          <View style={styles.summaryRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.success}
            />
            <Text style={styles.summaryText}>
              {formatDateShort(selectedSlot.start)} · {selectedSlot.label}
            </Text>
          </View>

          {/* Mode */}
          <Text style={styles.fieldLabel}>Consultation Mode</Text>
          <View style={styles.modeRow}>
            {(
              [
                { value: "IN_PERSON", icon: "location", label: "In-Person" },
                { value: "ONLINE", icon: "videocam", label: "Online" },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.modeChip,
                  mode === opt.value && styles.modeChipSelected,
                ]}
                onPress={() => setMode(opt.value)}
              >
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={
                    mode === opt.value ? "#fff" : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.modeChipText,
                    mode === opt.value && styles.modeChipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reason */}
          <Input
            label="Reason (optional)"
            placeholder="Briefly describe your symptoms or reason for visit"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />
        </Card>
      )}

      {/* ── Submit ── */}
      {selectedSlot && (
        <Button
          title="Request Appointment"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={styles.submitBtn}
        />
      )}
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    hintBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
    },
    hintSuccess: {
      backgroundColor: theme.colors.successLight,
    },
    hintText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      flex: 1,
    },

    // Date strip
    dateStrip: {
      marginBottom: theme.spacing.sm,
    },
    dateChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    dateChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dateChipDisabled: {
      opacity: 0.35,
    },
    dateChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.text,
    },
    dateChipTextSelected: {
      color: "#fff",
    },
    dateChipTextDisabled: {
      color: theme.colors.textSecondary,
    },

    // Slot grid
    slotGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    slotChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.primary + "60",
      backgroundColor: theme.colors.primaryLight,
    },
    slotChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    slotChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    slotChipTextSelected: {
      color: "#fff",
    },

    // Summary
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.successLight,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.md,
    },
    summaryText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.success,
    },

    // Mode
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    modeRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    modeChip: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    modeChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    modeChipText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    modeChipTextSelected: {
      color: "#fff",
    },

    submitBtn: {
      marginBottom: theme.spacing["2xl"],
    },
  });
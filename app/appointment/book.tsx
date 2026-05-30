import React, { useState } from "react";
import { useTranslation } from '../../src/i18n';
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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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

  // Date/time state — using manual input for now (yyyy-mm-dd and hh:mm)
  const [dateStr, setDateStr] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("");
  const [durationHours, setDurationHours] = useState("1");

  const handleSubmit = async () => {
    if (!doctorId.trim()) {
      Alert.alert(t("errors:required"), t("errors:validationDoctorIdRequired"));
      return;
    }
    if (!dateStr.trim() || !startTimeStr.trim()) {
      Alert.alert(t("errors:required"), t("errors:validationDateStartRequired"));
      return;
    }

    // Parse date + time → ISO
    const startDate = new Date(`${dateStr}T${startTimeStr}:00`);
    if (isNaN(startDate.getTime())) {
      Alert.alert(t("errors:invalid"), t("appointment:validationDateTime"));
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
      Alert.alert("Success", t("appointment:requestSubmitted"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(t("errors:bookingFailed"), e.message || "Something went wrong.");
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
          <Text style={styles.headerTitle}>Book Appointment</Text>
        </View>

        {/* Illustration area */}
        <View style={styles.illustrationBox}>
          <Ionicons name="calendar" size={48} color={COLORS.primary} />
          <Text style={styles.illustrationText}>
            Schedule a visit with your provider
          </Text>
        </View>

        {/* Doctor ID */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("doctor:doctorId")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("appointment:enterDoctorId")}
            placeholderTextColor={COLORS.textMuted}
            value={doctorId}
            onChangeText={setDoctorId}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Ask your provider for their ID, or find them in the directory.
          </Text>
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("appointment:appointmentDate")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("common:dateFormatPlaceholder")}
            placeholderTextColor={COLORS.textMuted}
            value={dateStr}
            onChangeText={setDateStr}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Time + Duration row */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t("doctor:startTime")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("doctor:timeFormat24h")}
              placeholderTextColor={COLORS.textMuted}
              value={startTimeStr}
              onChangeText={setStartTimeStr}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 0.6 }]}>
            <Text style={styles.label}>{t("doctor:durationHrs")}</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              placeholderTextColor={COLORS.textMuted}
              value={durationHours}
              onChangeText={setDurationHours}
              keyboardType="numeric"
            />
          </View>
        )}
      </Card>

        {/* Mode Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("appointment:consultationMode")}</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeOption,
                mode === "IN_PERSON" && styles.modeActive,
              ]}
              onPress={() => setMode("IN_PERSON")}
            >
              <Ionicons
                name="location"
                size={20}
                color={mode === "IN_PERSON" ? "#fff" : COLORS.primary}
              />
              <Text
                style={[
                  styles.modeLabel,
                  mode === "IN_PERSON" && styles.modeLabelActive,
                ]}
              >
                In-Person
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
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Reason <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t("appointment:reasonPlaceholder")}
            placeholderTextColor={COLORS.textMuted}
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
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>{t("appointment:requestAppointment")}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    marginBottom: SPACING.l,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  illustrationBox: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: RADII.l,
    marginBottom: SPACING.l,
    gap: SPACING.s,
  },
  illustrationText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  fieldGroup: {
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  optional: {
    fontWeight: "400",
    color: COLORS.textMuted,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    padding: SPACING.m,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  modeRow: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  modeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    padding: SPACING.m,
    borderRadius: RADII.m,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  modeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeActiveOnline: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  modeLabelActive: {
    color: "#fff",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: RADII.m,
    marginTop: SPACING.l,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

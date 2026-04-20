import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SPACING } from "../../src/constants/theme";
import { useAppointmentStore } from "../../src/store/appointmentStore";
import { AppointmentMode } from "../../src/types/appointment";

// Quick helper - add hours to a date
function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeDisplay(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookAppointmentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookAppointment, loading } = useAppointmentStore();

  // Form state
  const [doctorId, setDoctorId] = useState("");
  const [mode, setMode] = useState<AppointmentMode>("IN_PERSON");
  const [reason, setReason] = useState("");

  // Date/time state — using manual input for now (yyyy-mm-dd and hh:mm)
  const [dateStr, setDateStr] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("");
  const [durationHours, setDurationHours] = useState("1");

  const handleSubmit = async () => {
    if (!doctorId.trim()) {
      Alert.alert("Required", "Please enter the doctor ID.");
      return;
    }
    if (!dateStr.trim() || !startTimeStr.trim()) {
      Alert.alert("Required", "Please enter date and start time.");
      return;
    }

    // Parse date + time → ISO
    const startDate = new Date(`${dateStr}T${startTimeStr}:00`);
    if (isNaN(startDate.getTime())) {
      Alert.alert("Invalid", "Please enter a valid date (YYYY-MM-DD) and time (HH:MM).");
      return;
    }

    const endDate = addHours(startDate, parseFloat(durationHours) || 1);

    try {
      await bookAppointment({
        doctor: doctorId.trim(),
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        mode,
        reason: reason.trim() || undefined,
      });
      Alert.alert("Success", "Your appointment request has been submitted!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Booking Failed", e.message || "Something went wrong.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.screen, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back + Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
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
          <Text style={styles.label}>Doctor ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the doctor's profile ID"
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
          <Text style={styles.label}>Appointment Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textMuted}
            value={dateStr}
            onChangeText={setDateStr}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Time + Duration row */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Start Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM (24h)"
              placeholderTextColor={COLORS.textMuted}
              value={startTimeStr}
              onChangeText={setStartTimeStr}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 0.6 }]}>
            <Text style={styles.label}>Duration (hrs)</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              placeholderTextColor={COLORS.textMuted}
              value={durationHours}
              onChangeText={setDurationHours}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Mode Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Consultation Mode</Text>
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
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeOption,
                mode === "ONLINE" && styles.modeActiveOnline,
              ]}
              onPress={() => setMode("ONLINE")}
            >
              <Ionicons
                name="videocam"
                size={20}
                color={mode === "ONLINE" ? "#fff" : COLORS.secondary}
              />
              <Text
                style={[
                  styles.modeLabel,
                  mode === "ONLINE" && styles.modeLabelActive,
                ]}
              >
                Online
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Reason <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Briefly describe your symptoms or reason for visit"
            placeholderTextColor={COLORS.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>Request Appointment</Text>
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

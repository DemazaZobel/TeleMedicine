import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, RADII, SPACING } from "../../src/constants/theme";
import * as svc from "../../src/services/appointmentService";
import { useAppointmentStore } from "../../src/store/appointmentStore";
import { useAuthStore } from "../../src/store/authStore";
import { Appointment } from "../../src/types/appointment";

function formatFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { appointments, cancelAppointment, doctorDecision, loading } =
    useAppointmentStore();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const found = appointments.find((a) => a.id === id);
    if (found) setAppointment(found);
  }, [id, appointments]);

  if (!appointment) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isPatient = user?.role === "PATIENT";
  const isDoctor = user?.role === "DOCTOR";
  const canCancel =
    isPatient &&
    (appointment.status === "REQUESTED" || appointment.status === "CONFIRMED") &&
    new Date(appointment.scheduled_start) > new Date();
  const canAccept =
    isDoctor && appointment.status === "REQUESTED";
  const canJoin =
    appointment.status === "CONFIRMED" && appointment.mode === "ONLINE";

  const handleCancel = () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAppointment(appointment.id);
              Alert.alert("Cancelled", "Appointment has been cancelled.");
            } catch {
              Alert.alert("Error", "Failed to cancel.");
            }
          },
        },
      ]
    );
  };

  const handleAccept = async () => {
    try {
      await doctorDecision(appointment.id, { action: "accept" });
      Alert.alert("Accepted", "Appointment has been confirmed.");
    } catch {
      Alert.alert("Error", "Failed to accept.");
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await svc.joinConsultation(appointment.id);
      if (res.meeting_link) {
        await Linking.openURL(res.meeting_link);
      }
    } catch (e: any) {
      Alert.alert(
        "Cannot Join",
        e?.response?.data?.detail ?? "Unable to join consultation."
      );
    } finally {
      setJoining(false);
    }
  };

  const personName = isPatient
    ? `Dr. ${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`
    : `${appointment.patient.first_name} ${appointment.patient.last_name}`;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
      </TouchableOpacity>

      {/* Status Header */}
      <View style={styles.statusHeader}>
        <StatusBadge status={appointment.status} />
        <Text style={styles.statusLabel}>
          {appointment.status === "REQUESTED"
            ? "Awaiting Confirmation"
            : appointment.status === "CONFIRMED"
            ? "Appointment Confirmed"
            : appointment.status === "CANCELLED"
            ? "Appointment Cancelled"
            : "Appointment Completed"}
        </Text>
      </View>

      {/* Person Card */}
      <View style={styles.card}>
        <View style={styles.personRow}>
          <View style={styles.avatarCircle}>
            <Ionicons
              name={isPatient ? "medkit" : "person"}
              size={28}
              color={COLORS.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.personName}>{personName}</Text>
            {isPatient && (
              <Text style={styles.personSub}>
                {appointment.doctor.specialization}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Appointment Details</Text>

        <DetailRow
          icon="calendar"
          label="Date"
          value={formatFull(appointment.scheduled_start)}
        />
        <DetailRow
          icon="time"
          label="Time"
          value={`${formatTime(appointment.scheduled_start)} – ${formatTime(
            appointment.scheduled_end
          )}`}
        />
        <DetailRow
          icon={appointment.mode === "ONLINE" ? "videocam" : "location"}
          label="Mode"
          value={appointment.mode === "ONLINE" ? "Online Consultation" : "In-Person Visit"}
        />
        {appointment.reason ? (
          <DetailRow icon="document-text" label="Reason" value={appointment.reason} />
        ) : null}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {canJoin && (
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={handleJoin}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.joinText}>Join Consultation</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {canAccept && (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={handleAccept}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.acceptText}>Accept Appointment</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={loading}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
            <Text style={styles.cancelText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
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
    marginBottom: SPACING.l,
  },
  statusHeader: {
    alignItems: "center",
    gap: SPACING.s,
    marginBottom: SPACING.l,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.m,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${COLORS.primary}14`,
    justifyContent: "center",
    alignItems: "center",
  },
  personName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  personSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.m,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.s,
    marginBottom: SPACING.m,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}0A`,
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
    marginTop: 1,
  },
  actions: {
    gap: SPACING.m,
    marginTop: SPACING.s,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    backgroundColor: COLORS.secondary,
    padding: SPACING.m,
    borderRadius: RADII.m,
  },
  joinText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    backgroundColor: COLORS.success,
    padding: SPACING.m,
    borderRadius: RADII.m,
  },
  acceptText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    backgroundColor: "#FEE2E2",
    padding: SPACING.m,
    borderRadius: RADII.m,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "600",
  },
});

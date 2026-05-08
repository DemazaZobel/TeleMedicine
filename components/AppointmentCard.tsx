import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADII, SPACING } from "../src/constants/theme";
import { Appointment } from "../src/types/appointment";
import StatusBadge from "./StatusBadge";

interface Props {
  appointment: Appointment;
  role: "PATIENT" | "DOCTOR";
  onPress?: () => void;
}

const MODE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  ONLINE: "videocam",
  IN_PERSON: "location",
};

const MODE_LABEL: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In-Person",
};

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

export default function AppointmentCard({ appointment, role, onPress }: Props) {
  const { date, time } = formatDateTime(appointment.scheduled_start);
  const endTime = formatDateTime(appointment.scheduled_end).time;

  const personName =
    role === "PATIENT"
      ? `Dr. ${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`
      : `${appointment.patient.first_name} ${appointment.patient.last_name}`;

  const personSubtitle =
    role === "PATIENT"
      ? appointment.doctor.specialization
      : "Patient";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row — Name + Status */}
      <View style={styles.topRow}>
        <View style={styles.personInfo}>
          <View style={styles.avatarCircle}>
            <Ionicons
              name={role === "PATIENT" ? "medkit" : "person"}
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {personName}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {personSubtitle}
            </Text>
          </View>
        </View>
        <StatusBadge status={appointment.status} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Row — Date/Time + Mode */}
      <View style={styles.bottomRow}>
        <View style={styles.infoChip}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.chipText}>{date}</Text>
        </View>

        <View style={styles.infoChip}>
          <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          <Text style={styles.chipText}>
            {time} – {endTime}
          </Text>
        </View>

        <View
          style={[
            styles.modeBadge,
            appointment.mode === "ONLINE"
              ? styles.modeBadgeOnline
              : styles.modeBadgeInPerson,
          ]}
        >
          <Ionicons
            name={MODE_ICON[appointment.mode] ?? "help-circle"}
            size={12}
            color={appointment.mode === "ONLINE" ? COLORS.secondary : COLORS.primary}
          />
          <Text
            style={[
              styles.modeText,
              {
                color:
                  appointment.mode === "ONLINE"
                    ? COLORS.secondary
                    : COLORS.primary,
              },
            ]}
          >
            {MODE_LABEL[appointment.mode] ?? appointment.mode}
          </Text>
        </View>
      </View>

      {/* Reason preview */}
      {appointment.reason ? (
        <Text style={styles.reason} numberOfLines={1}>
          {appointment.reason}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SPACING.s,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}14`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.s,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.s,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.s,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.primary}0A`,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADII.s,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADII.s,
  },
  modeBadgeOnline: {
    backgroundColor: `${COLORS.secondary}14`,
  },
  modeBadgeInPerson: {
    backgroundColor: `${COLORS.primary}14`,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reason: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: "italic",
    marginTop: SPACING.s,
  },
});

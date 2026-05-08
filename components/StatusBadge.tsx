import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RADII } from "../src/constants/theme";
import { AppointmentStatus } from "../src/types/appointment";

interface Props {
  status: AppointmentStatus;
  size?: "small" | "default";
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  REQUESTED: {
    label: "Requested",
    bg: "#FEF3C7",
    text: "#92400E",
    dot: "#F59E0B",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "#D1FAE5",
    text: "#065F46",
    dot: "#10B981",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "#FEE2E2",
    text: "#991B1B",
    dot: "#EF4444",
  },
  COMPLETED: {
    label: "Completed",
    bg: "#DBEAFE",
    text: "#1E40AF",
    dot: "#3B82F6",
  },
};

export default function StatusBadge({ status, size = "default" }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.REQUESTED;
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSmall,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text
        style={[
          styles.label,
          { color: config.text },
          isSmall && styles.labelSmall,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.round,
    gap: 5,
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
  labelSmall: {
    fontSize: 10,
  },
});

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADII, SPACING } from "../src/constants/theme";
import { AppNotification } from "../src/types/appointment";

interface Props {
  notification: AppNotification;
  onPress?: () => void;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  APPOINTMENT: "calendar",
  REMINDER: "alarm",
  SYSTEM: "information-circle",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationItem({ notification, onPress }: Props) {
  const icon = ICON_MAP[notification.type] ?? "notifications";

  return (
    <TouchableOpacity
      style={[styles.container, !notification.is_read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Unread dot */}
      {!notification.is_read && <View style={styles.dot} />}

      {/* Icon */}
      <View
        style={[
          styles.iconCircle,
          !notification.is_read && styles.iconCircleActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={notification.is_read ? COLORS.textMuted : COLORS.primary}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, !notification.is_read && styles.titleUnread]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.time}>{timeAgo(notification.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.m,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  unread: {
    backgroundColor: `${COLORS.primary}06`,
  },
  dot: {
    position: "absolute",
    top: SPACING.m + 2,
    left: SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.textMuted}14`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.s,
  },
  iconCircleActive: {
    backgroundColor: `${COLORS.primary}14`,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 2,
  },
  titleUnread: {
    fontWeight: "700",
  },
  body: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

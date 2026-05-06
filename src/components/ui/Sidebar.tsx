"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useMemo, useState } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useDoctorStore } from "../../store/doctor.store";
import { useTheme } from "../../theme";
import { TAB_CONFIGS } from "../../types/navigation";
import { createSidebarStyles } from "./Sidebar.styles";

interface SidebarProps {
  onNavigate?: () => void;
  onNotificationsPress?: () => void;
}

export function Sidebar({ onNavigate, onNotificationsPress }: SidebarProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createSidebarStyles(theme), [theme]);

  const router = useRouter();
  const segments = useSegments();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const userRole = user?.role ?? "PATIENT";
  const verificationStage = useDoctorStore((s) => s.verificationStage());

  const activeSegment = segments[1] || "index";

  const [hovered, setHovered] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const visibleTabs = TAB_CONFIGS.filter((tab) => {
    let isVisible = tab.roles.includes(userRole);

    if (
      userRole === "DOCTOR" &&
      verificationStage !== "APPROVED" &&
      tab.name === "wallet"
    ) {
      isVisible = false;
    }

    return isVisible;
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, isCollapsed && styles.containerCollapsed]}>

      {/* HEADER */}
      <View>
        <View style={[styles.header, isCollapsed && styles.headerCollapsed]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="medical" size={20} color={theme.colors.primary} />

            {!isCollapsed && (
              <Text style={styles.workspaceName}>MedLink</Text>
            )}
          </View>

          {/* Toggle Button */}
          <Pressable
            onPress={() => {
              LayoutAnimation.easeInEaseOut();
              setIsCollapsed(!isCollapsed);
            }}
            style={styles.toggleBtn}
          >
            <Ionicons
              name={isCollapsed ? "chevron-forward" : "chevron-back"}
              size={18}
              color={theme.colors.iconSecondary}
            />
          </Pressable>
        </View>

        {/* NAVIGATION */}
        <View style={styles.section}>
          {!isCollapsed && (
            <Text style={styles.sectionLabel}>Overview</Text>
          )}

          {visibleTabs.map((tab) => {
            const isActive = activeSegment === tab.name;

            return (
              <Pressable
                key={tab.name}
                onHoverIn={() => setHovered(tab.name)}
                onHoverOut={() => setHovered(null)}
                onPress={() => {
                  router.push(
                    `/(tabs)/${tab.name === "index" ? "" : tab.name}` as any
                  );
                  onNavigate?.();
                }}
                style={[
                  styles.item,
                  isCollapsed && styles.itemCollapsed,
                  isActive && styles.itemActive,
                  !isActive && hovered === tab.name && styles.itemHover,
                ]}
              >
                {isActive && (
                  <View style={[styles.activeBar, isCollapsed && styles.activeBarCollapsed]} />
                )}

                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={
                    isActive
                      ? theme.colors.primary
                      : theme.colors.iconSecondary
                  }
                />

                {!isCollapsed && (
                  <Text
                    style={[
                      styles.itemText,
                      isActive && styles.itemTextActive,
                    ]}
                  >
                    {tab.title}
                  </Text>
                )}

                {/* Tooltip (collapsed mode) */}
                {isCollapsed && hovered === tab.name && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{tab.title}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.item} onPress={onNotificationsPress}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={theme.colors.iconSecondary}
          />
          {!isCollapsed && (
            <Text style={styles.itemText}>Notifications</Text>
          )}
        </Pressable>

        <Pressable style={styles.item} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={20}
            color={theme.colors.iconSecondary}
          />
          {!isCollapsed && (
            <Text style={styles.itemText}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.item} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.colors.error}
          />
          {!isCollapsed && (
            <Text style={[styles.itemText, { color: theme.colors.error }]}>
              Logout
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
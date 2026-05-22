"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useDoctorStore } from "../../store/doctor.store";
import { useTheme } from "../../theme";
import { TAB_CONFIGS } from "../../types/navigation";
import { AccountSwitcher } from "./AccountSwitcher";
import { CreateLinkedPatientModal } from "./CreateLinkedPatientModal";
import { LinkExistingAccountModal } from "./LinkExistingAccountModal";

interface SidebarProps {
  onNavigate?: () => void;
  onNotificationsPress?: () => void;
}

export function Sidebar({ onNavigate, onNotificationsPress }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { theme } = useTheme();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const userRole = user?.role ?? "PATIENT";
  const verificationStage = useDoctorStore((s) => s.verificationStage());

  const activeSegment = segments[1] || "index";

  const [hovered, setHovered] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreatePatientVisible, setIsCreatePatientVisible] = useState(false);
  const [isLinkAccountVisible, setIsLinkAccountVisible] = useState(false);

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
    <View
      style={{
        backgroundColor: theme.colors.background,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
      }}
      className={cn(
        "py-6 px-4 justify-between transition-all",
        isCollapsed ? "w-16 items-center px-0" : "w-60",
      )}
    >
      {/* HEADER */}
      <View>
        <View
          className={cn(
            "flex-row items-center justify-between h-10 mb-4 px-2",
            isCollapsed && "px-0 justify-center gap-1",
          )}
        >
          <View className="flex-row items-center">
            <Ionicons name="medical" size={20} className="text-primary" />

            {!isCollapsed && (
              <Text className="ml-2 text-[15px] font-semibold text-foreground">
                MedLink
              </Text>
            )}
          </View>

          {/* Toggle Button */}
          <Pressable
            onPress={() => {
              LayoutAnimation.easeInEaseOut();
              setIsCollapsed(!isCollapsed);
            }}
            className="w-7 h-7 rounded-md items-center justify-center hover:bg-muted"
          >
            <Ionicons
              name={isCollapsed ? "chevron-forward" : "chevron-back"}
              size={18}
              className="text-muted-foreground"
            />
          </Pressable>
        </View>

        {/* NAVIGATION */}
        <View className="mt-2">
          {!isCollapsed && (
            <Text className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 px-1.5">
              Overview
            </Text>
          )}

          {visibleTabs.map((tab) => {
            const isActive = activeSegment === tab.name;
            const isHovered = hovered === tab.name;

            return (
              <Pressable
                key={tab.name}
                onHoverIn={() => setHovered(tab.name)}
                onHoverOut={() => setHovered(null)}
                onPress={() => {
                  const base = userRole === 'DOCTOR' ? '/(doctor)' : '/(tabs)';
                  router.push(`${base}/${tab.name === "index" ? "" : tab.name}` as any);
                  onNavigate?.();
                }}
                className={cn(
                  "flex-row items-center h-10 rounded-lg px-3 mb-1 relative",
                  isCollapsed && "px-0 justify-center w-10",
                  isActive && "bg-transparent",
                  !isActive && isHovered && "bg-muted",
                )}
              >
                {isActive && (
                  <View
                    className={cn(
                      "absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary",
                      isCollapsed && "left-1",
                    )}
                  />
                )}

                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  className={
                    isActive ? "text-primary" : "text-muted-foreground"
                  }
                />

                {!isCollapsed && (
                  <Text
                    className={cn(
                      "ml-2.5 text-sm font-medium text-muted-foreground",
                      isActive && "text-foreground font-semibold",
                    )}
                  >
                    {tab.title}
                  </Text>
                )}

                {/* Tooltip (collapsed mode) */}
                {isCollapsed && isHovered && (
                  <View className="absolute left-[50px] bg-popover py-1.5 px-2.5 rounded-md border border-border shadow-sm">
                    <Text className="text-xs text-popover-foreground">
                      {tab.title}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* FOOTER */}
      <View>
        {/* Account Switcher */}
        <View className="mb-2">
          <AccountSwitcher
            isCollapsed={isCollapsed}
            onCreatePatient={() => setIsCreatePatientVisible(true)}
            onLinkExisting={() => setIsLinkAccountVisible(true)}
          />
        </View>

        <View className="border-t border-border pt-3">
          <Pressable
            className="flex-row items-center h-10 rounded-lg px-3 mb-1 hover:bg-muted"
            onPress={onNotificationsPress}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              className="text-muted-foreground"
            />
            {!isCollapsed && (
              <Text className="ml-2.5 text-sm font-medium text-muted-foreground">
                Notifications
              </Text>
            )}
          </Pressable>

          <Pressable
            className="flex-row items-center h-10 rounded-lg px-3 mb-1 hover:bg-muted"
            onPress={toggleTheme}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={20}
              className="text-muted-foreground"
            />
            {!isCollapsed && (
              <Text className="ml-2.5 text-sm font-medium text-muted-foreground">
                {isDark ? "Light Mode" : "Dark Mode"}
              </Text>
            )}
          </Pressable>

          <Pressable
            className="flex-row items-center h-10 rounded-lg px-3 mb-1 hover:bg-destructive/10"
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              className="text-destructive"
            />
            {!isCollapsed && (
              <Text className="ml-2.5 text-sm font-medium text-destructive">
                Logout
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Create Patient Modal */}
      <CreateLinkedPatientModal
        visible={isCreatePatientVisible}
        onClose={() => setIsCreatePatientVisible(false)}
      />
      {/* Link Existing Account Modal */}
      <LinkExistingAccountModal
        visible={isLinkAccountVisible}
        onClose={() => setIsLinkAccountVisible(false)}
      />
    </View>
  );
}

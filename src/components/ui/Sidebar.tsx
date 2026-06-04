"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import { Image, LayoutAnimation, Pressable, Text, View } from "react-native";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useDoctorStore } from "../../store/doctor.store";
import { useTheme } from "../../theme";
import { TAB_CONFIGS } from "../../types/navigation";
import { AccountSwitcher } from "./AccountSwitcher";
import { CreateLinkedPatientModal } from "./CreateLinkedPatientModal";
import { LinkExistingAccountModal } from "./LinkExistingAccountModal";
import { useTranslation } from "../../i18n";
import { setItemAsync } from "../../services/storage";
import { authService } from "../../features/auth/services/authService";

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
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setUser = useAuthStore((s) => s.setUser);
  const { t, i18n } = useTranslation();

  const activeLang = (i18n.language || 'en').startsWith('am') ? 'am' : 'en';

  const handleLanguageToggle = () => {
    const nextLang = activeLang === 'en' ? 'am' : 'en';
    i18n.changeLanguage(nextLang);
    setItemAsync('preferred_language', nextLang);
    if (user) {
      authService.updateProfile({ preferred_language: nextLang })
        .then((profileData) => {
          const existingUser = useAuthStore.getState().user;
          if (existingUser) {
            setUser({ ...existingUser, ...profileData, role: existingUser.role });
          }
        })
        .catch((err) => {
          console.warn("Failed to sync language preference from sidebar:", err);
        });
    }
  };

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
        "py-6 justify-between transition-all",
        isCollapsed ? "w-16 items-center px-0" : "w-60 px-4",
      )}
    >
      {/* HEADER */}
      <View className="w-full">
        <View
          className={cn(
            "mb-4 px-2",
            isCollapsed ? "flex-col items-center gap-3 mb-6" : "flex-row items-center justify-between h-10"
          )}
        >
          <View className="flex-row items-center">
            {isCollapsed ? (
              <View style={{ width: 32, height: 32, overflow: "hidden", borderRadius: 6 }}>
                <Image
                  source={require("../../../assets/images/logo.png")}
                  style={{ width: 107, height: 32 }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <Image
                source={require("../../../assets/images/logo.png")}
                style={{ width: 120, height: 36 }}
                resizeMode="contain"
              />
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
        <View className={cn("mt-2", isCollapsed && "items-center w-full")}>
          {!isCollapsed && (
            <Text className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 px-1.5">
              Overview
            </Text>
          )}

          {visibleTabs.map((tab) => {
            const isActive = activeSegment === tab.name;
            const isHovered = hovered === tab.name;

            const translatedTitle = (() => {
              switch (tab.name) {
                case 'index': return t('common:home');
                case 'appointments': return t('common:appointments');
                case 'health': return t('common:health');
                case 'chat': return t('common:chat');
                case 'availability': return t('common:availability');
                case 'patients': return t('common:patientsTab');
                case 'wallet': return t('common:wallet');
                case 'profile': return t('common:profile');
                default: return tab.title;
              }
            })();

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
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                />

                {!isCollapsed && (
                  <Text
                    style={{ color: isActive ? theme.colors.text : theme.colors.textSecondary }}
                    className={cn(
                      "ml-2.5 text-sm font-medium",
                      isActive && "font-semibold",
                    )}
                  >
                    {translatedTitle}
                  </Text>
                )}

                {/* Tooltip (collapsed mode) */}
                {isCollapsed && isHovered && (
                  <View
                    style={{
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.border,
                    }}
                    className="absolute left-[50px] py-1.5 px-2.5 rounded-md border shadow-sm"
                  >
                    <Text
                      style={{ color: theme.colors.text }}
                      className="text-xs font-medium"
                    >
                      {translatedTitle}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* FOOTER */}
      <View className={cn(isCollapsed && "items-center w-full")}>

        {/* Account Switcher */}
        <View className="mb-2 w-full">
          <AccountSwitcher
            isCollapsed={isCollapsed}
            onCreatePatient={() => setIsCreatePatientVisible(true)}
            onLinkExisting={() => setIsLinkAccountVisible(true)}
          />
        </View>

        <View className={cn("border-t border-border pt-3 w-full", isCollapsed && "items-center")}>
          <Pressable
            className={cn(
              "flex-row items-center h-10 rounded-lg px-3 mb-1 hover:bg-muted",
              isCollapsed && "px-0 justify-center w-10"
            )}
            onPress={onNotificationsPress}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            {!isCollapsed && (
              <Text
                style={{ color: theme.colors.textSecondary }}
                className="ml-2.5 text-sm font-medium"
              >
                Notifications
              </Text>
            )}
          </Pressable>

          <Pressable
            className={cn(
              "flex-row items-center h-10 rounded-lg px-3 mb-1 hover:bg-muted",
              isCollapsed && "px-0 justify-center w-10"
            )}
            onPress={toggleTheme}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={20}
              color={theme.colors.textSecondary}
            />
            {!isCollapsed && (
              <Text
                style={{ color: theme.colors.textSecondary }}
                className="ml-2.5 text-sm font-medium"
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </Text>
            )}
          </Pressable>

          <Pressable
            className={cn(
              "flex-row items-center h-10 rounded-lg px-3 mb-1 hover:bg-muted relative",
              isCollapsed && "px-0 justify-center w-10"
            )}
            onHoverIn={() => setHovered("language")}
            onHoverOut={() => setHovered(null)}
            onPress={handleLanguageToggle}
          >
            <Ionicons
              name="language-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            {!isCollapsed && (
              <Text
                style={{ color: theme.colors.textSecondary }}
                className="ml-2.5 text-sm font-medium"
              >
                {activeLang === 'en' ? 'አማርኛ (Amharic)' : 'English'}
              </Text>
            )}
            {isCollapsed && hovered === "language" && (
              <View
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                }}
                className="absolute left-[50px] py-1.5 px-2.5 rounded-md border shadow-sm z-50"
              >
                <Text
                  style={{ color: theme.colors.text }}
                  className="text-xs font-medium"
                >
                  {activeLang === 'en' ? 'አማርኛ' : 'English'}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            className={cn(
              "flex-row items-center h-10 rounded-lg px-3 mb-1 hover:bg-destructive/10",
              isCollapsed && "px-0 justify-center w-10"
            )}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.danger}
            />
            {!isCollapsed && (
              <Text
                style={{ color: theme.colors.danger }}
                className="ml-2.5 text-sm font-medium"
              >
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

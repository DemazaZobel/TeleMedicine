"use client";

import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from '../../i18n';
import { useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useDiscoveryStore } from "../../store/discovery.store";
import { useDoctorStore } from "../../store/doctor.store";
import { useTheme } from "../../theme";
import { TAB_CONFIGS } from "../../types/navigation";
import { setItemAsync } from "../../services/storage";
import { authService } from "../../features/auth/services/authService";

interface NavbarProps {
  onNavigate?: () => void;
  onNotificationsPress?: () => void;
}

export function Navbar({ onNavigate, onNotificationsPress }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setUser = useAuthStore((s) => s.setUser);
  const setSearchQuery = useDiscoveryStore((s) => s.setSearchQuery);

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
          console.warn("Failed to sync language preference from navbar:", err);
        });
    }
  };

  const userRole = user?.role ?? "PATIENT";
  const verificationStage = useDoctorStore((s) => s.verificationStage());

  const activeSegment = segments[1] || "index";
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const handleSearchSubmit = () => {
    setSearchQuery(search);
    const base = userRole === 'DOCTOR' ? '/(doctor)' : '/(tabs)';
    router.push(base as any);
    onNavigate?.();
  };

  return (
    <View className="bg-background border-b border-border px-6 h-14 flex-row items-center justify-between w-full">

      {/* LEFT: Logo */}
      <View className="flex-row items-center">
        <Image
          source={require('../../../assets/images/logo.png')}
          style={{ width: 120, height: 36 }}
          resizeMode="contain"
        />
      </View>

      {/* CENTER: Nav Tabs */}
      <View className="flex-row items-center gap-1">
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
                "flex-row items-center h-9 rounded-lg px-3 gap-2 relative",
                isActive && "bg-primary/10",
                !isActive && isHovered && "bg-muted"
              )}
            >
              {/* Active underline indicator */}
              {isActive && (
                <View className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary" />
              )}

              <Ionicons
                name={tab.icon as any}
                size={17}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <Text
                className={cn(
                  "text-sm font-medium text-muted-foreground",
                  isActive && "text-primary font-semibold"
                )}
              >
                {translatedTitle}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search */}
      <View className="w-72 h-9 rounded-lg border border-border bg-card px-3 flex-row items-center gap-2">
        <Ionicons name="search-outline" size={16} className="text-muted-foreground" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          placeholder={t("patient:searchPlaceholderSimple")}
          placeholderTextColor="#9ca3af"
          className="flex-1 text-sm text-foreground"
          returnKeyType="search"
        />
      </View>

      {/* RIGHT: Actions */}
      <View className="flex-row items-center gap-1">
        {/* Notifications */}
        <Pressable
          onPress={onNotificationsPress}
          className="w-9 h-9 rounded-lg items-center justify-center hover:bg-muted"
        >
          <Ionicons name="notifications-outline" size={19} className="text-muted-foreground" />
        </Pressable>

        {/* Theme toggle */}
        <Pressable
          onPress={toggleTheme}
          className="w-9 h-9 rounded-lg items-center justify-center hover:bg-muted"
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={19}
            className="text-muted-foreground"
          />
        </Pressable>

        {/* Language toggle */}
        <Pressable
          onPress={handleLanguageToggle}
          className="w-9 h-9 rounded-lg items-center justify-center hover:bg-muted"
        >
          <Ionicons
            name="language-outline"
            size={19}
            className="text-muted-foreground"
          />
        </Pressable>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center h-9 rounded-lg px-3 gap-2 hover:bg-destructive/10"
        >
          <Ionicons name="log-out-outline" size={19} className="text-destructive" />
          <Text className="text-sm font-medium text-destructive">{t("auth:logoutBtn")}</Text>
        </Pressable>
      </View>

    </View>
  );
}
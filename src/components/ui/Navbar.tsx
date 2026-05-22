"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useDiscoveryStore } from "../../store/discovery.store";
import { useDoctorStore } from "../../store/doctor.store";
import { useTheme } from "../../theme";
import { TAB_CONFIGS } from "../../types/navigation";

interface NavbarProps {
  onNavigate?: () => void;
  onNotificationsPress?: () => void;
}

export function Navbar({ onNavigate, onNotificationsPress }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setSearchQuery = useDiscoveryStore((s) => s.setSearchQuery);

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
      <View className="flex-row items-center gap-2">
        <Ionicons name="medical" size={20} className="text-primary" />
        <Text className="text-[15px] font-semibold text-foreground">MedLink</Text>
      </View>

      {/* CENTER: Nav Tabs */}
      <View className="flex-row items-center gap-1">
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
                {tab.title}
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
          placeholder="Search doctors..."
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

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center h-9 rounded-lg px-3 gap-2 hover:bg-destructive/10"
        >
          <Ionicons name="log-out-outline" size={19} className="text-destructive" />
          <Text className="text-sm font-medium text-destructive">Logout</Text>
        </Pressable>
      </View>

    </View>
  );
}
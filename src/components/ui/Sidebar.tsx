import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from '../../theme';
import { createSidebarStyles } from './Sidebar.styles';
import { useAuthStore } from '../../store/authStore';
import { useDoctorStore } from '../../store/doctor.store';
import { TAB_CONFIGS } from '../../types/navigation';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createSidebarStyles(theme), [theme]);
  const router = useRouter();
  const segments = useSegments();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const userRole = user?.role ?? 'PATIENT';
  const verificationStage = useDoctorStore((s) => s.verificationStage());

  const activeSegment = segments[1] || 'index';

  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.header}>
          <Ionicons name="medical" size={32} color={theme.colors.primary} />
          <Text style={styles.logoText}>MedLink</Text>
        </View>

        {TAB_CONFIGS.map((tab) => {
          let isTabVisible = tab.roles.includes(userRole);
          
          if (userRole === 'DOCTOR' && verificationStage !== 'APPROVED' && tab.name === 'wallet') {
            isTabVisible = false;
          }

          if (!isTabVisible) return null;

          const isActive = activeSegment === tab.name;
          const isHovered = hoveredTab === tab.name;

          return (
            <Pressable
              key={tab.name}
              style={[
                styles.navItem,
                isActive && styles.navItemActive,
                !isActive && isHovered && styles.navItemHover,
              ]}
              onHoverIn={() => setHoveredTab(tab.name)}
              onHoverOut={() => setHoveredTab(null)}
              onPress={() => {
                router.push(`/(tabs)/${tab.name === 'index' ? '' : tab.name}` as any);
                onNavigate?.();
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={isActive ? theme.colors.primaryDark : theme.colors.iconSecondary}
              />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={styles.navItem} 
          onPress={() => toggleTheme()}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={22}
            color={theme.colors.iconSecondary}
          />
          <Text style={styles.navText}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </Text>
        </Pressable>

        <Pressable 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={theme.colors.error}
          />
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme, Theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  theme: Theme;
}

function MenuItem({ icon, label, onPress, rightElement, destructive, theme }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
      }}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: destructive
            ? theme.colors.errorLight
            : theme.colors.primaryLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: '500',
          color: destructive ? theme.colors.error : theme.colors.text,
        }}
      >
        {label}
      </Text>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const initials = `${user?.first_name?.[0] ?? 'U'}${user?.last_name?.[0] ?? ''}`;

  return (
    <ScreenContainer scrollable>
      {/* ── Avatar Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => router.push('/settings/edit-profile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          {/* Edit badge */}
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={13} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>
          {user?.first_name ?? 'User'} {user?.last_name ?? ''}
        </Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Menu Items ── */}
      <View style={styles.menuSection}>
        <MenuItem
          icon="person-outline"
          label="Edit Profile"
          onPress={() => router.push('/settings/edit-profile')}
          theme={theme}
        />
        <MenuItem
          icon="lock-closed-outline"
          label="Change Password"
          onPress={() => router.push('/settings/change-password')}
          theme={theme}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.menuSection}>
        <MenuItem
          icon="moon-outline"
          label="Dark Mode"
          theme={theme}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.disabled,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help Center"
          theme={theme}
          onPress={() => {}}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.menuSection}>
        <MenuItem
          icon="log-out-outline"
          label="Log Out"
          onPress={logout}
          destructive
          theme={theme}
        />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      paddingTop: theme.spacing['4xl'],
      paddingBottom: theme.spacing['2xl'],
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: theme.spacing.lg,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.disabled,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    editBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
    },
    email: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginHorizontal: 20,
    },
    menuSection: {
      paddingVertical: 4,
    },
  });

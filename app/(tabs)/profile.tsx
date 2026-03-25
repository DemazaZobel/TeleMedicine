import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Card, Button } from '../../src/components/ui';
import { useTheme, Theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch live profile from backend on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Profile</Text>

      <Card style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0] ?? 'U'}
            {user?.last_name?.[0] ?? ''}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.first_name ?? 'User'} {user?.last_name ?? ''}
        </Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'PATIENT'}</Text>
        </View>
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Account</Text>
        <Button
          title="Edit Profile"
          variant="outline"
          onPress={() => router.push('/settings/edit-profile')}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />
        <Button
          title="Change Password"
          variant="outline"
          onPress={() => router.push('/settings/change-password')}
          fullWidth
        />
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Button
            title={isDark ? 'On' : 'Off'}
            variant="outline"
            size="sm"
            onPress={toggleTheme}
          />
        </View>
      </Card>

      <Button
        title="Sign Out"
        variant="outline"
        onPress={logout}
        fullWidth
        style={styles.logoutButton}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      paddingTop: theme.spacing['3xl'],
      marginBottom: theme.spacing.xl,
      fontWeight: '700',
    },
    profileCard: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatarText: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
    },
    name: {
      ...theme.typography.h4,
      color: theme.colors.text,
    },
    email: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    roleBadge: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      marginTop: theme.spacing.md,
    },
    roleText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    settingsCard: {
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      fontWeight: '600',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLabel: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    logoutButton: {
      marginBottom: theme.spacing['4xl'],
    },
  });


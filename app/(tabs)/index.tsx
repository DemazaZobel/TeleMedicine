import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, Card, Button } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';

export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Guard for unverified doctors
  if (user?.role === 'DOCTOR' && !isVerified) {
    return <PendingApproval />;
  }

  const greeting = user
    ? `Welcome, ${user.first_name}!`
    : 'Welcome to MedLink!';

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>
          {user?.role === 'DOCTOR'
            ? 'Manage your patients and appointments'
            : 'Book appointments and manage your health'}
        </Text>
      </View>

      <Card style={styles.quickActionCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Button
            title="Book Appointment"
            size="sm"
            onPress={() => {}}
          />
          <Button
            title={isDark ? '☀️ Light' : '🌙 Dark'}
            variant="outline"
            size="sm"
            onPress={toggleTheme}
          />
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Dashboard</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      paddingTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing.xl,
    },
    greeting: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    quickActionCard: {
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    statsCard: {
      marginBottom: theme.spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      ...theme.typography.h3,
      color: theme.colors.primary,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.divider,
    },
  });

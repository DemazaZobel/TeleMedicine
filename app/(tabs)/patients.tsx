import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';
import { useTheme, Theme } from '../../src/theme';

/** Doctor-only tab — hidden for PATIENT and ADMIN roles via the tabs layout. */
export default function PatientsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDoctor = useAuthStore((s) => s.user?.role === 'DOCTOR');
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());

  if (isDoctor && !isVerified) {
    return <PendingApproval />;
  }

  return (
    <ScreenContainer centered>
      <View style={styles.emptyState}>
        <Text style={styles.title}>Your Patients</Text>
        <Text style={styles.subtitle}>
          Patient list will appear here once you have appointments.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing['3xl'],
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  });


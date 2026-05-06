import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenContainer, PageHeader } from '../../src/components/ui';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/booking.store';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';

/** Doctor-only tab — hidden for PATIENT and ADMIN roles via the tabs layout. */
export default function PatientsScreen() {
  const isDoctor = useAuthStore((s) => s.user?.role === 'DOCTOR');
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { appointments, isLoading, fetchMyAppointments } = useBookingStore();

  useEffect(() => {
    if (isDoctor && isVerified) {
      fetchMyAppointments();
    }
  }, [isDoctor, isVerified, fetchMyAppointments]);

  const uniquePatients = useMemo(() => {
    const map = new Map();
    appointments.forEach(app => {
      if (app.patient && !map.has(app.patient.id)) {
        map.set(app.patient.id, app.patient);
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  if (isDoctor && !isVerified) {
    return <PendingApproval />;
  }

  const renderPatient = ({ item }: { item: any }) => {
    const initials = `${item.user.first_name?.[0] || ''}${item.user.last_name?.[0] || ''}`;
    return (
      <Card style={styles.patientCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.user.first_name} {item.user.last_name}</Text>
          <Text style={styles.email}>{item.user.email}</Text>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.pageWrapper}>
        <PageHeader 
          title="Your Patients"
          subtitle="View and manage patients you have consulted with"
        />

        {isLoading && uniquePatients.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={uniquePatients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPatient}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No Patients Yet"
                description="Patients will appear here once they book appointments with you."
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  pageWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    ...theme.typography.h4,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
  },
});


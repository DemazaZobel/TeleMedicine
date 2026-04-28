import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { ScreenContainer, EmptyState } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { AppointmentCard } from '../../src/features/booking/components/AppointmentCard';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';
import { useBookingStore } from '../../src/store/booking.store';
import { useTheme } from '../../src/theme';
import type { Theme } from '../../src/theme';

export default function AppointmentsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === 'DOCTOR';
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  
  const { 
    appointments, 
    isLoading, 
    fetchMyAppointments, 
    cancelAppointment, 
    doctorDecision 
  } = useBookingStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Basic initial fetch
    if (!isDoctor || (isDoctor && isVerified)) {
      fetchMyAppointments();
    }
  }, [isDoctor, isVerified]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyAppointments();
    setRefreshing(false);
  };

  const handleCancel = (id: string | number) => {
    Alert.alert(
      "Cancel Appointment", 
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive", 
          onPress: async () => {
            try {
              await cancelAppointment(id);
            } catch (err) {
              Alert.alert("Error", "Could not cancel appointment.");
            }
          }
        }
      ]
    );
  };

  const handleAccept = async (id: string | number) => {
    try {
      await doctorDecision(id, { action: 'accept' });
      Alert.alert("Success", "Appointment accepted.");
    } catch (err) {
      Alert.alert("Error", "Could not accept appointment.");
    }
  };

  if (isDoctor && !isVerified) {
    return <PendingApproval />;
  }

  const renderEmpty = () => {
    if (isLoading && !refreshing) return null;
    return (
      <EmptyState
        icon="calendar-outline"
        title="No Appointments"
        description="You don't have any upcoming appointments scheduled."
      />
    );
  };

  const { width } = useWindowDimensions();
  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.pageWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>
            {isDoctor ? "Manage your schedule" : "View your upcoming sessions"}
          </Text>
        </View>

        {isLoading && !refreshing && appointments.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            key={`grid-${numColumns}`}
            data={appointments}
            numColumns={numColumns}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={{ flex: 1, maxWidth: `${100 / numColumns}%`, paddingRight: numColumns > 1 ? theme.spacing.md : 0 }}>
                <AppointmentCard 
                  appointment={item} 
                  isDoctor={isDoctor} 
                  onCancel={handleCancel}
                  onAccept={isDoctor ? handleAccept : undefined}
                />
              </View>
            )}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pageWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: 1100,
      alignSelf: 'center',
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['2xl'],
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    listContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: 100, // accommodate tab bar
      paddingTop: theme.spacing.md,
      flexGrow: 1,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

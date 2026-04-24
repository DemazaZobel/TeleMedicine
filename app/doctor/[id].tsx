import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ScreenContainer } from '../../src/components/ui';
import { BookingModal } from '../../src/features/booking/components/BookingModal';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import { Theme, useTheme } from '../../src/theme';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isWeb = Platform.OS === 'web';

  const doctors = useDiscoveryStore((s) => s.doctors);
  const doctor = doctors.find((d) => d.id === id);

  const [bookingVisible, setBookingVisible] = useState(false);

  return (
    <ScreenContainer scrollable>
      <Stack.Screen options={{ title: 'Doctor Profile' }} />
      <View style={styles.wrapper}>
        {/* Web-only breadcrumb back link */}
        {isWeb && (
          <Pressable
            onPress={() => router.push('/(tabs)' as any)}
            style={styles.breadcrumb}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
            <Text style={styles.breadcrumbText}>Back to Directory</Text>
          </Pressable>
        )}

        <Card style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>👨‍⚕️</Text>
          </View>
          <Text style={styles.name}>
            {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Doctor Profile'}
          </Text>
          {doctor && (
            <Text style={styles.specialization}>{doctor.specialization}</Text>
          )}

          {doctor && (
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={styles.statValue}>{doctor.average_rating}</Text>
                <Text style={styles.statLabel}>Rating ({doctor.review_count})</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.statValue}>{doctor.years_of_experience} yrs</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="cash-outline" size={16} color="#10B981" />
                <Text style={styles.statValue}>${doctor.consultation_fee}</Text>
                <Text style={styles.statLabel}>Fee</Text>
              </View>
            </View>
          )}

          {doctor?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.background} />
              <Text style={styles.verifiedText}>Verified Provider</Text>
            </View>
          )}

          {!doctor && <Text style={styles.id}>ID: {id}</Text>}
        </Card>

        <Button
          title="Book Appointment"
          onPress={() => setBookingVisible(true)}
          fullWidth
          style={styles.bookButton}
          disabled={!doctor}
        />
      </View>

      <BookingModal
        visible={bookingVisible}
        doctorId={id}
        onClose={() => setBookingVisible(false)}
        onSuccess={() => {
          setBookingVisible(false);
          router.replace('/(tabs)/appointments');
        }}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing['4xl'],
    },
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.xs,
    },
    breadcrumbText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    profileCard: {
      alignItems: 'center',
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    avatarText: {
      fontSize: 40,
    },
    name: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    specialization: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.xl,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingVertical: theme.spacing.lg,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
    },
    statBox: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      gap: 4,
      marginBottom: theme.spacing.lg,
    },
    verifiedText: {
      ...theme.typography.caption,
      color: theme.colors.background,
      fontWeight: '600',
    },
    id: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    bookButton: {
      marginTop: theme.spacing['2xl'],
    },
  });

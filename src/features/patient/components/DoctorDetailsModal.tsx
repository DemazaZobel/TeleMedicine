import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Platform, ScrollView, Linking } from 'react-native';
import { Button, ModalBase, StarRating } from '../../../components/ui';
import { BookingModal } from '../../booking/components/BookingModal';
import { Theme, useTheme } from '../../../theme';
import type { ProviderSearchResult } from '../../doctor/types/doctor.types';
import { useRouter } from 'expo-router';
import { useBookingStore } from '../../../store/booking.store';

interface DoctorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  doctor: ProviderSearchResult | null;
}

export function DoctorDetailsModal({ visible, onClose, doctor }: DoctorDetailsModalProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const router = useRouter();
  const { appointments } = useBookingStore();

  const [bookingVisible, setBookingVisible] = useState(false);

  const activeAppointment = useMemo(() => {
    if (!doctor) return null;
    return appointments.find((a) => {
      const docId = String(a.doctor?.id || a.doctor);
      const matchId = docId === String(doctor.id) || docId === String(doctor.user_id);
      const matchStatus = ['requested', 'confirmed', 'pending'].includes(a.status?.toLowerCase() || '');
      return matchId && matchStatus;
    });
  }, [appointments, doctor]);

  if (!doctor) return null;

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Doctor Profile"
      maxWidth={500}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👨‍⚕️</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              Dr. {doctor.first_name} {doctor.last_name}
            </Text>
            {doctor.is_verified && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            )}
          </View>
          <Text style={styles.specialization}>{doctor.specialization}</Text>

          {(doctor.youtube_link || doctor.linkedin_link) && (
            <View style={styles.socialRow}>
              {doctor.youtube_link && (
                <Button
                  title="YouTube"
                  variant="outline"
                  size="sm"
                  icon={<Ionicons name="logo-youtube" size={16} color="#FF0000" style={{ marginRight: 6 }} />}
                  onPress={() => Linking.openURL(doctor.youtube_link!)}
                  style={[styles.socialBtn, { borderColor: '#FF0000' }]}
                  textStyle={{ color: '#FF0000' }}
                />
              )}
              {doctor.linkedin_link && (
                <Button
                  title="LinkedIn"
                  variant="outline"
                  size="sm"
                  icon={<Ionicons name="logo-linkedin" size={16} color="#0077B5" style={{ marginRight: 6 }} />}
                  onPress={() => Linking.openURL(doctor.linkedin_link!)}
                  style={[styles.socialBtn, { borderColor: '#0077B5' }]}
                  textStyle={{ color: '#0077B5' }}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <StarRating rating={Number(doctor.average_rating) || 0} size={20} />
            <Text style={styles.statLabel}>Rating ({doctor.review_count})</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.statValue}>{doctor.years_of_experience} yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
            <Text style={styles.statValue}>Br {doctor.consultation_fee}</Text>
            <Text style={styles.statLabel}>Fee</Text>
          </View>
        </View>

        {doctor.is_verified && (
          <View style={styles.verifiedAlert}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
            <View style={styles.verifiedAlertText}>
              <Text style={styles.verifiedAlertTitle}>Verified Provider</Text>
              <Text style={styles.verifiedAlertSub}>This doctor's credentials have been verified by our team.</Text>
            </View>
          </View>
        )}

        {activeAppointment ? (
          <View style={styles.activeAppointmentAlert}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <View style={styles.activeAppointmentText}>
              <Text style={styles.activeAppointmentTitle}>Upcoming Appointment</Text>
              <Text style={styles.activeAppointmentSub}>You already have an active appointment scheduled with this doctor.</Text>
            </View>
            <Button
              title="View"
              variant="outline"
              onPress={() => {
                onClose();
                router.push('/(tabs)/appointments');
              }}
              style={{ paddingHorizontal: 16 }}
            />
          </View>
        ) : (
          <Button
            title="Book Appointment"
            onPress={() => setBookingVisible(true)}
            fullWidth
            style={styles.bookButton}
          />
        )}
      </ScrollView>

      <BookingModal
        visible={bookingVisible}
        doctorId={doctor.id}
        onClose={() => setBookingVisible(false)}
        onSuccess={() => {
          setBookingVisible(false);
          onClose();
          router.replace('/(tabs)/appointments');
        }}
      />
    </ModalBase>
  );
}

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    content: {
      paddingBottom: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primaryLight + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    avatarText: {
      fontSize: 48,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    name: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
    },
    specialization: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 16,
    },
    socialRow: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'center',
    },
    socialBtn: {
      backgroundColor: 'transparent',
      borderRadius: 100,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 24,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
      marginTop: 8,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    verifiedAlert: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary + '10',
      borderWidth: 1,
      borderColor: theme.colors.primary + '25',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      marginBottom: 24,
      gap: 16,
    },
    verifiedAlertText: {
      flex: 1,
    },
    verifiedAlertTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    verifiedAlertSub: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    activeAppointmentAlert: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
      ...theme.shadows.sm,
    },
    activeAppointmentText: {
      flex: 1,
    },
    activeAppointmentTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    activeAppointmentSub: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    bookButton: {
      height: 56,
      borderRadius: 16,
    },
  });

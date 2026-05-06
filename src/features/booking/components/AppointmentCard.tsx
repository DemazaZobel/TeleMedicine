import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui';
import { useBookingStore } from '../../../store/booking.store';
import { useDiscoveryStore } from '../../../store/discovery.store';
import type { Theme } from '../../../theme';
import { useTheme } from '../../../theme';
import type { AppointmentDetail } from '../types/bookingTypes';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { RescheduleModal } from './RescheduleModal';

interface AppointmentCardProps {
  appointment: AppointmentDetail;
  isDoctor: boolean;
  onCancel?: (id: string | number, reason: string) => void;
  onAccept?: (id: string | number) => void;
}

export function AppointmentCard({ appointment, isDoctor, onCancel, onAccept }: AppointmentCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { doctorDecision, requestReschedule, isLoading, cancelAppointment } = useBookingStore();
  const { doctors } = useDiscoveryStore();

  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);

  const start = new Date(appointment.scheduled_start);
  const end = new Date(appointment.scheduled_end);

  const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const getStatus = () => {
    const status = appointment.status?.toUpperCase() || 'UNKNOWN';
    const map: Record<string, { label: string; color: string }> = {
      CONFIRMED: {
        label: appointment.payment_status === 'paid' ? 'Confirmed' : 'Unpaid',
        color: appointment.payment_status === 'paid' ? theme.colors.success : theme.colors.warning
      },
      REQUESTED: { label: 'Pending', color: theme.colors.textTertiary }, // Neutral for pending
      COMPLETED: { label: 'Completed', color: theme.colors.primary },
      CANCELLED: { label: 'Cancelled', color: theme.colors.error },
    };
    return map[status] || { label: status, color: theme.colors.textSecondary };
  };
  const { label: statusLabel, color: statusColor } = getStatus();

  // Name Logic using flat fields from API
  const a = appointment as any;
  const patientName = `${a.patient_first_name || ''} ${a.patient_last_name || ''}`.trim() || 'Patient';
  const doctorName = `${a.doctor_first_name || ''} ${a.doctor_last_name || ''}`.trim();
  const formattedDoctorName = doctorName ? `Dr. ${doctorName}` : 'Doctor';

  const displayName = isDoctor ? patientName : formattedDoctorName;

  const handleJoin = async () => {
    if (appointment.meeting_link) {
      await WebBrowser.openBrowserAsync(appointment.meeting_link);
    } else {
      Alert.alert('Not Available', 'Meeting link is not available yet.');
    }
  };

  const handlePay = async () => {
    try {
      const { fetchPaymentMethods, initiatePayment } = useBookingStore.getState();
      await fetchPaymentMethods();
      const { paymentMethods, error: storeError } = useBookingStore.getState();

      let methodToUse = paymentMethods.find(m => m.is_verified) || paymentMethods[0];
      if (!methodToUse) {
        Alert.alert('No Payment Method', 'Please add a payment method in your profile settings first.');
        return;
      }

      const checkoutUrl = await initiatePayment(appointment.id, methodToUse.id);
      await WebBrowser.openBrowserAsync(checkoutUrl);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate payment.');
    }
  };

  const handleProposeConfirm = async (payload: any) => {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      if (isDoctor) {
        await doctorDecision(appointment.id, { action: 'propose_change', ...payload, expires_at: expiresAt });
      } else {
        await requestReschedule(appointment.id, { ...payload, expires_at: expiresAt });
      }
      setRescheduleVisible(false);
      Alert.alert('Success', 'Reschedule request sent.');
    } catch (error) { }
  };

  const handleConfirmCancel = async (reason: string) => {
    try {
      await cancelAppointment(appointment.id, { reason });
      setCancelVisible(false);
      Alert.alert('Success', 'Appointment cancelled.');
    } catch (err) { }
  };

  const handleComplete = async () => {
    try {
      const { completeAppointment } = useBookingStore.getState();
      await completeAppointment(appointment.id);
      Alert.alert('Success', 'Consultation completed.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.meta}>
                {appointment.mode === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* TIME */}
        <View style={styles.timeCard}>
          <Text style={styles.time}>{timeStr}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* REASON (Fixed height to ensure alignment) */}
        <View style={styles.reasonBlock}>
          <Text style={styles.reasonLabel}>REASON</Text>
          <Text style={styles.reason} numberOfLines={2}>
            {appointment.reason || "No reason provided."}
          </Text>
        </View>
      </View>

      <View style={styles.separator} />

      {/* ACTIONS */}
      <View style={styles.actions}>
        <View style={styles.secondaryActions}>
          {['REQUESTED', 'CONFIRMED'].includes(appointment.status?.toUpperCase() || '') && (
            <TouchableOpacity onPress={() => setCancelVisible(true)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {['REQUESTED', 'CONFIRMED'].includes(appointment.status?.toUpperCase() || '') && (
            <TouchableOpacity onPress={() => setRescheduleVisible(true)}>
              <Text style={styles.rescheduleText}>Reschedule</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CTA BUTTONS */}
        <View style={styles.ctaWrapper}>
          {isDoctor && appointment.status?.toUpperCase() === 'REQUESTED' && onAccept && (
            <Button title="Accept" onPress={() => onAccept(appointment.id)} style={styles.primaryBtn} loading={isLoading} />
          )}

          {appointment.status?.toUpperCase() === 'CONFIRMED' && (
            appointment.payment_status === 'paid' ? (
              <Button title="Join" onPress={handleJoin} style={styles.primaryBtn} />
            ) : (
              !isDoctor && <Button title="Pay" onPress={handlePay} style={[styles.primaryBtn, { backgroundColor: theme.colors.warning }]} loading={isLoading} />
            )
          )}

          {isDoctor && appointment.status?.toUpperCase() === 'CONFIRMED' && appointment.payment_status === 'paid' && (
            <Button title="Complete" onPress={handleComplete} style={styles.primaryBtn} loading={isLoading} />
          )}
        </View>
      </View>

      <RescheduleModal
        visible={rescheduleVisible}
        onClose={() => setRescheduleVisible(false)}
        onConfirm={handleProposeConfirm}
        isLoading={isLoading}
      />

      <CancelAppointmentModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isLoading}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
      flex: 1,
      minHeight: 280, // Slightly increased to accommodate different reason lengths
      justifyContent: 'space-between',
      ...theme.shadows.sm,
    },
    cardBody: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      height: 40, // Stable height for header
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    avatarText: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    name: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    meta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    timeCard: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      marginBottom: 12,
      height: 70, // Stable height for time section
      justifyContent: 'center',
    },
    time: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.text,
    },
    date: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    reasonBlock: {
      marginBottom: 12,
      flex: 1, // Take remaining space to push separator down
    },
    reasonLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textTertiary,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    reason: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    actions: {
      paddingTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 50, // Stable height for actions
    },
    separator: {
      height: 1,
      backgroundColor: 'rgba(0,0,0,0.06)',
      marginHorizontal: -16,
    },
    secondaryActions: {
      flexDirection: 'row',
      gap: 16,
    },
    cancelText: {
      color: theme.colors.error,
      fontWeight: '600',
      fontSize: 13,
    },
    rescheduleText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 13,
    },
    ctaWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    primaryBtn: {
      height: 36,
      paddingHorizontal: 18,
      borderRadius: 10,
    },
  });
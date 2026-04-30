import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui';
import { useBookingStore } from '../../../store/booking.store';
import { useDiscoveryStore } from '../../../store/discovery.store';
import type { Theme } from '../../../theme';
import { useTheme } from '../../../theme';
import type { AppointmentDetail } from '../types/bookingTypes';
import { RescheduleModal } from './RescheduleModal';

interface AppointmentCardProps {
  appointment: AppointmentDetail;
  isDoctor: boolean;
  onCancel?: (id: string | number) => void;
  onAccept?: (id: string | number) => void;
}

export function AppointmentCard({ appointment, isDoctor, onCancel, onAccept }: AppointmentCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { doctorDecision, requestReschedule, respondToChangeRequest, isLoading } = useBookingStore();
  const { doctors } = useDiscoveryStore();
  const [rescheduleVisible, setRescheduleVisible] = useState(false);

  const start = new Date(appointment.scheduled_start);
  const end = new Date(appointment.scheduled_end);

  const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return theme.colors.success;
      case 'REQUESTED': return theme.colors.warning;
      case 'COMPLETED': return theme.colors.primary;
      case 'CANCELLED': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    const status = appointment.status?.toUpperCase() || 'UNKNOWN';
    if (status === 'CONFIRMED') {
      return appointment.payment_status === 'paid' ? 'Confirmed • Paid' : 'Confirmed • Unpaid';
    }
    return status;
  };

  const pat = appointment.patient as any;
  const patientName = pat?.user?.first_name
    ? `${pat.user.first_name} ${pat.user.last_name || ''}`.trim()
    : pat?.first_name
      ? `${pat.first_name} ${pat.last_name || ''}`.trim()
      : 'Patient';

  const doc = appointment.doctor as any;
  const doctorProfileId = doc?.id || doc;
  const foundDoctor = (doctors || []).find(
    d => String(d?.id) === String(doctorProfileId) || String(d?.user_id) === String(doctorProfileId)
  );

  const doctorName = doc?.user?.last_name
    ? `Dr. ${doc.user.last_name}`
    : doc?.last_name
      ? `Dr. ${doc.last_name}`
      : foundDoctor
        ? `Dr. ${foundDoctor.last_name || foundDoctor.first_name || ''}`.trim()
        : 'Doctor';

  const displayName = isDoctor ? patientName : doctorName;

  const handleJoin = async () => {
    if (appointment.meeting_link) {
      await WebBrowser.openBrowserAsync(appointment.meeting_link);
    } else {
      Alert.alert('Not Available', 'Meeting link is not available yet.');
    }
  };

  const handleProposeConfirm = async (payload: any) => {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      if (isDoctor) {
        await doctorDecision(appointment.id, {
          action: 'propose_change',
          ...payload,
          expires_at: expiresAt
        });
        Alert.alert('Success', 'Reschedule proposed to patient');
      } else {
        await requestReschedule(appointment.id, {
          ...payload,
          expires_at: expiresAt
        });
        Alert.alert('Success', 'Reschedule request sent to doctor');
      }
      setRescheduleVisible(false);
    } catch (error) { }
  };

  const handleRespondChange = async (action: 'accept' | 'reject') => {
    try {
      Alert.alert('Feature Coming', 'Direct response to change requests is being finalized.');
    } catch (error) { }
  };

  const handlePay = async () => {
    try {
      const { fetchPaymentMethods, initiatePayment } = useBookingStore.getState();
      await fetchPaymentMethods();
      const { paymentMethods, error: storeError } = useBookingStore.getState();

      if (storeError?.includes('405')) {
        Alert.alert('Backend Setup Required', 'The "List Payment Methods" endpoint (GET) is missing or not deployed on your backend.');
        return;
      }

      let methodToUse = paymentMethods.find(m => m.is_verified) || paymentMethods[0];
      if (!methodToUse) {
        Alert.alert('No Payment Method', 'Please add a payment method in your settings first.');
        return;
      }

      const checkoutUrl = await initiatePayment(appointment.id, methodToUse.id);
      await WebBrowser.openBrowserAsync(checkoutUrl);
      Alert.alert('Payment Initiated', 'Please complete payment in the browser.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate payment.');
    }
  };

  const handleComplete = async () => {
    try {
      const { completeAppointment } = useBookingStore.getState();
      await completeAppointment(appointment.id);
      Alert.alert('Success', 'Consultation completed. Funds released.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
            </View>

            <View>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.subText}>
                {appointment.mode === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}
              </Text>
            </View>
          </View>

          <View style={styles.statusPill}>
            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>

        {/* Time (PRIMARY FOCUS) */}
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{timeStr}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Reason */}
        {appointment.reason && (
          <View style={styles.reasonBlock}>
            <Text style={styles.reasonLabel}>Reason</Text>
            <Text style={styles.reason} numberOfLines={2}>
              {appointment.reason}
            </Text>
          </View>


        )}
      </View>


      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          {onCancel && ['REQUESTED', 'CONFIRMED'].includes(appointment.status?.toUpperCase()) && (
            <TouchableOpacity onPress={() => onCancel(appointment.id)} style={styles.actionBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {!isDoctor && ['REQUESTED', 'CONFIRMED'].includes(appointment.status?.toUpperCase()) && (
            <TouchableOpacity onPress={() => setRescheduleVisible(true)} style={styles.actionBtn}>
              <Text style={styles.rescheduleText}>Reschedule</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Primary CTA */}
        {appointment.status?.toUpperCase() === 'CONFIRMED' &&
          appointment.payment_status === 'paid' &&
          appointment.mode === 'ONLINE' && (
            <Button
              title="Join"
              onPress={handleJoin}
              style={styles.primaryBtn}
            />
          )}

        {!isDoctor &&
          appointment.status?.toUpperCase() === 'CONFIRMED' &&
          appointment.payment_status === 'unpaid' && (
            <Button
              title="Pay"
              onPress={handlePay}
              style={styles.primaryBtn}
              loading={isLoading}
            />
          )}
      </View>

      <RescheduleModal
        visible={rescheduleVisible}
        onClose={() => setRescheduleVisible(false)}
        onConfirm={handleProposeConfirm}
        isLoading={isLoading}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },

    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
    },

    avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    name: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
    },

    subText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },

    timeBlock: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    time: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
    },

    content: {
      flex: 1,
    },

    date: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontWeight: '500',
    },

    reasonBlock: {
      marginBottom: 20,
    },

    reasonLabel: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginBottom: 4,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    reason: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },

    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    leftActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    actionBtn: {
      paddingVertical: 8,
    },
    cancelText: {
      fontSize: 14,
      color: theme.colors.error,
      fontWeight: '600',
    },
    rescheduleText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    primaryBtn: {
      height: 44,
      paddingHorizontal: 24,
      borderRadius: theme.radius.md,
    },
  });
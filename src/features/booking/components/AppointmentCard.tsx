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
  const { doctorDecision, respondToChangeRequest, isLoading } = useBookingStore();
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
  const foundDoctor = doctors.find(
    d => String(d.id) === String(doctorProfileId) || String(d.user_id) === String(doctorProfileId)
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
      await doctorDecision(appointment.id, {
        action: 'propose_change',
        ...payload
      });
      setRescheduleVisible(false);
      Alert.alert('Success', 'Reschedule proposed to patient');
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
        {onCancel && ['REQUESTED', 'CONFIRMED'].includes(appointment.status?.toUpperCase()) && (
          <TouchableOpacity onPress={() => onCancel(appointment.id)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}

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
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border + '30',

      height: 200,
      display: 'flex',
      flexDirection: 'column',
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '12',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },

    avatarText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    name: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },

    subText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.border + '40',
    },

    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },

    timeBlock: {
      marginBottom: 12,
    },

    time: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
    },

    content: {
      flex: 1,
    },

    date: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    reasonBlock: {
      minHeight: 40,
    },

    reasonLabel: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      marginBottom: 2,
    },

    reason: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },

    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    cancelText: {
      fontSize: 13,
      color: theme.colors.textTertiary,
    },

    primaryBtn: {
      height: 36,
      paddingHorizontal: 18,
      borderRadius: 10,
    },
  });
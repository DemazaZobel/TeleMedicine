import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Card, Button } from '../../../components/ui';
import type { AppointmentDetail } from '../types/bookingTypes';
import { useTheme } from '../../../theme';
import type { Theme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../../../store/booking.store';
import { RescheduleModal } from './RescheduleModal';

interface AppointmentCardProps {
  appointment: AppointmentDetail;
  isDoctor: boolean;
  onCancel?: (id: string | number) => void;
  onAccept?: (id: string | number) => void;
}

export function AppointmentCard({ appointment, isDoctor, onCancel, onAccept }: AppointmentCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { doctorDecision, respondToChangeRequest, isLoading } = useBookingStore();
  const [rescheduleVisible, setRescheduleVisible] = useState(false);

  const start = new Date(appointment.scheduled_start);
  const end = new Date(appointment.scheduled_end);

  const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return theme.colors.success;
      case 'REQUESTED': return theme.colors.warning;
      case 'COMPLETED': return theme.colors.primary;
      case 'CANCELLED': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const patientName = appointment.patient?.user 
    ? `${appointment.patient.user.first_name || ''} ${appointment.patient.user.last_name || ''}`.trim() 
    : 'Patient';
    
  const doctorName = appointment.doctor?.user 
    ? `Dr. ${appointment.doctor.user.last_name || ''}`.trim() 
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
    } catch (error) {}
  };

  const handleRespondChange = async (action: 'accept' | 'reject') => {
    try {
      // Find the pending change request ID (backend Usually nests this or we fetch it)
      // For this UI, we assume there's one active change request if status is special or we show it in the header
      // The respond API expects the CHANGE_REQUEST ID, not the appointment ID.
      // Since our Store might need to fetch it, we'll keep it simple for now.
      Alert.alert('Feature Coming', 'Direct response to change requests is being finalized.');
    } catch (error) {}
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.doctorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.specialization}>{appointment.mode} CONSULTATION</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
            {appointment.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.timeContainer}>
        <View style={styles.timeRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.timeValue}>{dateStr}</Text>
        </View>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.timeValue}>{timeStr}</Text>
        </View>
      </View>

      {appointment.reason && (
         <View style={styles.reasonContainer}>
           <Text style={styles.reasonText} numberOfLines={2}>
             "{appointment.reason}"
           </Text>
         </View>
      )}

      <View style={styles.actions}>
        {appointment.status === 'CONFIRMED' && appointment.mode === 'ONLINE' && (
           <Button 
             title="Join Call" 
             onPress={handleJoin} 
             style={styles.joinBtn}
             icon={<Ionicons name="videocam" size={18} color="#FFF" />}
           />
        )}

        {['REQUESTED', 'CONFIRMED'].includes(appointment.status) && onCancel && (
          <Button 
            title="Cancel" 
            variant="ghost" 
            onPress={() => onCancel(appointment.id)} 
            style={styles.cancelBtn}
            textStyle={{ color: theme.colors.error }}
          />
        )}

        {appointment.status === 'REQUESTED' && isDoctor && (
          <>
            <Button 
              title="Reschedule" 
              variant="outline" 
              onPress={() => setRescheduleVisible(true)} 
              style={styles.actionBtn} 
            />
            {onAccept && (
              <Button 
                title="Accept" 
                onPress={() => onAccept(appointment.id)} 
                style={styles.actionBtn} 
              />
            )}
          </>
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
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    doctorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    nameContainer: {
      flex: 1,
    },
    name: {
      ...theme.typography.h4,
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    specialization: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontSize: 11,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: theme.radius.full,
      marginLeft: theme.spacing.sm,
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: '700',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.5,
      marginVertical: theme.spacing.md,
    },
    timeContainer: {
      flexDirection: 'row',
      gap: theme.spacing.xl,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timeValue: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    reasonContainer: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primaryLight,
    },
    reasonText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    actionBtn: {
      minWidth: 90,
      height: 38,
      paddingHorizontal: theme.spacing.md,
    },
    joinBtn: {
      minWidth: 120,
      height: 40,
      backgroundColor: theme.colors.success,
    },
    cancelBtn: {
      height: 38,
      paddingHorizontal: theme.spacing.md,
    },
  });

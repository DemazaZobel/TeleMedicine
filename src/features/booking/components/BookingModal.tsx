import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card, Button, Input } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useBookingStore } from '../../../store/booking.store';
import { useDiscoveryStore } from '../../../store/discovery.store';
import { useTheme } from '../../../theme';
import type { Theme } from '../../../theme';
import type { AppointmentMode } from '../types/bookingTypes';

interface BookingModalProps {
  visible: boolean;
  doctorId: string | number;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ visible, doctorId, onClose, onSuccess }: BookingModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { bookAppointment, fetchMyAppointments, appointments, isLoading, error } = useBookingStore();

  const [mode, setMode] = useState<AppointmentMode>('ONLINE');
  const [reason, setReason] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { doctors } = useDiscoveryStore();

  // Check if there is already an active appointment with this doctor
  const hasActiveAppointment = useMemo(() => {
    const doctor = doctors.find(d => String(d.id) === String(doctorId));
    return appointments.some((a) => {
      const docId = String(a.doctor?.id || a.doctor);
      const matchId = docId === String(doctorId) || (doctor && docId === String(doctor.user_id));
      const matchStatus = ['requested', 'confirmed', 'pending'].includes(a.status?.toLowerCase() || '');
      return matchId && matchStatus;
    });
  }, [appointments, doctorId, doctors]);

  useEffect(() => {
    if (visible) {
      setReason('');
      setMode('ONLINE');
      setSelectedIndex(0);
      fetchMyAppointments(); // Fetch latest to ensure accurate double-booking check
    }
  }, [visible, fetchMyAppointments]);

  // Generate generic future times for demo purposes
  const getMockSlots = () => {
    const slots = [];
    const base = new Date();
    base.setHours(10, 0, 0, 0);

    for (let i = 1; i <= 3; i++) {
        const start = new Date(base);
        start.setDate(base.getDate() + i);
        
        const end = new Date(start);
        end.setHours(start.getHours() + 1);

        slots.push({ start, end });
    }
    return slots;
  };

  const [slots] = useState(getMockSlots());

  const handleBook = async () => {
    if (hasActiveAppointment) {
      Alert.alert('Booking Exists', 'You already have an active appointment with this doctor.');
      return;
    }

    try {
      const selectedSlot = slots[selectedIndex];
      await bookAppointment({
        doctor_id: doctorId,
        scheduled_start: selectedSlot.start.toISOString(),
        scheduled_end: selectedSlot.end.toISOString(),
        appointment_type: mode,
        reason,
      });
      onSuccess();
    } catch {
      // Error is stored by the hook
    }
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Book Appointment"
      subtitle="Select your preferred mode and provide a reason."
    >
      <View>
        {hasActiveAppointment && (
          <View style={[styles.warningBanner, { backgroundColor: theme.colors.amber50 }]}>
            <Text style={[styles.warningText, { color: theme.colors.amber700 }]}>
              You already have a pending or confirmed appointment with this doctor.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Select Time Slot</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotScroll}>
          {slots.map((slot, index) => {
             const isActive = index === selectedIndex;
             return (
               <TouchableOpacity 
                 key={index} 
                 style={[styles.slotCard, isActive && styles.slotCardActive]}
                 onPress={() => setSelectedIndex(index)}
               >
                   <Text style={[styles.slotDate, isActive && styles.activeText]}>
                     {slot.start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                   </Text>
                   <Text style={[styles.slotTime, isActive && styles.activeText]}>
                     {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </Text>
               </TouchableOpacity>
             )
          })}
        </ScrollView>

        <Text style={styles.label}>Consultation Mode</Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity 
            style={[styles.modeButton, mode === 'ONLINE' && styles.modeButtonActive]}
            onPress={() => setMode('ONLINE')}
          >
            <Text style={[styles.modeText, mode === 'ONLINE' && styles.modeTextActive]}>Online</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, mode === 'IN_PERSON' && styles.modeButtonActive]}
            onPress={() => setMode('IN_PERSON')}
          >
            <Text style={[styles.modeText, mode === 'IN_PERSON' && styles.modeTextActive]}>In Person</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Reason for Visit"
          placeholder="E.g., Follow up, General checkup"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={3}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button 
             title="Cancel" 
             variant="outline" 
             onPress={onClose} 
             disabled={isLoading}
             style={styles.actionBtn}
          />
          <Button 
             title={isLoading ? "Booking..." : "Confirm Book"} 
             onPress={handleBook} 
             disabled={isLoading || !reason || hasActiveAppointment}
             style={styles.actionBtn}
             loading={isLoading}
          />
        </View>
      </View>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    warningBanner: {
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
    },
    warningText: {
      ...theme.typography.bodySm,
      fontWeight: '600',
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    slotScroll: {
      flexGrow: 0,
      marginBottom: theme.spacing.lg,
    },
    slotCard: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      minWidth: 120,
      alignItems: 'center',
    },
    slotCardActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    slotDate: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    slotTime: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '700',
    },
    activeText: {
      color: theme.colors.primary,
    },
    modeToggle: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    modeButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
    },
    modeButtonActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    modeText: {
      ...theme.typography.bodySm,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    modeTextActive: {
      color: theme.colors.primary,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    actionBtn: {
      flex: 1,
    },
  });

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, Input } from '../../../components/ui';
import { useBookingStore } from '../../../store/booking.store';
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
  const styles = createStyles(theme);
  const { bookAppointment, isLoading, error } = useBookingStore();

  const [mode, setMode] = useState<AppointmentMode>('ONLINE');
  const [reason, setReason] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Book Appointment</Text>
          <Text style={styles.subtitle}>Select your preferred mode and provide a reason.</Text>
          
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
               disabled={isLoading || !reason}
               style={styles.actionBtn}
               loading={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      minHeight: '60%',
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.caption,
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

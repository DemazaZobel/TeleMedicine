import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Input } from '../../../components/ui';
import { useTheme, Theme } from '../../../theme';
import type { AppointmentMode } from '../types/bookingTypes';

interface RescheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => void;
  isLoading: boolean;
}

export function RescheduleModal({ visible, onClose, onConfirm, isLoading }: RescheduleModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [mode, setMode] = useState<AppointmentMode>('ONLINE');
  const [notes, setNotes] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getMockSlots = () => {
    const slots = [];
    const base = new Date();
    base.setHours(14, 0, 0, 0); // Afternoon slots for rescheduling

    for (let i = 2; i <= 4; i++) {
        const start = new Date(base);
        start.setDate(base.getDate() + i);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);
        slots.push({ start, end });
    }
    return slots;
  };

  const [slots] = useState(getMockSlots());

  const handleConfirm = () => {
    const selectedSlot = slots[selectedIndex];
    onConfirm({
      proposed_start: selectedSlot.start.toISOString(),
      proposed_end: selectedSlot.end.toISOString(),
      proposed_mode: mode,
      notes,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Propose Reschedule</Text>
          <Text style={styles.subtitle}>Suggest a new time and mode for this appointment.</Text>

          <Text style={styles.label}>Select New Slot</Text>
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
            label="Notes for Patient"
            placeholder="Reason for rescheduling..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <View style={styles.actions}>
            <Button title="Cancel" variant="outline" onPress={onClose} disabled={isLoading} style={{ flex: 1 }} />
            <Button title="Propose" onPress={handleConfirm} loading={isLoading} disabled={isLoading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});

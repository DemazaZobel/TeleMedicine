import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Input } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
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
    base.setHours(14, 0, 0, 0); 

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
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 
    });
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Propose Reschedule"
      subtitle="Suggest a new time and mode for this appointment."
      maxWidth={500}
    >
      <View style={styles.container}>
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
          label="Reason for Change"
          placeholder="E.g., I have a conflicting meeting..."
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
    </ModalBase>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', // Center for web/desktop
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 500, // Max width for web
    ...theme.shadows.xl,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 6,
    fontWeight: '800',
  },
  subtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  slotScroll: {
    flexGrow: 0,
    marginBottom: theme.spacing.xl,
  },
  slotCard: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    minWidth: 110,
    alignItems: 'center',
  },
  slotCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginBottom: 2,
    fontWeight: '600',
  },
  slotTime: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '700',
  },
  activeText: {
    color: theme.colors.textInverse,
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modeTextActive: {
    color: theme.colors.textInverse,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xl,
  },
});

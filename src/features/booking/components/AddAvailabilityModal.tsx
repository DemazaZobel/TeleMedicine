import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useTheme, Theme } from '../../../theme';

const DAYS = [
  { full: "Sunday", short: "Sun" },
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
  { full: "Saturday", short: "Sat" },
];

interface AddAvailabilityModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload: { weekday: number; start_time: string; end_time: string; is_active: boolean }) => Promise<void>;
  isLoading: boolean;
}

export function AddAvailabilityModal({ visible, onClose, onConfirm, isLoading }: AddAvailabilityModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [weekday, setWeekday] = useState(1); // Default Monday
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleAdd = async () => {
    // Basic validation for time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert("Invalid Time", "Please use the HH:MM format (e.g., 09:30)");
      return;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    if (startH > endH || (startH === endH && startM >= endM)) {
      Alert.alert("Invalid Range", "End time must be after start time");
      return;
    }
    
    try {
      await onConfirm({
        weekday,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        is_active: true,
      });
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Add Working Hours"
      subtitle="Set your recurring consultation times."
      maxWidth={480}
    >
      <View style={styles.container}>
        <Text style={styles.label}>Select Day</Text>
        <View style={styles.daySelector}>
          {DAYS.map((day, index) => {
            const isActive = weekday === index;
            return (
              <TouchableOpacity
                key={day.full}
                style={[
                  styles.dayButton,
                  isActive && styles.dayButtonActive,
                ]}
                onPress={() => setWeekday(index)}
              >
                <Text style={[styles.dayButtonText, isActive && styles.dayButtonTextActive]}>
                  {day.short}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.fieldLabel}>Start Time</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={18} color={theme.colors.textTertiary} style={styles.inputIcon} />
              <Input
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                containerStyle={styles.cleanInput}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.timeDivider}>
             <View style={styles.dividerLine} />
          </View>

          <View style={styles.timeField}>
            <Text style={styles.fieldLabel}>End Time</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time" size={18} color={theme.colors.textTertiary} style={styles.inputIcon} />
              <Input
                value={endTime}
                onChangeText={setEndTime}
                placeholder="17:00"
                containerStyle={styles.cleanInput}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            These hours will repeat weekly. You can add multiple blocks for the same day.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            disabled={isLoading}
            style={styles.actionBtn}
          />
          <Button
            title="Save Hours"
            onPress={handleAdd}
            loading={isLoading}
            disabled={isLoading}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingTop: theme.spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: 6,
  },
  dayButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  dayButtonText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  dayButtonTextActive: {
    color: "#FFF",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  timeField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 12,
  },
  inputIcon: {
    marginRight: -4,
  },
  cleanInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    height: 48,
  },
  timeDivider: {
    width: 30,
    alignItems: 'center',
    paddingBottom: 24,
  },
  dividerLine: {
    width: 12,
    height: 2,
    backgroundColor: theme.colors.border,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '08',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '10',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
});


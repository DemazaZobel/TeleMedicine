import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useTheme, Theme } from '../../../theme';

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
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
    if (!startTime.includes(":") || !endTime.includes(":")) {
      Alert.alert("Error", "Please use HH:MM format");
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
      maxWidth={450}
    >
      <View style={styles.container}>
        <Text style={styles.label}>Select Day</Text>
        <View style={styles.daySelector}>
          {DAYS.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                weekday === index && styles.dayButtonActive,
              ]}
              onPress={() => setWeekday(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  weekday === index && styles.dayButtonTextActive,
                ]}
              >
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.timeRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="Start Time"
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input
              label="End Time"
              value={endTime}
              onChangeText={setEndTime}
              placeholder="17:00"
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <Button
            title="Save Hours"
            onPress={handleAdd}
            loading={isLoading}
            disabled={isLoading}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  daySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.spacing.xl,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  dayButtonTextActive: {
    color: "#FFF",
  },
  timeRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

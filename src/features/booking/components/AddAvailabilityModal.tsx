import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../../components/ui';
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
  onConfirm: (payload: { 
    weekday?: number; 
    specific_date?: string; 
    start_time: string; 
    end_time: string; 
    is_active: boolean 
  }) => Promise<void>;
  isLoading: boolean;
}

export function AddAvailabilityModal({ visible, onClose, onConfirm, isLoading }: AddAvailabilityModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [isRecurring, setIsRecurring] = useState(true);
  const [weekday, setWeekday] = useState(1);
  const [specificDate, setSpecificDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleAdd = async () => {
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
        weekday: isRecurring ? weekday : undefined,
        specific_date: !isRecurring ? specificDate.toISOString().split('T')[0] : undefined,
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
      subtitle="Define when patients can book your time."
      maxWidth={500}
    >
      <View style={styles.container}>
        {/* RECURRING TOGGLE */}
        <View style={styles.recurringSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.recurringTitle}>Repeat Weekly</Text>
            <Text style={styles.recurringSubtitle}>Make these hours available every week</Text>
          </View>
          <Switch 
            value={isRecurring} 
            onValueChange={setIsRecurring}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.divider} />

        {isRecurring ? (
          <View style={styles.section}>
            <Text style={styles.label}>Select Day</Text>
            <View style={styles.daySelector}>
              {DAYS.map((day, index) => {
                const isActive = weekday === index;
                return (
                  <TouchableOpacity
                    key={day.full}
                    style={[styles.dayButton, isActive && styles.dayButtonActive]}
                    onPress={() => setWeekday(index)}
                  >
                    <Text style={[styles.dayButtonText, isActive && styles.dayButtonTextActive]}>
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.label}>Select Specific Date</Text>
            <TouchableOpacity 
              style={styles.datePickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.datePickerText}>
                {specificDate.toLocaleDateString(undefined, { dateStyle: 'long' })}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={specificDate}
                mode="date"
                minimumDate={new Date()}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (date) setSpecificDate(date);
                }}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <Button title="Done" size="sm" onPress={() => setShowDatePicker(false)} style={{ marginTop: 10 }} />
            )}
          </View>
        )}

        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.fieldLabel}>Start Time</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={18} color={theme.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                style={styles.cleanInput}
                placeholderTextColor={theme.colors.textTertiary}
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
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="17:00"
                style={styles.cleanInput}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>
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
  recurringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingRight: 8,
  },
  recurringTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  recurringSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: 'space-between',
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
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
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
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  cleanInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    padding: 0,
  },
  timeDivider: {
    width: 30,
    alignItems: 'center',
    paddingBottom: 25,
  },
  dividerLine: {
    width: 12,
    height: 2,
    backgroundColor: theme.colors.border,
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




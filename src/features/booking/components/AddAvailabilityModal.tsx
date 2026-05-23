import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { Theme, useTheme } from '../../../theme';

// JS weekday (Sun=0…Sat=6) → Python weekday (Mon=0…Sun=6)
const JS_TO_PYTHON_WEEKDAY = [6, 0, 1, 2, 3, 4, 5];
// Python weekday (Mon=0…Sun=6) → JS weekday (Sun=0…Sat=6)
const PYTHON_TO_JS_WEEKDAY = [1, 2, 3, 4, 5, 6, 0];

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
    id?: string | number;
    weekday?: number;
    specific_date?: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }) => Promise<void>;
  isLoading: boolean;
  initialData?: {
    id: string | number;
    weekday?: number;      // Python weekday from backend
    specific_date?: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
  } | null;
}

export function AddAvailabilityModal({
  visible, onClose, onConfirm, isLoading, initialData
}: AddAvailabilityModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [isRecurring, setIsRecurring] = useState(true);
  const [weekday, setWeekday] = useState(1); // JS weekday index for UI (1=Mon in JS)
  const [specificDate, setSpecificDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const dateInputRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!visible) return;

    if (initialData) {
      setIsRecurring(!initialData.specific_date);
      if (initialData.weekday !== undefined) {
        // Backend sends Python weekday → convert to JS index for the UI picker
        setWeekday(PYTHON_TO_JS_WEEKDAY[initialData.weekday]);
      }
      if (initialData.specific_date) {
        setSpecificDate(new Date(initialData.specific_date));
      }
      setStartTime(initialData.start_time.slice(0, 5));
      setEndTime(initialData.end_time.slice(0, 5));
    } else {
      // Reset for new entry — default to Monday (JS index 1)
      setIsRecurring(true);
      setWeekday(1);
      setSpecificDate(new Date());
      setStartTime("09:00");
      setEndTime("17:00");
    }
  }, [initialData, visible]);

  const handleAdd = async () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert("Invalid Time", "Please use 24-hour format (e.g., 09:30 or 15:00)");
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
        id: initialData?.id,
        // ✅ Convert JS weekday → Python weekday before saving
        weekday: isRecurring ? JS_TO_PYTHON_WEEKDAY[weekday] : undefined,
        specific_date: !isRecurring
          ? specificDate.toISOString().split('T')[0]
          : undefined,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        is_active: true,
      });
      onClose();
    } catch {
      // Error handled by store
    }
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title={initialData ? "Edit Working Hours" : "Add Working Hours"}
      subtitle={initialData
        ? "Modify your existing schedule block."
        : "Define when patients can book your time."}
      maxWidth={500}
    >
      <View style={styles.container}>

        {/* ── Recurring toggle ── */}
        <View style={styles.recurringSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.recurringTitle}>Repeat Weekly</Text>
            <Text style={styles.recurringSubtitle}>
              Make these hours available every week
            </Text>
          </View>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.divider} />

        {/* ── Day / date picker ── */}
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
              onPress={() => {
                if (Platform.OS === 'web') {
                  dateInputRef.current?.showPicker?.() ||
                    dateInputRef.current?.click();
                } else {
                  setShowDatePicker(true);
                }
              }}
            >
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.datePickerText}>
                {specificDate.toLocaleDateString(undefined, { dateStyle: 'long' })}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />

              {Platform.OS === 'web' && (
                <input
                  ref={dateInputRef}
                  type="date"
                  style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, opacity: 0 }}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) setSpecificDate(new Date(e.target.value));
                  }}
                />
              )}
            </TouchableOpacity>

            {Platform.OS !== 'web' && showDatePicker && (
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
              <Button
                title="Done"
                size="sm"
                onPress={() => setShowDatePicker(false)}
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        )}

        {/* ── Time inputs ── */}
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.fieldLabel}>
              Start Time{" "}
              <Text style={styles.fieldHint}>(24h)</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.colors.textTertiary}
                style={styles.inputIcon}
              />
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                style={styles.cleanInput}
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.timeDivider}>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.timeField}>
            <Text style={styles.fieldLabel}>
              End Time{" "}
              <Text style={styles.fieldHint}>(24h)</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="time"
                size={18}
                color={theme.colors.textTertiary}
                style={styles.inputIcon}
              />
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="17:00"
                style={styles.cleanInput}
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            disabled={isLoading}
            style={styles.actionBtn}
          />
          <Button
            title={initialData ? "Update Schedule" : "Save Hours"}
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
  fieldHint: {
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.textTertiary,
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
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Card, Button, Input, EmptyState } from '../../src/components/ui';
import { useBookingStore } from '../../src/store/booking.store';
import { useTheme, Theme } from '../../src/theme';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { availabilityRules, isLoading, fetchAvailabilityRules, createAvailabilityRule } = useBookingStore();

  const [showForm, setShowForm] = useState(false);
  const [weekday, setWeekday] = useState(1); // Default Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  const handleAddRule = async () => {
    try {
      // Validate time format briefly
      if (!startTime.includes(':') || !endTime.includes(':')) {
        Alert.alert('Error', 'Please use HH:MM format');
        return;
      }
      
      await createAvailabilityRule({
        weekday,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        is_active: true
      });
      setShowForm(false);
      Alert.alert('Success', 'Availability rule added successfully');
    } catch (error) {
      // Error handled by store
    }
  };

  const renderRule = ({ item }: { item: any }) => (
    <Card style={styles.ruleCard}>
      <View style={styles.ruleHeader}>
        <Text style={styles.dayText}>{DAYS[item.weekday]}</Text>
        <View style={[styles.activeBadge, { backgroundColor: item.is_active ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
          <Text style={[styles.activeText, { color: item.is_active ? theme.colors.success : theme.colors.error }]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <View style={styles.ruleTimes}>
        <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.timeText}>{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</Text>
      </View>
    </Card>
  );

  return (
    <ScreenContainer padded={false}>
      <View style={styles.customHeader}>
        <Button 
          title=""
          variant="ghost" 
          onPress={() => router.back()} 
          icon={<Ionicons name="chevron-back" size={24} color={theme.colors.text} />}
        />
        <Text style={styles.headerTitle}>Availability</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? "close" : "add"} size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showForm && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Add Availability Rule</Text>
            
            <Text style={styles.label}>Select Day</Text>
            <View style={styles.daySelector}>
              {DAYS.map((day, index) => (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.dayButton, weekday === index && styles.dayButtonActive]}
                  onPress={() => setWeekday(index)}
                >
                  <Text style={[styles.dayButtonText, weekday === index && styles.dayButtonTextActive]}>
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timeRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input 
                  label="Start Time (HH:MM)" 
                  value={startTime} 
                  onChangeText={setStartTime}
                  placeholder="09:00"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input 
                  label="End Time (HH:MM)" 
                  value={endTime} 
                  onChangeText={setEndTime}
                  placeholder="17:00"
                />
              </View>
            </View>

            <Button 
              title="Add Rule" 
              onPress={handleAddRule} 
              loading={isLoading}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Your Schedule</Text>
          {isLoading && !showForm ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={availabilityRules}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRule}
              scrollEnabled={false}
              ListEmptyComponent={
                <EmptyState 
                  icon="calendar-outline" 
                  title="No Rules Set" 
                  description="Set your recurring work hours to allow patients to book you." 
                />
              }
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  formCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  formTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  dayButtonTextActive: {
    color: '#FFF',
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  listSection: {
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  ruleCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ruleTimes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, PageHeader, Button, EmptyState } from '../../src/components/ui';
import { useBookingStore } from '../../src/store/booking.store';
import { useTheme, Theme } from '../../src/theme';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { availabilityRules, isLoading, fetchAvailabilityRules, createAvailabilityRule } = useBookingStore();

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  const handleAddRule = () => {
    Alert.alert("Feature Coming", "In a real app, this would open a time picker. For now, we use standard availability rules.");
    // Example: createAvailabilityRule({ weekday: 1, start_time: "09:00:00", end_time: "17:00:00" });
  };

  const renderRule = ({ item }: { item: any }) => (
    <View style={styles.ruleCard}>
      <View style={styles.ruleInfo}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayText}>{WEEKDAYS[item.weekday]}</Text>
        </View>
        <Text style={styles.timeRange}>
          {item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Delete functionality will be added in the next update.")}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.pageWrapper}>
        <PageHeader 
          title="Availability"
          subtitle="Manage your weekly consultation hours"
          action={{
            label: "Add Hours",
            onPress: handleAddRule,
            icon: "add"
          }}
        />

        {isLoading && availabilityRules.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={availabilityRules}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRule}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon="time-outline"
                title="No Hours Set"
                description="Set your availability so patients can book appointments with you."
              />
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  pageWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.xl,
    paddingBottom: 100,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  ruleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    marginRight: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  timeRange: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

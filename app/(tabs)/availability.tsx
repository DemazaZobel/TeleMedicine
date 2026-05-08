import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, EmptyState, ScreenContainer } from '../../src/components/ui';
import { AddAvailabilityModal } from '../../src/features/booking/components/AddAvailabilityModal';
import { DeleteAvailabilityModal } from '../../src/features/booking/components/DeleteAvailabilityModal';
import { useBookingStore } from '../../src/store/booking.store';
import { Theme, useTheme } from '../../src/theme';

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { availabilityRules, isLoading, fetchAvailabilityRules, createAvailabilityRule, deleteAvailabilityRule } = useBookingStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | number | null>(null);

  const handleDeletePress = (id: string | number) => {
    setRuleToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await deleteAvailabilityRule(ruleToDelete);
      setDeleteModalVisible(false);
      setRuleToDelete(null);
    } catch (err: any) {
      Alert.alert("Error", "Failed to delete schedule. Please try again.");
    }
  };

  const renderRule = ({ item }: { item: any }) => (
    <View style={styles.ruleRow}>
      <View style={styles.dayCol}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.dayText}>{DAYS[item.weekday]}</Text>
          <Text style={styles.statusText}>Recurring Weekly</Text>
        </View>
      </View>
      
      <View style={styles.timeCol}>
        <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
        <Text style={styles.timeText}>
          {item.start_time.slice(0, 5)} — {item.end_time.slice(0, 5)}
        </Text>
      </View>

      <View style={styles.actionCol}>
        <TouchableOpacity 
          onPress={() => handleDeletePress(item.id)}
          style={styles.deleteIconBtn}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer padded={false} style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Consultation Schedule</Text>
            <Text style={styles.subtitle}>Manage your recurring weekly availability</Text>
          </View>
          <Button
            title="Add New Rule"
            onPress={() => setShowAddModal(true)}
            icon={<Ionicons name="add" size={20} color="#FFF" />}
          />
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.columnLabel, { flex: 2 }]}>DAY OF WEEK</Text>
          <Text style={[styles.columnLabel, { flex: 2 }]}>WORKING HOURS</Text>
          <Text style={[styles.columnLabel, { flex: 0.5, textAlign: 'right' }]}>ACTIONS</Text>
        </View>

        {isLoading && availabilityRules.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 100 }}
          />
        ) : (
          <FlatList
            data={[...availabilityRules].sort((a, b) => a.weekday - b.weekday)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRule}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon="time-outline"
                title="No Schedule Defined"
                description="Your calendar is currently empty. Add working hours to start receiving bookings."
              />
            }
          />
        )}
      </View>

      <AddAvailabilityModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={createAvailabilityRule}
        isLoading={isLoading}
      />

      <DeleteAvailabilityModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      padding: theme.spacing.xl,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: 4,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    columnLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 1,
    },
    listContent: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: theme.radius.lg,
      borderBottomRightRadius: theme.radius.lg,
      ...theme.shadows.sm,
    },
    ruleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dayCol: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    statusText: {
      fontSize: 12,
      color: theme.colors.success,
      fontWeight: '600',
    },
    timeCol: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    actionCol: {
      flex: 0.5,
      alignItems: 'flex-end',
    },
    deleteIconBtn: {
      padding: 10,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.error + '08',
    },
  });

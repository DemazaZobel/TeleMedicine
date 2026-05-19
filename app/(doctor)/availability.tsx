import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  EmptyState,
  ScreenContainer,
} from "../../src/components/ui";
import { useBookingStore } from "../../src/store/booking.store";
import { Theme, useTheme } from "../../src/theme";
import { AddAvailabilityModal } from "../../src/features/booking/components/AddAvailabilityModal";

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
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
    availabilityRules,
    isLoading,
    fetchAvailabilityRules,
    createAvailabilityRule,
    deleteAvailabilityRule,
  } = useBookingStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  const handleDelete = (id: string | number) => {
    Alert.alert(
      "Remove Schedule",
      "Are you sure you want to delete this working hour?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteAvailabilityRule(id)
        },
      ]
    );
  };

  const renderRule = ({ item }: { item: any }) => (
    <View style={styles.ruleItem}>
      <View style={styles.ruleInfo}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>{DAYS[item.weekday].substring(0, 3).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.dayFullText}>{DAYS[item.weekday]}</Text>
          <Text style={styles.timeRangeText}>
            {item.start_time.slice(0, 5)} — {item.end_time.slice(0, 5)}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => handleDelete(item.id)}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer padded={false} style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Working Hours</Text>
          <Text style={styles.subtitle}>Set your weekly consultation schedule</Text>
        </View>
        <Button
          title="Add Hours"
          size="sm"
          onPress={() => setShowAddModal(true)}
          icon={<Ionicons name="add" size={18} color="#FFF" />}
        />
      </View>

      <View style={styles.content}>
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
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title="No Schedule Set"
                description="Patients cannot book you until you set your working hours."
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
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: 2,
    },
    subtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      alignItems: 'center', // Fix full-width issue on large screens
    },
    listContainer: {
      padding: theme.spacing.lg,
      width: '100%',
      maxWidth: 600, // Better for desktop
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ruleInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    dayBadge: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    dayFullText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    timeRangeText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    deleteBtn: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.error + '10',
    },
  });

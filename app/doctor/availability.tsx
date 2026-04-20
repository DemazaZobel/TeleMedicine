import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SPACING } from "../../src/constants/theme";
import * as svc from "../../src/services/appointmentService";
import { AvailabilityRule } from "../../src/types/appointment";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [weekday, setWeekday] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const data = await svc.getAvailabilityRules();
      setRules(data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRules();
    setRefreshing(false);
  }, [fetchRules]);

  const handleAddRule = async () => {
    if (!startTime || !endTime) {
      Alert.alert("Required", "Please enter both start and end times.");
      return;
    }

    setSubmitting(true);
    try {
      const newRule = await svc.createAvailabilityRule({
        weekday,
        start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
        end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
      });
      setRules((prev) => [...prev, newRule]);
      setShowForm(false);
      setStartTime("");
      setEndTime("");
      Alert.alert("Success", "Availability rule added.");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.detail ?? "Failed to add rule."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Group rules by weekday
  const groupedRules = WEEKDAYS.map((name, idx) => ({
    day: name,
    dayRules: rules.filter((r) => r.weekday === idx),
  })).filter((g) => g.dayRules.length > 0);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Availability</Text>
          <Text style={styles.headerSub}>
            Manage your weekly schedule for appointments
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons
            name={showForm ? "close" : "add"}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Add Rule Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add Availability Rule</Text>

          {/* Weekday Selector */}
          <Text style={styles.label}>Day of Week</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayRow}
          >
            {WEEKDAYS.map((name, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayChip,
                  weekday === idx && styles.dayChipActive,
                ]}
                onPress={() => setWeekday(idx)}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    weekday === idx && styles.dayChipTextActive,
                  ]}
                >
                  {name.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Time inputs */}
          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                placeholderTextColor={COLORS.textMuted}
                value={startTime}
                onChangeText={setStartTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.timeSeparator}>
              <Text style={styles.timeSepText}>to</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                placeholder="17:00"
                placeholderTextColor={COLORS.textMuted}
                value={endTime}
                onChangeText={setEndTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleAddRule}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Add Rule</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Rules List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={groupedRules}
          keyExtractor={(item) => item.day}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="time-outline"
                size={56}
                color={`${COLORS.textMuted}60`}
              />
              <Text style={styles.emptyText}>
                No availability rules set.{"\n"}Tap + to add your schedule.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayDot} />
                <Text style={styles.dayName}>{item.day}</Text>
              </View>
              {item.dayRules.map((rule) => (
                <View key={rule.id} style={styles.ruleRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.ruleTime}>
                    {rule.start_time.slice(0, 5)} – {rule.end_time.slice(0, 5)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    gap: SPACING.m,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.l,
    borderRadius: RADII.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.s,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  dayRow: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginBottom: SPACING.s,
  },
  dayChip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADII.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  dayChipTextActive: {
    color: "#fff",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.s,
  },
  timeSeparator: {
    paddingBottom: SPACING.m,
  },
  timeSepText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    padding: SPACING.m,
    fontSize: 15,
    color: COLORS.text,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: RADII.m,
    alignItems: "center",
    marginTop: SPACING.s,
  },
  submitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 40,
  },
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    paddingVertical: SPACING.xs,
    paddingLeft: SPACING.l,
  },
  ruleTime: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: SPACING.m,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

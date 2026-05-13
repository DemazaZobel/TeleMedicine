import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Input, ModalBase, StarRating } from '../../../components/ui';
import { Theme, useTheme } from '../../../theme';

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  minFee: number | null;
  maxFee: number | null;
  minRating: number | null;
  location: string | null;
  hospital: string | null;
  availability: 'any' | 'today' | 'this-week';
}

const PRICE_RANGES = [
  { label: 'Any', min: null, max: null },
  { label: 'Under Br 500', min: 0, max: 500 },
  { label: 'Br 500 - 1000', min: 500, max: 1000 },
  { label: 'Above Br 1000', min: 1000, max: null },
];

export function AdvancedFilterModal({ visible, onClose, onApply, initialFilters }: AdvancedFilterModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      minFee: null,
      maxFee: null,
      minRating: null,
      location: null,
      hospital: null,
      availability: 'any',
    });
  };

  return (
    <ModalBase visible={visible} onClose={onClose} title="Advanced Filters" maxWidth={500}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Location & Hospital */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Facility</Text>
          <Input
            placeholder="City or Region (e.g. Addis Ababa)"
            value={filters.location || ''}
            onChangeText={(val) => setFilters({ ...filters, location: val || null })}
            leftIcon={<Ionicons name="location-outline" size={20} color={theme.colors.textTertiary} />}
            containerStyle={{ marginBottom: theme.spacing.md }}
          />
          <Input
            placeholder="Hospital or Clinic Name"
            value={filters.hospital || ''}
            onChangeText={(val) => setFilters({ ...filters, hospital: val || null })}
            leftIcon={<Ionicons name="business-outline" size={20} color={theme.colors.textTertiary} />}
          />
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Fee</Text>
          <View style={styles.chipRow}>
            {PRICE_RANGES.map((range) => {
              const isSelected = filters.minFee === range.min && filters.maxFee === range.max;
              return (
                <TouchableOpacity
                  key={range.label}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setFilters({ ...filters, minFee: range.min, maxFee: range.max })}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{range.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.chipRow}>
            {[3, 4, 4.5].map((rating) => {
              const isSelected = filters.minRating === rating;
              return (
                <TouchableOpacity
                  key={rating}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setFilters({ ...filters, minRating: rating })}
                >
                  <StarRating rating={rating} size={14} showEmpty={false} />
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive, { marginLeft: 4 }]}>
                    {rating}+
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.chipRow}>
            {(['any', 'today', 'this-week'] as const).map((opt) => {
              const isSelected = filters.availability === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setFilters({ ...filters, availability: opt })}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {opt === 'any' ? 'Any Time' : opt === 'today' ? 'Today' : 'This Week'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Button title="Reset All" variant="ghost" onPress={handleReset} style={{ flex: 1 }} />
          <Button title="Apply Filters" variant="primary" onPress={handleApply} style={{ flex: 2 }} />
        </View>
      </ScrollView>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      fontSize: 16,
      fontWeight: '700',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '20',
    },
    chipText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    chipTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
  });

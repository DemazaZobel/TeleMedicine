import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { Theme } from '../../../theme';
import { useTheme } from '../../../theme';

const SPECIALIZATIONS = [
  'All',
  'General',
  'Cardiology',
  'Pediatrics',
  'Dentistry',
  'Neurology',
  'Orthopedics',
  'Dermatology',
];

interface FilterChipsProps {
  selected: string | null;
  onSelect: (spec: string | null) => void;
}

export const FilterChips = React.memo(function FilterChips({ selected, onSelect }: FilterChipsProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // "All" means selected is null
  const isSelected = (item: string) => {
    if (item === 'All') return selected === null;
    return selected === item;
  };

  const handlePress = (item: string) => {
    if (item === 'All') {
      onSelect(null);
    } else {
      onSelect(item === selected ? null : item);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SPECIALIZATIONS.map((spec) => {
        const active = isSelected(spec);
        return (
          <TouchableOpacity
            key={spec}
            onPress={() => handlePress(spec)}
            activeOpacity={0.7}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{spec}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    text: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    textActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

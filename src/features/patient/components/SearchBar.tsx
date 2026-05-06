import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../theme';
import type { Theme } from '../../../theme';
import { useDiscoveryStore } from '../../../store/discovery.store';
import { AdvancedFilterModal } from './AdvancedFilterModal';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

export const SearchBar = React.memo(function SearchBar({ initialValue = '', onSearch }: SearchBarProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [value, setValue] = useState(initialValue);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { 
    minPrice, 
    maxPrice, 
    minRating, 
    availability,
    setAdvancedFilters 
  } = useDiscoveryStore();

  const lastSearchRef = React.useRef(initialValue);

  // Debounced search
  useEffect(() => {
    if (value === lastSearchRef.current) return;

    const timer = setTimeout(() => {
      lastSearchRef.current = value;
      onSearch(value);
    }, 600); // Slightly longer debounce for better "standards"
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  // Sync with initialValue if it changes from outside (e.g. clearing filters)
  useEffect(() => {
    if (initialValue !== value) {
      setValue(initialValue);
      lastSearchRef.current = initialValue;
    }
  }, [initialValue]);

  const handleSubmit = () => {
    onSearch(value);
  };

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  const activeFiltersCount = [
    minPrice !== null || maxPrice !== null,
    minRating !== null,
    availability !== 'any'
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={setValue}
        placeholder="Search doctors, hospitals..."
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        leftIcon={<Ionicons name="search" size={20} color={theme.colors.textSecondary} />}
        rightIcon={
          value.length > 0 ? (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ) : undefined
        }
        containerStyle={{ flex: 1, marginBottom: 0 }}
      />
      
      <TouchableOpacity 
        style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]} 
        onPress={() => setIsFilterVisible(true)}
      >
        <Ionicons 
          name="options-outline" 
          size={22} 
          color={activeFiltersCount > 0 ? theme.colors.primary : theme.colors.textSecondary} 
        />
        {activeFiltersCount > 0 && <View style={styles.filterDot} />}
      </TouchableOpacity>

      <AdvancedFilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        initialFilters={{ minPrice, maxPrice, minRating, availability }}
        onApply={(filters) => setAdvancedFilters(filters)}
      />
    </View>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    filterBtn: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    filterBtnActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '10',
    },
    filterDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
    },
  });

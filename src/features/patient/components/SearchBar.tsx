import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../theme';
import type { Theme } from '../../../theme';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

export const SearchBar = React.memo(function SearchBar({ initialValue = '', onSearch }: SearchBarProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [value, setValue] = useState(initialValue);

  // Debounce could be added here, but for now we'll trigger on submit or clear
  const handleSubmit = () => {
    onSearch(value);
  };

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

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
    </View>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
    },
  });

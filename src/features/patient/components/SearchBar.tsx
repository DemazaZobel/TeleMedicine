import React, { useMemo, useState, useCallback, useEffect } from 'react';
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

  const lastSearchRef = React.useRef(initialValue);

  // Debounced search
  useEffect(() => {
    if (value === lastSearchRef.current) return;

    const timer = setTimeout(() => {
      lastSearchRef.current = value;
      onSearch(value);
    }, 600);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  // Sync with initialValue if it changes from outside
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
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

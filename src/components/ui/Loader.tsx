import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../../theme';
import { createLoaderStyles } from './Loader.styles';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const Loader = React.memo(function Loader({
  message,
  size = 'large',
  color,
}: LoaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createLoaderStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size}
        color={color ?? theme.colors.primary}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
});

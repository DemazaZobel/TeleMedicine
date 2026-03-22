import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../src/components/ui';
import { useTheme, Theme } from '../src/theme';

export default function ModalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScreenContainer centered>
      <View style={styles.container}>
        <Text style={styles.title}>Modal</Text>
        <Text style={styles.subtitle}>
          This is a generic modal route. Use it for overlays,
          confirmations, or detail views.
        </Text>
        <Button
          title="Dismiss"
          variant="outline"
          onPress={() => router.back()}
          style={styles.dismissButton}
        />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing['3xl'],
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    dismissButton: {
      minWidth: 160,
    },
  });

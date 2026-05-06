import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const createCardStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    cardBordered: {
      // Keep for backwards compatibility, but default is bordered now
    },
    cardPressable: {
      opacity: 1,
    },
    cardPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
  });

import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const createScreenContainerStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    padded: {
      paddingHorizontal: theme.spacing.lg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

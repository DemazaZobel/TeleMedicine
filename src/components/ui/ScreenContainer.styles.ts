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
      paddingHorizontal: theme.spacing.xl,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    constrained: {
      width: '100%',
      maxWidth: 1100,
      alignSelf: 'center',
    },
  });

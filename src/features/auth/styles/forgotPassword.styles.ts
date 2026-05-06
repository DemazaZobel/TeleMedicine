import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createForgotPasswordStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing['3xl'],
    },
    backButton: {
      marginTop: theme.spacing.lg,
    },
  });


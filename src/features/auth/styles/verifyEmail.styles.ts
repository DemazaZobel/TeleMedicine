import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createVerifyEmailStyles = (theme: Theme) =>
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
    email: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    resendButton: {
      marginTop: theme.spacing.lg,
    },
  });

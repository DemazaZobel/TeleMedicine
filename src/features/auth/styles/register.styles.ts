import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createRegisterStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing['3xl'],
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    errorContainer: {
      backgroundColor: theme.colors.errorLight,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
    },
    errorText: {
      ...theme.typography.bodySm,
      color: theme.colors.error,
    },
    nameRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    nameField: {
      flex: 1,
    },
    roleSelector: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    roleButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    roleButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    roleButtonText: {
      ...theme.typography.buttonSm,
      color: theme.colors.textSecondary,
    },
    roleButtonTextActive: {
      color: theme.colors.primary,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing['2xl'],
      gap: theme.spacing.xs,
    },
    loginText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
    loginLink: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

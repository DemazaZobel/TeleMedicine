import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createRegisterStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    header: {
      marginBottom: theme.spacing['3xl'],
    },
    title: {
      ...theme.typography.h2,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    subtitle: {
      ...theme.typography.bodyMd,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.errorLight + '20',
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.error + '30',
    },
    errorText: {
      ...theme.typography.bodySm,
      color: theme.colors.error,
      flex: 1,
    },
    roleSelector: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    roleButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    roleButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '20',
    },
    roleButtonText: {
      ...theme.typography.buttonSm,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    roleButtonTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    formRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    submitBtn: {
      marginTop: theme.spacing.xl,
      height: 48,
      borderRadius: theme.radius.lg,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing['4xl'],
    },
    footerText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
    loginLinkContainer: {
      padding: 8,
    },
    loginLink: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });

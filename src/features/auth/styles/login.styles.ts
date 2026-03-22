import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createLoginStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing['4xl'],
    },
    logo: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    appName: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    tagline: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
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
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.xl,
      marginTop: -theme.spacing.sm,
    },
    forgotPasswordText: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing['2xl'],
      gap: theme.spacing.xs,
    },
    registerText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
    registerLink: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

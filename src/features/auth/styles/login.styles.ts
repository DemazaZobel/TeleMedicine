import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createLoginStyles = (theme: Theme) =>
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
    logoBadge: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryLight + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
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
    form: {
      gap: theme.spacing.md,
    },
    passwordContainer: {
      position: 'relative',
    },
    forgotPassword: {
      position: 'absolute',
      right: 0,
      top: 0,
      paddingTop: 8,
    },
    forgotPasswordText: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    submitBtn: {
      marginTop: theme.spacing.md,
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
    registerLinkContainer: {
      padding: 8,
    },
    registerLink: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });

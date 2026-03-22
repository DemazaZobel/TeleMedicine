import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createPendingApprovalStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing['3xl'],
    },
    icon: {
      fontSize: 64,
      marginBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    statusCard: {
      width: '100%',
      backgroundColor: theme.colors.warningLight,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      marginBottom: theme.spacing.xl,
    },
    statusTitle: {
      ...theme.typography.h4,
      color: theme.colors.warning,
      marginBottom: theme.spacing.xs,
    },
    statusText: {
      ...theme.typography.bodySm,
      color: theme.colors.warning,
    },
    actionRow: {
      width: '100%',
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
    },
  });

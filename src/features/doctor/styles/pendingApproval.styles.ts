import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createPendingApprovalStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['3xl'],
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: theme.spacing['3xl'],
    },
    actionContainer: {
      width: '100%',
      gap: theme.spacing.md,
      marginBottom: theme.spacing['4xl'],
    },
    logoutButton: {
      marginTop: 'auto',
      marginBottom: theme.spacing['4xl'],
      alignSelf: 'center',
    },
  });

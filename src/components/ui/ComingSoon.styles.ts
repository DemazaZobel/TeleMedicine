import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const createComingSoonStyles = (theme: Theme) =>
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
    badge: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      marginBottom: theme.spacing.xl,
    },
    badgeText: {
      ...theme.typography.label,
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  });

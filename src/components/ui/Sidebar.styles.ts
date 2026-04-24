import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const createSidebarStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: 260,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      paddingVertical: theme.spacing['2xl'],
      paddingHorizontal: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing['4xl'],
      paddingHorizontal: theme.spacing.sm,
    },
    logoText: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
      fontWeight: '700',
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.lg,
    },
    navItemActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    navItemHover: {
      backgroundColor: theme.colors.background,
    },
    navText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.md,
      fontWeight: '500',
    },
    navTextActive: {
      color: theme.colors.primaryDark,
      fontWeight: '700',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.xl,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.lg,
    },
    logoutText: {
      ...theme.typography.body,
      color: theme.colors.error,
      marginLeft: theme.spacing.md,
      fontWeight: '500',
    },
  });

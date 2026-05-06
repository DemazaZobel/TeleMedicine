import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const createButtonStyles = (theme: Theme) =>
  StyleSheet.create({
    // ── Base ──────────────────────────────────────
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      gap: theme.spacing.sm,
    },

    // ── Sizes ─────────────────────────────────────
    sm: {
      height: 36,
      paddingHorizontal: theme.spacing.lg,
    },
    md: {
      height: 48,
      paddingHorizontal: theme.spacing.xl,
    },
    lg: {
      height: 56,
      paddingHorizontal: theme.spacing['2xl'],
    },

    // ── Variants ──────────────────────────────────
    primary: {
      backgroundColor: theme.colors.primary,
    },
    primaryPressed: {
      backgroundColor: theme.colors.primaryDark,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    secondaryPressed: {
      backgroundColor: theme.colors.secondaryLight,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    outlinePressed: {
      backgroundColor: theme.colors.primaryLight,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    ghostPressed: {
      backgroundColor: theme.colors.primaryLight,
    },
    danger: {
      backgroundColor: theme.colors.danger,
    },
    dangerPressed: {
      backgroundColor: theme.colors.error,
      opacity: 0.8,
    },
    // ── Text ──────────────────────────────────────
    textPrimary: {
      color: theme.colors.textInverse,
      ...theme.typography.button,
    },
    textSecondary: {
      color: theme.colors.primary,
      ...theme.typography.button,
    },
    textOutline: {
      color: theme.colors.primary,
      ...theme.typography.button,
    },
    textGhost: {
      color: theme.colors.primary,
      ...theme.typography.button,
    },
    textDanger: {
      color: theme.colors.textInverse,
      ...theme.typography.button,
    },

    textSm: {
      ...theme.typography.buttonSm,
    },
    textMd: {
      ...theme.typography.button,
    },
    textLg: {
      ...theme.typography.button,
      fontSize: 18,
    },

    // ── States ────────────────────────────────────
    disabled: {
      backgroundColor: theme.colors.disabled,
      borderColor: theme.colors.disabled,
    },
    disabledText: {
      color: theme.colors.textTertiary,
    },
    fullWidth: {
      width: '100%',
    },
  });

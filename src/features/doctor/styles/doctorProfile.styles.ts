import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createDoctorProfileStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      fontWeight: '700',
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    halfField: {
      flex: 1,
    },
    feeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    currency: {
      ...theme.typography.bodyLg,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    submitButton: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing['4xl'],
    },
    errorBanner: {
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
    successBanner: {
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
    },
    successText: {
      ...theme.typography.bodySm,
      color: theme.colors.success,
    },
  });

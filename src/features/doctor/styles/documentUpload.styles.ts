import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createDocumentUploadStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing['2xl'],
      lineHeight: 24,
    },
    uploadArea: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing['4xl'],
      paddingHorizontal: theme.spacing.xl,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.xl,
    },
    uploadAreaActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    uploadIcon: {
      fontSize: 40,
      marginBottom: theme.spacing.md,
    },
    uploadText: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    uploadHint: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    selectedFile: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    fileName: {
      ...theme.typography.bodySm,
      color: theme.colors.text,
      fontWeight: '600',
    },
    fileType: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
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
  });

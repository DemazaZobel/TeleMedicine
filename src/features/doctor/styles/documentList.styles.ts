import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export const createDocumentListStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingTop: theme.spacing['3xl'],
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
    },
    documentCard: {
      marginBottom: theme.spacing.md,
    },
    documentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    documentName: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '600',
      flex: 1,
    },
    documentType: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    documentDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    // Status badges
    statusBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    statusPending: {
      backgroundColor: theme.colors.warningLight,
    },
    statusPendingText: {
      color: theme.colors.warning,
    },
    statusApproved: {
      backgroundColor: theme.colors.successLight,
    },
    statusApprovedText: {
      color: theme.colors.success,
    },
    statusRejected: {
      backgroundColor: theme.colors.errorLight,
    },
    statusRejectedText: {
      color: theme.colors.error,
    },
    // Review notes
    reviewNotes: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      fontStyle: 'italic',
    },
    // Empty state
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: theme.spacing['6xl'],
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
    },
    emptySubtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
  });

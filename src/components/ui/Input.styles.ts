import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export const createInputStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.inputBackground,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: Platform.OS === 'web' ? theme.spacing.sm : 0,
      minHeight: 48,
    },
    inputWrapperFocused: {
      borderColor: theme.colors.borderFocused,
      borderWidth: 1.5,
    },
    inputWrapperError: {
      borderColor: theme.colors.error,
      borderWidth: 1.5,
    },
    input: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.text,
      paddingVertical: 0,
      ...Platform.select({
        web: {
          outlineStyle: 'none',
        } as any,
        default: {},
      }),
    },
    leftIcon: {
      marginRight: theme.spacing.sm,
    },
    rightIcon: {
      marginLeft: theme.spacing.sm,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
  });

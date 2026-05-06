import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../theme';

type BannerVariant = 'info' | 'success' | 'warning' | 'error';

export interface BannerProps {
  /** The text content to display in the banner */
  message: string;
  /** The semantic variant of the banner (default: info) */
  variant?: BannerVariant;
  /** Optional title to show above the message */
  title?: string;
  /** Override container style */
  style?: any;
}

const getIconForVariant = (variant: BannerVariant): keyof typeof Ionicons.glyphMap => {
  switch (variant) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'alert-circle';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'information-circle';
  }
};

export function Banner({ message, variant = 'info', title, style }: BannerProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, variant), [theme, variant]);

  const iconName = getIconForVariant(variant);
  let iconColor = theme.colors.primary;

  switch (variant) {
    case 'success':
      iconColor = theme.colors.success;
      break;
    case 'error':
      iconColor = theme.colors.error;
      break;
    case 'warning':
      iconColor = theme.colors.warning;
      break;
  }

  return (
    <View style={[styles.container, style]}>
      <Ionicons name={iconName} size={24} color={iconColor} style={styles.icon} />
      <View style={styles.textContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, variant: BannerVariant) => {
  let backgroundColor = theme.colors.primaryLight;
  let borderColor = theme.colors.primary;

  switch (variant) {
    case 'success':
      backgroundColor = theme.colors.successLight;
      borderColor = theme.colors.success;
      break;
    case 'error':
      backgroundColor = theme.colors.errorLight;
      borderColor = theme.colors.error;
      break;
    case 'warning':
      backgroundColor = theme.colors.warningLight;
      borderColor = theme.colors.warning;
      break;
  }

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      backgroundColor,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: `${borderColor}40`, // 25% opacity for softer border
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    icon: {
      marginRight: theme.spacing.sm,
      marginTop: 2, // Align with first line of text
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs / 2,
    },
    message: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
  });
};

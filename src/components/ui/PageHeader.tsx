import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';
import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
    icon?: string;
  };
}

export const PageHeader = React.memo(function PageHeader({ 
  title, 
  subtitle, 
  rightElement,
  action
}: PageHeaderProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {(rightElement || action) && (
        <View style={styles.rightCol}>
          {rightElement}
          {action && (
            <Button 
              variant="primary" 
              size="sm" 
              title={action.label} 
              onPress={action.onPress} 
              icon={action.icon as any}
            />
          )}
        </View>
      )}
    </View>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    leftCol: {
      flex: 1,
    },
    rightCol: {
      marginLeft: theme.spacing.md,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

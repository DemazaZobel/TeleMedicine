import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from './index';
import { useTheme } from '../../theme';
import { createComingSoonStyles } from './ComingSoon.styles';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: string;
  showBackButton?: boolean;
}

export const ComingSoon = React.memo(function ComingSoon({
  title,
  description,
  icon = '🚧',
  showBackButton = false,
}: ComingSoonProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createComingSoonStyles(theme), [theme]);

  return (
    <ScreenContainer centered scrollable={false}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>In Development</Text>
        </View>

        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>

        {showBackButton && (
          <Button
            title="Go Back"
            variant="outline"
            onPress={() => router.back()}
          />
        )}
      </View>
    </ScreenContainer>
  );
});

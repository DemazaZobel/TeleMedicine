import React, { useMemo } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { createCardStyles } from './Card.styles';

interface CardProps {
  children: React.ReactNode;
  bordered?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card = React.memo(function Card({
  children,
  bordered = false,
  onPress,
  style,
}: CardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createCardStyles(theme), [theme]);

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          bordered && styles.cardBordered,
          pressed ? styles.cardPressed : styles.cardPressable,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, bordered && styles.cardBordered, style]}>
      {children}
    </View>
  );
});

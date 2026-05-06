import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showEmpty?: boolean;
}

export function StarRating({ rating, maxStars = 5, size = 16, showEmpty = true }: StarRatingProps) {
  const { theme } = useTheme();

  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= fullStars) {
      stars.push(
        <Ionicons key={i} name="star" size={size} color="#F59E0B" />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <Ionicons key={i} name="star-half" size={size} color="#F59E0B" />
      );
    } else if (showEmpty) {
      stars.push(
        <Ionicons key={i} name="star-outline" size={size} color={theme.colors.border} />
      );
    }
  }

  return (
    <View style={styles.container}>
      {stars}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

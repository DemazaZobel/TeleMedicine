// src/components/reviews/RatingStars.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

const RatingStars: React.FC<Props> = ({ rating, onRatingChange, size = 24, interactive = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && onRatingChange?.(star)}
          disabled={!interactive}
          style={styles.starContainer}
        >
          <Text style={[styles.star, { fontSize: size }, star <= rating ? styles.filled : styles.empty]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  starContainer: { marginRight: 4 },
  star: { color: '#FFD700' },
  filled: { color: '#FFD700' },
  empty: { color: '#E5E5EA' },
});

export default RatingStars;
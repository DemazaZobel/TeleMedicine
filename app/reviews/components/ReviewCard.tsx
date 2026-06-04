// src/components/reviews/ReviewCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { Review } from '../../types/review';
import RatingStars from './RatingStars';

interface Props {
  review: Review;
}

const ReviewCard: React.FC<Props> = ({ review }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Image source={{ uri: review.patientAvatar || 'https://i.pravatar.cc/150?img=1' }} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{review.patientName}</Text>
        <Text style={styles.date}>{review.createdAt}</Text>
      </View>
    </View>
    <RatingStars rating={review.rating} size={18} />
    <Text style={styles.comment}>{review.comment}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  name: { fontWeight: '600', fontSize: 16 },
  date: { color: '#8E8E93', fontSize: 13 },
  comment: { fontSize: 15, lineHeight: 22, color: '#3C3C43' },
});

export default ReviewCard;
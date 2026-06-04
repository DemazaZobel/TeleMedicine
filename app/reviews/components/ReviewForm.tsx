// src/components/reviews/ReviewForm.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import type { ReviewSubmission } from '../../types/review';
import RatingStars from './RatingStars';
import { submitReview } from '../../services/reviewService';

interface Props {
  appointmentId: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<Props> = ({ appointmentId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await submitReview({ appointmentId, rating, comment });
      Alert.alert('Success', 'Review submitted successfully!');
      setComment('');
      setRating(5);
      onReviewSubmitted?.();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>How was your experience?</Text>
      <RatingStars rating={rating} onRatingChange={setRating} size={36} interactive />
      
      <TextInput
        style={styles.textInput}
        placeholder="Write your review (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />
      
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Review'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: { padding: 16 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    marginVertical: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});

export default ReviewForm;
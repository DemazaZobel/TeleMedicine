// src/screens/reviews/DoctorReviewsScreen.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getDoctorReviews } from '../../services/reviewService';
import ReviewCard from '../../components/reviews/ReviewCard';
import RatingStars from '../../components/reviews/RatingStars';
import type { DoctorReviewsResponse } from '../../types/review';

const DoctorReviewsScreen: React.FC = () => {
  const [data, setData] = useState<DoctorReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const load = async () => {
      const res = await getDoctorReviews(doctorId);
      setData(res);
      setLoading(false);
    };
    load();
  }, [doctorId]);

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.average}>{data.averageRating.toFixed(1)}</Text>
          <RatingStars rating={Math.round(data.averageRating)} size={32} />
          <Text style={styles.total}>{data.totalReviews} reviews</Text>
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>All Reviews</Text>
          {data.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#FFF' },
  average: { fontSize: 64, fontWeight: '700', color: '#007AFF' },
  total: { marginTop: 8, fontSize: 16, color: '#8E8E93' },
  reviewsSection: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
});

export default DoctorReviewsScreen;
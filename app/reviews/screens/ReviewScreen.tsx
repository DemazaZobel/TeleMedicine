// src/screens/reviews/ReviewScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ReviewForm from '../../components/reviews/ReviewForm';

const ReviewScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const appointmentId = (Array.isArray(params.id) ? params.id[0] : params.id) || 'apt1'; // fallback for demo
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ReviewForm
          appointmentId={appointmentId}
          onReviewSubmitted={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/appointments');
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scroll: { flexGrow: 1, paddingTop: 20 },
});

export default ReviewScreen;
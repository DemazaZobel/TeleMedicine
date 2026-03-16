import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../src/services/api';
import { AxiosError } from 'axios';
import { COLORS, SPACING, RADII } from '../../src/constants/theme';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string>('');

  const handleVerify = async () => {
    try {
      const response = await api.post<{ message: string }>('/auth/verify-email/', { email, code });
      Alert.alert('Success', response.data.message);
      router.replace('/auth/login' as any);
    } catch (error) {
      const axiosError = error as AxiosError<{ code?: string[], email?: string[] }>;
      const errorMsg = axiosError.response?.data?.code?.[0] || axiosError.response?.data?.email?.[0];
      Alert.alert('Error', errorMsg || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp/', { email });
      Alert.alert('Sent', 'A new OTP has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          placeholderTextColor={COLORS.border}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
          <Text style={styles.primaryButtonText}>Verify Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
          <Text style={styles.resendText}>Didn't receive the code? <Text style={styles.resendTextBold}>Resend</Text></Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  container: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  header: { marginBottom: SPACING.xxl, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.m },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24 },
  emailText: { color: COLORS.text, fontWeight: 'bold' },
  otpInput: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border, // Subtle border that gets updated on focus ideally
    borderRadius: RADII.l,
    paddingVertical: SPACING.m,
    marginBottom: SPACING.xl,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 12,
    color: COLORS.primary, // Make the typed OTP code the brand color!
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    borderRadius: RADII.m,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.l,
  },
  primaryButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  resendButton: { alignItems: 'center' },
  resendText: { color: COLORS.textMuted, fontSize: 15 },
  resendTextBold: { color: COLORS.primary, fontWeight: 'bold' },
});
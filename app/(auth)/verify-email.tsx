import { createVerifyEmailStyles } from '@/features/auth/styles/verifyEmail.styles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Input, AuthContainer } from '../../src/components/ui';
import { authService } from '../../src/features/auth/services/authService';
import { useTheme } from '../../src/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createVerifyEmailStyles(theme), [theme]);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError('OTP code is required');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.verifyEmail({ email: email ?? '', code: otp.trim() });
      router.replace('/(auth)/login');
    } catch {
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await authService.resendOtp(email ?? '');
    } catch {
      setError('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthContainer 
      illustration={require('../../assets/images/verification-illustration.png')}
      showBackButton
    >
      <View style={styles.container}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>Verify Email</Text>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginTop: 4 }}>
            Enter the verification code sent to{'\n'}
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{email}</Text>
          </Text>
        </View>

        <Input
          label="Verification Code"
          placeholder="Enter 6-digit code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          error={error}
        />

        <Button
          title="Verify Email"
          onPress={handleVerify}
          loading={loading}
          fullWidth
        />

        <Button
          title={resending ? 'Sending...' : 'Resend Code'}
          variant="ghost"
          onPress={handleResend}
          disabled={resending}
          style={styles.resendButton}
        />
      </View>
    </AuthContainer>
  );
}

import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContainer, Input, Button } from '../../src/components/ui';
import { useTheme } from '../../src/theme';
import { authService } from '../../src/features/auth/services/authService';
import { createForgotPasswordStyles } from '../../src/features/auth/styles/forgotPassword.styles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createForgotPasswordStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer 
      illustration={require('../../assets/images/forgot-password-illustration.png')}
      showBackButton
    >
      <View style={styles.container}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>Reset Password</Text>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginTop: 4 }}>
            {sent
              ? 'Check your email for the reset code.'
              : "Enter your email and we'll send you a reset code."}
          </Text>
        </View>

        {!sent ? (
          <>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
            />
            <Button
              title="Send Reset Code"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
            />
          </>
        ) : (
          <Button
            title="Back to Login"
            variant="outline"
            onPress={() => router.back()}
            fullWidth
          />
        )}

        {!sent && (
          <Button
            title="Back to Login"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        )}
      </View>
    </AuthContainer>
  );
}

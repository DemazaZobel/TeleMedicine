import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContainer, Input, Button } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/authStore';
import { createLoginStyles } from '../styles/login.styles';

export function LoginForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createLoginStyles(theme), [theme]);

  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await login({ email: email.trim(), password });
      // AuthGate in root layout will redirect to (tabs) automatically
    } catch (err: any) {
      // Check if the backend threw the specific "not verified" error
      const errorData = err?.response?.data;
      const detail = errorData?.detail;
      const isUnverified =
        detail === 'Please verify your email before logging in.' ||
        (Array.isArray(detail) && detail[0] === 'Please verify your email before logging in.');

      if (isUnverified) {
        // Clear the error so it doesn't flash on the next visit
        clearError();
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: email.trim() },
        });
      }
    }
  }, [email, password, login]);

  return (
    <AuthContainer 
      illustration={require('../../../../assets/images/login-illustration.png')}
      darkIllustration={require('../../../../assets/images/dark-login-illustration.png')}
    >
      <View style={styles.container}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>Welcome Back</Text>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginTop: 4 }}>Sign in to continue to MedLink</Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) clearError();
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) clearError();
          }}
          secureTextEntry
        />

        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          fullWidth
          disabled={!email.trim() || !password.trim()}
        />

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </AuthContainer>
  );
}

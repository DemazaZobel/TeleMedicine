import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Input, Button } from '../../../components/ui';
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
    } catch {
      // Error is set in the store
    }
  }, [email, password, login]);

  return (
    <ScreenContainer scrollable centered>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={styles.appName}>MedLink</Text>
          <Text style={styles.tagline}>Your Health, Connected</Text>
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
    </ScreenContainer>
  );
}

import React, { useState } from 'react';
import {
  View, TextInput, Text, Alert, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPACING, RADII } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to access your MedLink account.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder="Email Address"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/auth/register' as any)}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  container: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  header: { marginBottom: SPACING.xxl, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.s },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
  form: { width: '100%' },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    fontSize: 16,
    color: COLORS.text,
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: SPACING.l },
  forgotPasswordText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
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
  },
  disabledButton: { opacity: 0.7 },
  primaryButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: SPACING.l, alignItems: 'center' },
  linkText: { color: COLORS.textMuted, fontSize: 15 },
  linkTextBold: { color: COLORS.primary, fontWeight: 'bold' },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthContainer, Button, Input } from '../../../components/ui';
import { useAuthStore } from '../../../store/authStore';
import { Theme, useTheme } from '../../../theme';

export function LoginForm() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>

        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Input
            placeholder="email address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) clearError();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) clearError();
            }}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textTertiary} />}
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            style={styles.submitBtn}
            disabled={!email.trim() || !password.trim()}
          />
        </View>



        {/* Social
     
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        
              <View style={styles.socialRow}>
          <Pressable style={styles.socialBtn}>
            <Ionicons name="logo-apple" size={22} color={theme.colors.text} />
          </Pressable>
          <Pressable style={[styles.socialBtn, styles.socialBtnGoogle]}>
            <Ionicons name="logo-google" size={22} color="#4285F4" />
          </Pressable>
          <Pressable style={styles.socialBtn}>
            <Ionicons name="logo-twitter" size={22} color={theme.colors.text} />
          </Pressable>
        </View>*/}

        <Text style={styles.subtitle}>
          Don't have an account yet?{' '}
          <Text
            style={styles.link}
            onPress={() => router.push('/(auth)/register')}
          >
            Sign up
          </Text>
        </Text>

      </View>
    </AuthContainer>
  );
}

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
    },
    logoContainer: {
      marginBottom: 24,
    },
    logoImage: {
      width: 140,
      height: 48,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginTop: 16,
    },
    link: {
      color: theme.colors.text,
      fontWeight: '700',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.errorLight + '20',
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.error + '20',
    },
    errorText: {
      fontSize: 13,
      color: theme.colors.error,
      flex: 1,
    },
    form: {
      width: '100%',
      gap: 14,
    },
    forgotRow: {
      alignSelf: 'flex-end',
      marginTop: -4,
    },
    forgotText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    submitBtn: {
      marginTop: 4,
      height: 50,
      borderRadius: 14,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 12,
      color: theme.colors.textTertiary,
      fontWeight: '500',
      textTransform: 'uppercase',
    },
    socialRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    socialBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    socialBtnGoogle: {
      borderColor: theme.colors.primary + '30',
      backgroundColor: theme.colors.primary + '08',
    },
  });

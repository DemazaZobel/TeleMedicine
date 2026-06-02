import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { AuthContainer, Input } from '../../../components/ui';
import { useAuthStore } from '../../../store/authStore';
import { Theme, useTheme } from '../../../theme';
import { useTranslation } from '../../../i18n';

export function LoginForm() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const { t } = useTranslation();

  const { login, isLoading, error, clearError } = useAuthStore();
  const { width } = useWindowDimensions();
  const isMobileLayout = width <= 768;

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(public)');
    }
  }, [router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      const errorData = err?.response?.data;
      const detail = errorData?.detail;
      const isUnverified =
        detail === 'Please verify your email before logging in.' ||
        (Array.isArray(detail) && detail[0] === 'Please verify your email before logging in.');
      if (isUnverified) {
        clearError();
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: email.trim() },
        });
      }
    }
  }, [email, password, login]);

  const isDisabled = !email.trim() || !password.trim() || isLoading;

  return (
    <AuthContainer
      illustration={require('../../../../assets/images/login-illustration.png')}
      darkIllustration={require('../../../../assets/images/dark-login-illustration.png')}
      showBackButton={isMobileLayout}
      onBack={goBack}
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
          <Text style={styles.title}>{t('auth:welcomeBack')}</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to continue to Medlink
          </Text>
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
            placeholder={t('auth:email')}
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
            placeholder={t('auth:password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) clearError();
            }}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textTertiary} />}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            activeOpacity={0.7}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>{t('auth:forgotPassword')}</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button — always visible, shows spinner inside when loading */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={isDisabled}
          style={[styles.loginBtn, isDisabled && styles.loginBtnDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>{t('auth:login')}</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign up link */}
        <Text style={styles.subtitle}>
          {t('auth:dontHaveAccount')}{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
            {t('auth:signup')}
          </Text>
        </Text>

        {/* Mobile bottom actions */}
        {isMobileLayout && (
          <View style={styles.mobileAuthActions}>
            <TouchableOpacity
              onPress={goBack}
              activeOpacity={0.85}
              style={[styles.mobileAuthBtn, styles.mobileAuthBtnOutline]}
            >
              <Ionicons name="arrow-back" size={16} color={theme.colors.text} />
              <Text style={styles.mobileAuthBtnTextOutline}>{t('common:back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
              style={[styles.mobileAuthBtn, styles.mobileAuthBtnPrimary]}
            >
              <Text style={styles.mobileAuthBtnTextPrimary}>{t('auth:signup')}</Text>
            </TouchableOpacity>
          </View>
        )}

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
      marginBottom: 20,
    },
    logoImage: {
      width: 140,
      height: 48,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginTop: 16,
      textAlign: 'center',
    },
    link: {
      color: theme.colors.primary,
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
      marginBottom: 8,
    },
    forgotRow: {
      alignSelf: 'flex-end',
      marginTop: 8,
    },
    forgotText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // ── Login button ──────────────────────────────
    loginBtn: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    loginBtnDisabled: {
      backgroundColor: '#10B98166',
    },
    loginBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },

    // ── Divider ───────────────────────────────────
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginTop: 24,
      marginBottom: 4,
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

    // ── Mobile bottom actions ─────────────────────
    mobileAuthActions: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 16,
    },
    mobileAuthBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      minHeight: 44,
    },
    mobileAuthBtnOutline: {
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginRight: 10,
    },
    mobileAuthBtnPrimary: {
      backgroundColor: '#10B981',
    },
    mobileAuthBtnTextOutline: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginLeft: 6,
    },
    mobileAuthBtnTextPrimary: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
  });
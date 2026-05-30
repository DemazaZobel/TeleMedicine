import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { AuthContainer, Button, Input } from '../../src/components/ui';
import { authService } from '../../src/features/auth/services/authService';
import { useTheme, Theme } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

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
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBadge}>
            <Ionicons
              name={sent ? 'checkmark-circle' : 'key-outline'}
              size={32}
              color={sent ? theme.colors.success : theme.colors.primary}
            />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {sent ? 'Check Your Email' : 'Reset Password'}
          </Text>
          <Text style={styles.subtitle}>
            {sent
              ? 'We sent a reset code to your email. Check your inbox and follow the instructions.'
              : "Enter your email and we'll send you a code to reset your password."}
          </Text>
        </View>

        {!sent ? (
          <View style={styles.form}>
            <Input
              placeholder="email address"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <Button
              title={t("auth:sendResetCode")}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={styles.submitBtn}
              disabled={!email.trim()}
            />
          </View>
        ) : (
          <Button
            title={t("auth:backToLogin")}
            variant="outline"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
            style={styles.submitBtn}
          />
        )}

        {!sent && (
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Ionicons name="arrow-back" size={16} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
            <Text style={styles.backLinkText}>{t("auth:backToLogin")}</Text>
          </Pressable>
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
    iconContainer: {
      marginBottom: 24,
    },
    iconBadge: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '12',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
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
      lineHeight: 22,
      textAlign: 'center',
    },
    form: {
      width: '100%',
      gap: 16,
    },
    submitBtn: {
      height: 50,
      borderRadius: 14,
    },
    backLink: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 28,
      paddingVertical: 8,
    },
    backLinkText: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      fontWeight: '500',
    },
  });

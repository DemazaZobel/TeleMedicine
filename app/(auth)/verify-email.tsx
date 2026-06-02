import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Button, Input, AuthContainer } from '../../src/components/ui';
import { authService } from '../../src/features/auth/services/authService';
import { useTheme, Theme } from '../../src/theme';

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const isMobileLayout = width <= 768;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

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
      illustration={require('../../assets/images/verify-email-illustration.png')}
      showBackButton={isMobileLayout}
      onBack={goBack}
    >
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBadge}>
            <Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.primary} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth:verifyEmailTitle")}</Text>
          <Text style={styles.subtitle}>
            Enter the verification code sent to
          </Text>
          <Text style={styles.emailHighlight}>{email}</Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <Input
            placeholder={t("auth:enter6DigitCode")}
            value={otp}
            onChangeText={(t) => { setOtp(t); setError(''); }}
            keyboardType="number-pad"
            maxLength={6}
            leftIcon={<Ionicons name="keypad-outline" size={20} color={theme.colors.textTertiary} />}
          />

          <Button
            title={t("auth:verifyEmailTitle")}
            onPress={handleVerify}
            loading={loading}
            fullWidth
            style={styles.submitBtn}
            disabled={!otp.trim()}
          />
        </View>

        {/* Resend */}
        <Pressable onPress={handleResend} disabled={resending} style={styles.resendRow}>
          <Text style={styles.resendText}>
            {resending ? 'Sending...' : "Didn't receive the code? "}
            {!resending && <Text style={styles.resendLink}>{t("common:resend")}</Text>}
          </Text>
        </Pressable>
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
    emailHighlight: {
      fontSize: 15,
      color: theme.colors.primary,
      fontWeight: '700',
      marginTop: 4,
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
      gap: 16,
    },
    submitBtn: {
      height: 50,
      borderRadius: 14,
    },
    resendRow: {
      marginTop: 28,
      paddingVertical: 8,
    },
    resendText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    resendLink: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });

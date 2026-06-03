import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
} from 'react-native';

import { AuthContainer, Input } from '../../../components/ui';
import { Checkbox } from '../../../components/ui/CheckBox';
import { GoogleSignInButton } from '../../../components/ui/GoogleSignInButton';
import { useTranslation } from '../../../i18n';
import { useAuthStore } from '../../../store/authStore';
import { Theme, useTheme } from '../../../theme';
import type { UserRole } from '../../../types';
import { signInWithGoogle, statusCodes } from '../../../services/google-auth.service';
import { STORAGE_KEYS } from '../../../services/api';
import * as Storage from '../../../services/storage';

const ROLES: { labelKey: string; icon: keyof typeof Ionicons.glyphMap; value: UserRole }[] = [
  { labelKey: 'Patient', icon: 'person-outline', value: 'PATIENT' },
  { labelKey: 'Doctor', icon: 'medkit-outline', value: 'DOCTOR' },
];

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
  if (password.length < 6) return { label: 'Weak', color: '#ef4444', width: '33%' };
  if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return { label: 'Strong', color: '#22c55e', width: '100%' };
  return { label: 'Medium', color: '#f59e0b', width: '66%' };
}

export function RegisterForm() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  

  const { register, isLoading, error, clearError } = useAuthStore();
  const { width } = useWindowDimensions();
  const isMobileLayout = width <= 768;

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(public)');
    }
  }, [router]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const strength = getPasswordStrength(password);

  const isValid = !!(
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.length >= 6 &&
    agreeTerms
  );

  const isDisabled = !isValid || isLoading;

  const handleRegister = useCallback(async () => {
    if (!isValid) return;
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
    } catch (err: any) {
      // error handled by authStore
    }
  }, [firstName, lastName, email, password, role, isValid]);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const { status, data } = await signInWithGoogle(role);
  
      if (status === 200) {
        // Mirror exactly what authStore.login() does
        await Promise.all([
          Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.access),
          Storage.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refresh),
          Storage.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(data.user)),
        ]);
  
        useAuthStore.setState({
          user: data.user,
          tokens: { access: data.access, refresh: data.refresh },
          isAuthenticated: true,
          isLoading: false,
        });
  
        // Fetch linked accounts just like login does
        await useAuthStore.getState().fetchLinkedAccounts();
  
      } else if (status === 202) {
        // Doctor pending approval — no tokens issued yet
        router.replace('/(auth)/verify-email' as any);
      }
    } catch (err: any) {
      const code = err?.code;
      if (code === statusCodes.SIGN_IN_CANCELLED) return;
      if (code === statusCodes.IN_PROGRESS) return;
  
      const msg = err?.response?.data?.detail
        ?? err?.response?.data?.message
        ?? err?.message
        ?? t('common:errorGeneric');
  
      Alert.alert(t('common:errorTitle'), msg);
    } finally {
      setGoogleLoading(false);
    }
  }, [role, router, t]);

  const clearOnChange = useCallback(
    (setter: any) => (text: string) => {
      setter(text);
      if (error) clearError();
    },
    [error]
  );

  return (
    <AuthContainer showBackButton={isMobileLayout} onBack={goBack}>
      <View style={styles.container}>

        {/* LOGO + HEADING */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="medical" size={26} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>{t('auth:createAccount')}</Text>
          <Text style={styles.subtitle}>{t('auth:joinMedLinkSubtitle')}</Text>
        </View>

        {/* ERROR */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ROLE SELECTOR */}
        <View style={styles.roleSelector}>
          {ROLES.map((r, index) => (
            <TouchableOpacity
              key={r.value}
              onPress={() => setRole(r.value)}
              activeOpacity={0.8}
              style={[
                styles.roleButton,
                index === 0 && { marginRight: 10 },
                role === r.value && {
                  backgroundColor: theme.colors.primary + '12',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View style={[
                styles.roleIconWrap,
                { backgroundColor: role === r.value ? theme.colors.primary + '18' : theme.colors.border + '40' },
              ]}>
                <Ionicons
                  name={r.icon}
                  size={18}
                  color={role === r.value ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
              <Text style={[
                styles.roleText,
                role === r.value && { color: theme.colors.primary, fontWeight: '600' },
              ]}>
                {t(r.labelKey === 'Patient' ? 'auth.patient' : 'auth.doctor')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FORM */}
        <View style={styles.form}>

          {/* NAME ROW */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Input
                placeholder={t('auth:firstName')}
                value={firstName}
                onChangeText={clearOnChange(setFirstName)}
                enableTranslit={true}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                placeholder={t('auth:lastName')}
                value={lastName}
                onChangeText={clearOnChange(setLastName)}
                enableTranslit={true}
              />
            </View>
          </View>

          <Input
            placeholder={t('auth:email')}
            value={email}
            onChangeText={clearOnChange(setEmail)}
            style={{ marginTop: 12 }}
          />

          {/* PASSWORD */}
          <Input
            placeholder={t('auth:password')}
            value={password}
            onChangeText={clearOnChange(setPassword)}
            secureTextEntry={!showPassword}
            style={{ marginTop: 12 }}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          {/* PASSWORD STRENGTH */}
          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          {/* TERMS */}
          <View style={styles.termsRow}>
            <Checkbox checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} label="" />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLinkText} onPress={() => router.push('/terms')}>
                Terms & Conditions
              </Text>
            </Text>
          </View>

          {/* SUBMIT — always visible, spinner inside when loading */}
          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={isDisabled}
            style={[styles.submitBtn, isDisabled && styles.submitBtnDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>{t('auth:createAccount')}</Text>
            )}
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSignInButton onPress={handleGoogle} loading={googleLoading} />
        </View>

        {/* LOGIN LINK */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>{t('auth:alreadyHaveAccount')} </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
            <Text style={[styles.loginText, styles.loginLink]}>
              {t('auth:login')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MOBILE BOTTOM ACTIONS */}
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
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
              style={[styles.mobileAuthBtn, styles.mobileAuthBtnPrimary]}
            >
              <Text style={styles.mobileAuthBtnTextPrimary}>{t('auth:login')}</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </AuthContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    logoBadge: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#ef444415',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ef444430',
      width: '100%',
      marginBottom: 14,
    },
    errorText: {
      color: '#ef4444',
      fontSize: 13,
      flex: 1,
    },
    roleSelector: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 20,
    },
    roleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 12,
    },
    roleIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    roleText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    form: {
      width: '100%',
      maxWidth: 480,
    },
    nameRow: {
      flexDirection: 'row',
    },
    strengthWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 4,
    },
    strengthTrack: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 10,
    },
    strengthFill: {
      height: '100%',
      borderRadius: 4,
    },
    strengthLabel: {
      fontSize: 11,
      fontWeight: '600',
      width: 44,
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    termsText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      flex: 1,
      marginLeft: 10,
    },
    termsLinkText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // ── Submit button ─────────────────────────────
    submitBtn: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    submitBtnDisabled: {
      backgroundColor: '#10B98166',
    },
    submitBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },

    // ── Divider ───────────────────────────────────
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    // ── Login link ────────────────────────────────
    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      paddingBottom: 8,
    },
    loginText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    loginLink: {
      color: theme.colors.primary,
      fontWeight: '700',
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
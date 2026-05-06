import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthContainer, Button, Input } from '../../../components/ui';
import { useAuthStore } from '../../../store/authStore';
import { Theme, useTheme } from '../../../theme';
import type { UserRole } from '../../../types';

const ROLES: { label: string; icon: keyof typeof Ionicons.glyphMap; value: UserRole }[] = [
  { label: 'Patient', icon: 'person-outline', value: 'PATIENT' },
  { label: 'Doctor', icon: 'medkit-outline', value: 'DOCTOR' },
];

export function RegisterForm() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const { register, isLoading, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');

  const isValid =
    firstName.trim() && lastName.trim() && email.trim() && password.length >= 6;

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
      // Navigate to email verification
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
    } catch {
      // Error is set in the store
    }
  }, [firstName, lastName, email, password, role, isValid, register, router]);

  const clearOnChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
      (text: string) => {
        setter(text);
        if (error) clearError();
      },
    [error, clearError]
  );

  return (
    <AuthContainer
      illustration={require('../../../../assets/images/signup-illustration.png')}
      darkIllustration={require('../../../../assets/images/dark-signup-illustration.png')}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="medical" size={28} color={theme.colors.primary} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              style={[
                styles.roleButton,
                role === r.value && styles.roleButtonActive,
              ]}
              onPress={() => setRole(r.value)}
            >
              <Ionicons
                name={r.icon}
                size={18}
                color={role === r.value ? theme.colors.primary : theme.colors.textTertiary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  role === r.value && styles.roleButtonTextActive,
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.formRow}>
            <Input
              placeholder="First Name"
              value={firstName}
              onChangeText={clearOnChange(setFirstName)}
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.textTertiary} />}
              containerStyle={{ flex: 1 }}
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChangeText={clearOnChange(setLastName)}
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.textTertiary} />}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Input
            placeholder="email address"
            value={email}
            onChangeText={clearOnChange(setEmail)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
          />

          <Input
            placeholder="Password (min. 6 chars)"
            value={password}
            onChangeText={clearOnChange(setPassword)}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textTertiary} />}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.submitBtn}
            disabled={!isValid}
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
          Already have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => router.push('/(auth)/login')}
          >
            Sign in
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
      marginBottom: 20,
    },
    logoBadge: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '25',
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
    roleSelector: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      marginBottom: 20,
    },
    roleButton: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    },
    roleButtonActive: {
      borderColor: theme.colors.primary + '60',
      backgroundColor: theme.colors.primary + '08',
    },
    roleButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    roleButtonTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    form: {
      width: '100%',
      gap: 14,
    },
    formRow: {
      flexDirection: 'row',
      gap: 12,
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

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthContainer, Button, Input } from '../../../components/ui';
import { Checkbox } from '../../../components/ui/CheckBox';
import { GoogleSignInButton } from '../../../components/ui/GoogleSignInButton';

import { useAuthStore } from '../../../store/authStore';
import { Theme, useTheme } from '../../../theme';
import type { UserRole } from '../../../types';

const ROLES: { label: string; icon: keyof typeof Ionicons.glyphMap; value: UserRole }[] = [
  { label: 'Patient', icon: 'person-outline', value: 'PATIENT' },
  { label: 'Doctor', icon: 'medkit-outline', value: 'DOCTOR' },
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

  const { register, isLoading, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const strength = getPasswordStrength(password);

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.length >= 6 &&
    agreeTerms;

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
      // Handled globally by authStore's error state which will render in the UI banner
    }
  }, [firstName, lastName, email, password, role, isValid]);

  const handleGoogle = () => console.log('Google signup clicked');

  const clearOnChange = useCallback(
    (setter: any) => (text: string) => {
      setter(text);
      if (error) clearError();
    },
    [error]
  );

  return (
    <AuthContainer>
      <View style={styles.container}>

        {/* LOGO + HEADING */}
        <View style={styles.header}>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join MedLink and take control of your health</Text>
        </View>

        {/* ERROR */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ROLE SELECTOR */}
        <View style={styles.roleSelector}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              onPress={() => setRole(r.value)}
              style={[
                styles.roleButton,
                role === r.value && {
                  backgroundColor: theme.colors.primary + '12',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View style={[
                styles.roleIconWrap,
                { backgroundColor: role === r.value ? theme.colors.primary + '18' : theme.colors.border + '40' }
              ]}>
                <Ionicons
                  name={r.icon}
                  size={18}
                  color={role === r.value ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
              <Text style={[
                styles.roleText,
                role === r.value && { color: theme.colors.primary, fontWeight: '600' }
              ]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* FORM */}
        <View style={styles.form}>

          {/* NAME ROW */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Input placeholder="First Name" value={firstName} onChangeText={clearOnChange(setFirstName)} />
            </View>
            <View style={{ flex: 1 }}>
              <Input placeholder="Last Name" value={lastName} onChangeText={clearOnChange(setLastName)} />
            </View>
          </View>

          <Input
            placeholder="Email address"
            value={email}
            onChangeText={clearOnChange(setEmail)}
          />

          {/* PASSWORD */}
          <Input
            placeholder="Password"
            value={password}
            onChangeText={clearOnChange(setPassword)}
            secureTextEntry={!showPassword}
            rightIcon={
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            }
          />

          {/* PASSWORD STRENGTH BAR */}
          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          {/* TERMS */}
          <View style={styles.termsRow}>
            <Checkbox checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={[styles.termsText, styles.termsLinkText]} onPress={() => router.push('./terms')}>
                Terms & Conditions
              </Text>
            </Text>
          </View>

          {/* SUBMIT */}
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={!isValid}
            fullWidth
          />

          {/* DIVIDER */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSignInButton onPress={handleGoogle} loading={isLoading} />
        </View>

        {/* LOGIN LINK */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginText, { color: theme.colors.primary, fontWeight: '600' }]}>
              Sign In
            </Text>
          </Pressable>
        </View>

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

    logoImage: {
      width: 140,
      height: 48,
      marginBottom: 14,
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
      gap: 8,
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
      gap: 10,
      width: '100%',
      marginBottom: 20,
    },

    roleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    },

    roleText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },

    form: {
      width: '100%',
      gap: 12,
      maxWidth: 480,
    },

    nameRow: {
      flexDirection: 'row',
      gap: 10,
    },

    strengthWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: -4,
    },

    strengthTrack: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
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
      gap: 10,
    },

    termsText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      flex: 1,
    },

    termsLinkText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },

    dividerText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

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
  });
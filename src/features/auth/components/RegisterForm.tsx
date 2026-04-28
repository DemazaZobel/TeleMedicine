import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthContainer, Button, Input } from '../../../components/ui';
import { useAuthStore } from '../../../store/authStore';
import { useTheme } from '../../../theme';
import type { UserRole } from '../../../types';
import { createRegisterStyles } from '../styles/register.styles';

const ROLES: { label: string; value: UserRole }[] = [
  { label: '🧑 Patient', value: 'PATIENT' },
  { label: '👨‍⚕️ Doctor', value: 'DOCTOR' },
];

export function RegisterForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createRegisterStyles(theme), [theme]);

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
        {/* Header */}
        <View style={[styles.header, { marginBottom: 24 }]}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>Create Account</Text>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginTop: 4 }}>
            Join MedLink to manage your health
          </Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorContainer}>
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

        {/* Name Row */}
        <View style={styles.nameRow}>
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChangeText={clearOnChange(setFirstName)}
            containerStyle={styles.nameField}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChangeText={clearOnChange(setLastName)}
            containerStyle={styles.nameField}
          />
        </View>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={clearOnChange(setEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Password"
          placeholder="Min 6 characters"
          value={password}
          onChangeText={clearOnChange(setPassword)}
          secureTextEntry
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          fullWidth
          disabled={!isValid}
        />

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginLink}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </AuthContainer>
  );
}

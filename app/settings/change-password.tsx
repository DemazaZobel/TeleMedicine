import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Input, Button, Banner } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme, Theme } from '../../src/theme';

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isWeb = Platform.OS === 'web';

  const { isLoading, error, changePassword, clearError } = useAuthStore();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = useCallback(async () => {
    clearError();

    if (newPassword.length < 8) {
      Alert.alert('Validation', 'New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'New passwords do not match.');
      return;
    }

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Your password has been changed.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch {
      // Error is set in the store
    }
  }, [oldPassword, newPassword, confirmPassword, changePassword, clearError, router]);

  const isDisabled =
    !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim();

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Web-only breadcrumb */}
        {isWeb && (
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={styles.breadcrumb}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
            <Text style={styles.breadcrumbText}>Back to Profile</Text>
          </Pressable>
        )}

        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Enter your current password and choose a new one.
        </Text>

        {error && (
          <Banner variant="error" message={error} />
        )}

        <Input
          label="Current Password"
          placeholder="Enter current password"
          value={oldPassword}
          onChangeText={(t) => {
            setOldPassword(t);
            clearError();
          }}
          secureTextEntry
        />

        <Input
          label="New Password"
          placeholder="Min. 8 characters"
          value={newPassword}
          onChangeText={(t) => {
            setNewPassword(t);
            clearError();
          }}
          secureTextEntry
        />

        <Input
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            clearError();
          }}
          secureTextEntry
        />

        <Button
          title="Update Password"
          onPress={handleChangePassword}
          loading={isLoading}
          fullWidth
          disabled={isDisabled}
          style={styles.submitButton}
        />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
    },
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    breadcrumbText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing['2xl'],
      lineHeight: 24,
    },
    submitButton: {
      marginTop: theme.spacing['2xl'],
      marginBottom: theme.spacing['4xl'],
    },
  });

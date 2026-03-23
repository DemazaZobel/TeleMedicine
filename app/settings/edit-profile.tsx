import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Input, Button } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme, Theme } from '../../src/theme';

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { user, isLoading, error, fetchProfile, updateProfile, clearError } =
    useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
      setPhoneNumber(user.phone_number ?? '');
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    setSaved(false);
    clearError();
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim() || undefined,
      });
      setSaved(true);
    } catch {
      // Error is set in the store
    }
  }, [firstName, lastName, phoneNumber, updateProfile, clearError]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>
          Update your personal information below.
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {saved && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Profile updated successfully.</Text>
          </View>
        )}

        <Input
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={(t) => {
            setFirstName(t);
            clearError();
            setSaved(false);
          }}
        />

        <Input
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={(t) => {
            setLastName(t);
            clearError();
            setSaved(false);
          }}
        />

        <Input
          label="Phone Number"
          placeholder="+251 9XX XXX XXX"
          value={phoneNumber}
          onChangeText={(t) => {
            setPhoneNumber(t);
            clearError();
            setSaved(false);
          }}
          keyboardType="phone-pad"
        />

        <View style={styles.readOnlySection}>
          <Text style={styles.readOnlyLabel}>Email</Text>
          <Text style={styles.readOnlyValue}>{user?.email ?? '—'}</Text>
        </View>

        <View style={styles.readOnlySection}>
          <Text style={styles.readOnlyLabel}>Role</Text>
          <Text style={styles.readOnlyValue}>{user?.role ?? '—'}</Text>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          fullWidth
          style={styles.saveButton}
        />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
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
    errorBanner: {
      backgroundColor: theme.colors.errorLight,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
    },
    errorText: {
      ...theme.typography.bodySm,
      color: theme.colors.error,
    },
    successBanner: {
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
    },
    successText: {
      ...theme.typography.bodySm,
      color: theme.colors.success,
    },
    readOnlySection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      marginBottom: theme.spacing.sm,
    },
    readOnlyLabel: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    readOnlyValue: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '600',
    },
    saveButton: {
      marginTop: theme.spacing['2xl'],
      marginBottom: theme.spacing['4xl'],
    },
  });

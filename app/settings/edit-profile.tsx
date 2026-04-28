import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenContainer, Input, Button, Banner } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme, Theme } from '../../src/theme';

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const { user, isLoading, error, fetchProfile, updateProfile, clearError } =
    useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saved, setSaved] = useState(false);

  const [original, setOriginal] = useState({ firstName: '', lastName: '', phoneNumber: '' });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      const fn = user.first_name ?? '';
      const ln = user.last_name ?? '';
      const pn = user.phone_number ?? '';
      setFirstName(fn);
      setLastName(ln);
      setPhoneNumber(pn);
      setOriginal({ firstName: fn, lastName: ln, phoneNumber: pn });
    }
  }, [user]);

  const hasChanges =
    firstName !== original.firstName ||
    lastName !== original.lastName ||
    phoneNumber !== original.phoneNumber;

  const handleSave = useCallback(async () => {
    setSaved(false);
    clearError();
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim() || undefined,
      });
      setOriginal({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setSaved(true);
    } catch {
      // Error is set in the store
    }
  }, [firstName, lastName, phoneNumber, updateProfile, clearError]);

  const initials = `${user?.first_name?.[0] ?? 'U'}${user?.last_name?.[0] ?? ''}`;

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Web-only breadcrumb & page title */}
        {isWeb && (
          <>
            <Pressable
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={styles.breadcrumb}
            >
              <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
              <Text style={styles.breadcrumbText}>Back to Profile</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Edit Profile</Text>
            <Text style={styles.pageSubtitle}>Update your personal information</Text>
          </>
        )}

        {/* ── Avatar with Camera Badge ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Banners ── */}
        {error && <Banner variant="error" message={error} />}
        {saved && <Banner variant="success" message="Profile updated successfully." />}

        {/* ── Side-by-side Name Fields ── */}
        <View style={styles.nameRow}>
          <Input
            label="First name"
            placeholder="First name"
            value={firstName}
            onChangeText={(t) => { setFirstName(t); clearError(); setSaved(false); }}
            containerStyle={styles.halfField}
          />
          <Input
            label="Last name"
            placeholder="Last name"
            value={lastName}
            onChangeText={(t) => { setLastName(t); clearError(); setSaved(false); }}
            containerStyle={styles.halfField}
          />
        </View>

        {/* ── Email (read-only) ── */}
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>Email</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyValue}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        {/* ── Phone Number ── */}
        <Input
          label="Phone"
          placeholder="+251 9XX XXX XXX"
          value={phoneNumber}
          onChangeText={(t) => { setPhoneNumber(t); clearError(); setSaved(false); }}
          keyboardType="phone-pad"
        />

        {/* ── Save Button ── */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          disabled={!hasChanges}
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
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing['4xl'],
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
    pageTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    pageSubtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing['2xl'],
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    avatarOuter: {
      position: 'relative',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.disabled,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    nameRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    halfField: {
      flex: 1,
    },
    readOnlyField: {
      marginBottom: theme.spacing.lg,
    },
    readOnlyLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    readOnlyInput: {
      backgroundColor: theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md + 2,
    },
    readOnlyValue: {
      ...theme.typography.body,
      color: theme.colors.textTertiary,
    },
    saveButton: {
      marginTop: theme.spacing['2xl'],
    },
  });

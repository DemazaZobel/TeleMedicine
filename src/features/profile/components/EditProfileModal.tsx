import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Banner } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useAuthStore } from '../../../store/authStore';
import { useTheme, Theme } from '../../../theme';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { user, isLoading, error, fetchProfile, updateProfile, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saved, setSaved] = useState(false);

  const [original, setOriginal] = useState({ firstName: '', lastName: '', phoneNumber: '' });

  useEffect(() => {
    if (visible) {
      fetchProfile();
      setSaved(false);
      clearError();
    }
  }, [visible, fetchProfile, clearError]);

  useEffect(() => {
    if (user && visible) {
      const fn = user.first_name ?? '';
      const ln = user.last_name ?? '';
      const pn = user.phone_number ?? '';
      setFirstName(fn);
      setLastName(ln);
      setPhoneNumber(pn);
      setOriginal({ firstName: fn, lastName: ln, phoneNumber: pn });
    }
  }, [user, visible]);

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
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [firstName, lastName, phoneNumber, updateProfile, clearError, onClose]);

  const initials = `${user?.first_name?.[0] ?? 'U'}${user?.last_name?.[0] ?? ''}`;

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your personal information"
    >
      <View style={styles.container}>
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
            style={{ flex: 1 }}
          />
          <Input
            label="Last name"
            placeholder="Last name"
            value={lastName}
            onChangeText={(t) => { setLastName(t); clearError(); setSaved(false); }}
            style={{ flex: 1 }}
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
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: theme.spacing.xl,
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
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.colors.background,
    },
    nameRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    readOnlyField: {
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    readOnlyLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    readOnlyInput: {
      backgroundColor: theme.colors.disabled + '20',
      borderWidth: 1,
      borderColor: theme.colors.border,
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

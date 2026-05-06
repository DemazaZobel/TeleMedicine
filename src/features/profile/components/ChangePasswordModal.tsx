import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, Button, Banner } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useAuthStore } from '../../../store/authStore';
import { useTheme, Theme } from '../../../theme';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { isLoading, error, changePassword, clearError } = useAuthStore();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidationError('');
      setSuccess(false);
      clearError();
    }
  }, [visible, clearError]);

  const handleChangePassword = useCallback(async () => {
    clearError();
    setValidationError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match.');
      return;
    }

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [oldPassword, newPassword, confirmPassword, changePassword, clearError, onClose]);

  const isDisabled = !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim();
  const displayError = validationError || error;

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Change Password"
      subtitle="Enter your current password and choose a new one."
    >
      <View style={styles.container}>
        {displayError ? (
          <Banner variant="error" message={displayError} />
        ) : null}

        {success && (
          <Banner variant="success" message="Password successfully changed!" />
        )}

        <Input
          label="Current Password"
          placeholder="Enter current password"
          value={oldPassword}
          onChangeText={(t) => {
            setOldPassword(t);
            clearError();
            setValidationError('');
            setSuccess(false);
          }}
          secureTextEntry
          containerStyle={{ marginTop: 8 }}
        />

        <Input
          label="New Password"
          placeholder="Min. 8 characters"
          value={newPassword}
          onChangeText={(t) => {
            setNewPassword(t);
            clearError();
            setValidationError('');
            setSuccess(false);
          }}
          secureTextEntry
          containerStyle={{ marginTop: 16 }}
        />

        <Input
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            clearError();
            setValidationError('');
            setSuccess(false);
          }}
          secureTextEntry
          containerStyle={{ marginTop: 16 }}
        />

        <Button
          title="Update Password"
          onPress={handleChangePassword}
          loading={isLoading}
          disabled={isDisabled}
          fullWidth
          style={styles.button}
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
    button: {
      marginTop: theme.spacing['2xl'],
    },
  });

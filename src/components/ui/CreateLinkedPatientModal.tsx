import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import type { Theme } from '../../theme';
import { useTheme } from '../../theme';
import { Button } from './Button';
import { Input } from './Input';
import { ModalBase } from './ModalBase';

interface CreateLinkedPatientModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateLinkedPatientModal({ visible, onClose }: CreateLinkedPatientModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const createLinkedPatient = useAuthStore((s) => s.createLinkedPatient);
  const switchAccount = useAuthStore((s) => s.switchAccount);
  const linkedAccount = useAuthStore((s) => s.linkedAccount);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [created, setCreated] = useState(false);

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setPhone('');
    setCreated(false);
    clearError();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!email || !firstName || !lastName || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      await createLinkedPatient({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        phone_number: phone || undefined,
      });
      setCreated(true);
    } catch {
      // Error is already set in the store
    }
  };

  const handleSwitchNow = async () => {
    if (linkedAccount) {
      handleClose();
      await switchAccount(linkedAccount.id);
    }
  };

  return (
    <ModalBase
      visible={visible}
      onClose={handleClose}
      title={created ? 'Account Created!' : 'Create Patient Account'}
      subtitle={
        created
          ? 'Your linked patient account is ready.'
          : 'Create a patient profile linked to your doctor account.'
      }
      maxWidth={480}
    >
      {created ? (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={72} color={theme.colors.primary} />
          </View>
          <Text style={styles.successTitle}>
            Account Created Successfully
          </Text>
          <Text style={styles.successSubtitle}>
            Patient account for {firstName} {lastName} has been created.{'\n'}
            You can now switch between your Doctor and Patient profiles at any time using the sidebar.
          </Text>

          <View style={styles.successActions}>
            <Button
              title="Switch to Patient Now"
              onPress={handleSwitchNow}
              variant="primary"
              style={styles.primaryBtn}
            />
            <Button
              title="Stay as Doctor"
              onPress={handleClose}
              variant="outline"
              style={styles.secondaryBtn}
            />
          </View>
        </View>
      ) : (
        <View>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.error + '10' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="patient@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="First Name"
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Last Name"
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Phone (optional)"
            placeholder="+251..."
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Button
            title={isLoading ? 'Creating...' : 'Create Patient Account'}
            onPress={handleCreate}
            variant="primary"
            disabled={isLoading}
            style={styles.createBtn}
          />
        </View>
      )}
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfInput: {
      flex: 1,
    },
    createBtn: {
      marginTop: 8,
    },
    errorBanner: {
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    errorText: {
      fontSize: 13,
      fontWeight: '500',
    },
    successContainer: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    successIcon: {
      marginBottom: 20,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 32,
    },
    successActions: {
      width: '100%',
      gap: 10,
    },
    primaryBtn: {
      width: '100%',
    },
    secondaryBtn: {
      width: '100%',
    },
  });

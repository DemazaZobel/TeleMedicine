import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import type { Theme } from '../../theme';
import { useTheme } from '../../theme';
import { Button } from './Button';
import { Input } from './Input';
import { ModalBase } from './ModalBase';

interface LinkExistingAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'email' | 'otp' | 'success';

export function LinkExistingAccountModal({ visible, onClose }: LinkExistingAccountModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const linkAccountRequest = useAuthStore((s) => s.linkAccountRequest);
  const linkAccountConfirm = useAuthStore((s) => s.linkAccountConfirm);
  const switchAccount = useAuthStore((s) => s.switchAccount);
  const linkedAccount = useAuthStore((s) => s.linkedAccount);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<Step>('email');
  const [targetEmail, setTargetEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [myCode, setMyCode] = useState('');
  const [theirCode, setTheirCode] = useState('');

  const resetForm = () => {
    setStep('email');
    setTargetEmail('');
    setRequestId('');
    setMyCode('');
    setTheirCode('');
    clearError();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSendRequest = async () => {
    if (!targetEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter the email of the account you want to link.');
      return;
    }

    try {
      clearError();
      const id = await linkAccountRequest({ target_email: targetEmail.trim() });
      setRequestId(id);
      setStep('otp');
    } catch {
      // Error is set in the store
    }
  };

  const handleConfirm = async () => {
    if (!myCode.trim() || !theirCode.trim()) {
      Alert.alert('Missing Codes', 'Please enter both verification codes.');
      return;
    }

    try {
      clearError();
      await linkAccountConfirm({
        request_id: requestId,
        initiator_code: myCode.trim(),
        target_code: theirCode.trim(),
      });
      setStep('success');
    } catch {
      // Error is set in the store
    }
  };

  const handleSwitchNow = async () => {
    if (linkedAccount) {
      handleClose();
      await switchAccount(linkedAccount.id);
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'email': return 'Link Existing Account';
      case 'otp': return 'Verify Both Accounts';
      case 'success': return 'Accounts Linked!';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'email': return 'Enter the email of an existing account to link it with your current account.';
      case 'otp': return `Verification codes have been sent to both ${user?.email} and ${targetEmail}.`;
      case 'success': return 'Your accounts are now linked. You can switch between them anytime.';
    }
  };

  return (
    <ModalBase
      visible={visible}
      onClose={handleClose}
      title={getTitle()}
      subtitle={getSubtitle()}
      maxWidth={480}
    >
      {step === 'email' && (
        <View>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.error + '10' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              This will send a verification code to both your email and the account you want to link. Both codes are required to complete the link.
            </Text>
          </View>

          <Input
            label="Account Email to Link"
            placeholder="other-account@example.com"
            value={targetEmail}
            onChangeText={setTargetEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title={isLoading ? 'Sending Codes...' : 'Send Verification Codes'}
            onPress={handleSendRequest}
            variant="primary"
            disabled={isLoading}
            style={styles.actionBtn}
          />
        </View>
      )}

      {step === 'otp' && (
        <View>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.error + '10' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.otpSection}>
            <View style={styles.otpLabelRow}>
              <Ionicons name="mail" size={16} color={theme.colors.primary} />
              <Text style={styles.otpLabel}>Your Code ({user?.email})</Text>
            </View>
            <Input
              placeholder="Enter code sent to your email"
              value={myCode}
              onChangeText={setMyCode}
              keyboardType="number-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.otpSection}>
            <View style={styles.otpLabelRow}>
              <Ionicons name="mail-outline" size={16} color="#13C2C2" />
              <Text style={styles.otpLabel}>Their Code ({targetEmail})</Text>
            </View>
            <Input
              placeholder="Enter code sent to their email"
              value={theirCode}
              onChangeText={setTheirCode}
              keyboardType="number-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={styles.timerText}>Codes expire in 10 minutes</Text>
          </View>

          <View style={styles.otpActions}>
            <Button
              title="Back"
              onPress={() => { clearError(); setStep('email'); }}
              variant="outline"
              style={styles.halfBtn}
            />
            <Button
              title={isLoading ? 'Verifying...' : 'Link Accounts'}
              onPress={handleConfirm}
              variant="primary"
              disabled={isLoading}
              style={styles.halfBtn}
            />
          </View>
        </View>
      )}

      {step === 'success' && (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="link" size={72} color={theme.colors.primary} />
          </View>
          <Text style={styles.successTitle}>
            Accounts Linked Successfully
          </Text>
          <Text style={styles.successSubtitle}>
            Your accounts are now linked. You can switch between your profiles at any time using the sidebar.
          </Text>

          <View style={styles.successActions}>
            <Button
              title="Switch Account Now"
              onPress={handleSwitchNow}
              variant="primary"
              style={styles.primaryBtn}
            />
            <Button
              title="Done"
              onPress={handleClose}
              variant="outline"
              style={styles.secondaryBtn}
            />
          </View>
        </View>
      )}
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    actionBtn: {
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
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: theme.colors.primary + '08',
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary + '15',
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 19,
    },
    otpSection: {
      marginBottom: 16,
    },
    otpLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    otpLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    timerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 20,
    },
    timerText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
    otpActions: {
      flexDirection: 'row',
      gap: 10,
    },
    halfBtn: {
      flex: 1,
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

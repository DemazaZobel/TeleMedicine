import React, { useState } from 'react';
import { useTranslation } from '../../../i18n';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useTheme } from '../../../theme';

interface CancelAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function CancelAppointmentModal({
  visible,
  onClose,
  onConfirm,
  isLoading
}: CancelAppointmentModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Cancel Appointment"
      subtitle={t("errors:cancelReasonRequired")}
      maxWidth={450}
    >
      <View style={styles.container}>
        <Input
          label={t("appointment:cancellationReason")}
          placeholder={t("appointment:cancelReasonPlaceholder")}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={3}
          autoFocus
        />

        <View style={styles.actions}>
          <Button
            title={t("appointment:keepAppointment")}
            variant="outline"
            onPress={onClose}
            style={styles.button}
            disabled={isLoading}
          />
          <Button
            title={t("appointment:yesCancel")}
            variant="danger"
            onPress={handleConfirm}
            style={styles.button}
            loading={isLoading}
            disabled={!reason.trim()}
          />
        </View>
      </View>
    </ModalBase>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

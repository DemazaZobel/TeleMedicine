import React from 'react';
import { useTranslation } from '../../../i18n';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useTheme } from '../../../theme';

interface DeleteAvailabilityModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteAvailabilityModal({
  visible,
  onClose,
  onConfirm,
  isLoading
}: DeleteAvailabilityModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title={t("doctor:deleteWorkingHours")}
      subtitle={t("doctor:removeConfirm")}
      maxWidth={400}
    >
      <View style={styles.container}>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Patients will no longer be able to book appointments during this time slot.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.button}
            disabled={isLoading}
          />
          <Button
            title="Delete"
            variant="danger"
            onPress={onConfirm}
            style={styles.button}
            loading={isLoading}
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
  warningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});

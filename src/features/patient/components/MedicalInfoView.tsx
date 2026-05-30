import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../i18n';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ScreenContainer, PageHeader, EmptyState } from '../../../components/ui';
import { usePatientStore } from '../../../store/patient.store';
import type { Theme } from '../../../theme';
import { useTheme } from '../../../theme';
import { MedicalInfoModal } from './MedicalInfoModal';

function InfoRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
      <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>{label}</Text>
      <Text style={{ ...theme.typography.body, color: theme.colors.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' }}>
        {value || '—'}
      </Text>
    </View>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }}>
      <Text style={{ color, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </View>
  );
}

export function MedicalInfoView() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isWeb = Platform.OS === 'web';

  const { medicalInfo, isLoadingInfo, fetchMedicalInfo } = usePatientStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchMedicalInfo();
  }, [fetchMedicalInfo]);

  const hasData = medicalInfo && (
    medicalInfo.blood_type ||
    medicalInfo.allergies ||
    medicalInfo.chronic_conditions ||
    medicalInfo.medical_history ||
    medicalInfo.date_of_birth
  );

  return (
    <ScreenContainer scrollable constrained>
      <View style={styles.container}>
        {/* Header */}
        <PageHeader
          title="Health Record"
          subtitle={t("doctor:medicalInfoSub")}
          action={hasData ? {
            label: "Edit",
            onPress: () => setIsModalVisible(true)
          } : undefined}
        />

        {!hasData && !isLoadingInfo ? (
          <EmptyState
            icon="heart-outline"
            title={t("doctor:noMedicalInfoYet")}
            description={t("doctor:addMedicalInfoDesc")}
            actionLabel="Add Medical Info"
            onAction={() => setIsModalVisible(true)}
          />
        ) : (
          <View style={styles.mainContent}>
            {/* Vitals Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="water-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>{t("doctor:vitals")}</Text>
              </View>

              {medicalInfo?.blood_type ? (
                <View style={styles.bloodTypeRow}>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeText}>{medicalInfo.blood_type}</Text>
                  </View>
                  <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>{t("patient:bloodType")}</Text>
                </View>
              ) : null}

              <InfoRow label={t("patient:dob")} value={medicalInfo?.date_of_birth ?? ''} theme={theme} />
              <InfoRow label="Gender" value={medicalInfo?.gender ?? ''} theme={theme} />
            </View>

            <View style={styles.divider} />

            {/* Conditions & Allergies Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <Text style={styles.sectionTitle}>{t("doctor:conditionsAllergies")}</Text>
              </View>

              {medicalInfo?.allergies ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>{t("doctor:allergies")}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {medicalInfo.allergies.split(',').map((a, i) => (
                      <Badge
                        key={i}
                        label={a.trim()}
                        color={theme.colors.error}
                        bg={theme.colors.errorLight + '20'}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {medicalInfo?.chronic_conditions ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>{t("doctor:chronicConditions")}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {medicalInfo.chronic_conditions.split(',').map((c, i) => (
                      <Badge
                        key={i}
                        label={c.trim()}
                        color={theme.colors.warning}
                        bg={theme.colors.warningLight + '20'}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {!medicalInfo?.allergies && !medicalInfo?.chronic_conditions && (
                <Text style={{ ...theme.typography.body, color: theme.colors.textTertiary, fontStyle: 'italic' }}>
                  No conditions or allergies recorded.
                </Text>
              )}
            </View>

            {/* Medical History Section */}
            {medicalInfo?.medical_history ? (
              <>
                <View style={styles.divider} />
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>{t("doctor:medicalHistoryTitle")}</Text>
                  </View>
                  <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, lineHeight: 24 }}>
                    {medicalInfo.medical_history}
                  </Text>
                </View>
              </>
            ) : null}

            {/* Location Section */}
            {(medicalInfo?.address || medicalInfo?.city || medicalInfo?.country) ? (
              <>
                <View style={styles.divider} />
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="location-outline" size={20} color={theme.colors.success} />
                    <Text style={styles.sectionTitle}>Location</Text>
                  </View>
                  <InfoRow label={t("common:address")} value={medicalInfo?.address ?? ''} theme={theme} />
                  <InfoRow label={t("common:city")} value={medicalInfo?.city ?? ''} theme={theme} />
                  <InfoRow label={t("common:country")} value={medicalInfo?.country ?? ''} theme={theme} />
                </View>
              </>
            ) : null}
          </View>
        )}
      </View>
      <MedicalInfoModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: theme.spacing['4xl'],
    },
    mainContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    section: {
      paddingVertical: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      gap: 10,
    },
    sectionTitle: {
      ...theme.typography.h4,
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.4,
      marginVertical: theme.spacing.sm,
    },
    fieldLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bloodTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    bloodTypeBadge: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight + '30',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryLight,
    },
    bloodTypeText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
  });

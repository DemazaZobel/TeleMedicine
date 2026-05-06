import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ScreenContainer } from '../../../components/ui';
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
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Health Record</Text>
            <Text style={styles.subtitle}>Your medical information at a glance</Text>
          </View>
          <Button
            title="Edit"
            variant="outline"
            size="sm"
            onPress={() => setIsModalVisible(true)}
            style={{ minWidth: 70 }}
          />
        </View>

        {!hasData && !isLoadingInfo ? (
          /* Empty State */
          <Card style={styles.emptyCard}>
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="heart-outline" size={56} color={theme.colors.primary} />
              <Text style={{ ...theme.typography.h4, color: theme.colors.text, marginTop: 16, fontWeight: '600' }}>
                No Medical Info Yet
              </Text>
              <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: 260 }}>
                Add your medical details so doctors can serve you better.
              </Text>
              <Button
                title="Add Medical Info"
                onPress={() => setIsModalVisible(true)}
                style={{ marginTop: 24 }}
              />
            </View>
          </Card>
        ) : (
          <View style={styles.mainContent}>
            {/* Vitals Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="water-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Vitals</Text>
              </View>

              {medicalInfo?.blood_type ? (
                <View style={styles.bloodTypeRow}>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeText}>{medicalInfo.blood_type}</Text>
                  </View>
                  <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Blood Type</Text>
                </View>
              ) : null}

              <InfoRow label="Date of Birth" value={medicalInfo?.date_of_birth ?? ''} theme={theme} />
              <InfoRow label="Gender" value={medicalInfo?.gender ?? ''} theme={theme} />
            </View>

            <View style={styles.divider} />

            {/* Conditions & Allergies Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <Text style={styles.sectionTitle}>Conditions & Allergies</Text>
              </View>

              {medicalInfo?.allergies ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>Allergies</Text>
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
                  <Text style={styles.fieldLabel}>Chronic Conditions</Text>
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
                    <Text style={styles.sectionTitle}>Medical History</Text>
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
                  <InfoRow label="Address" value={medicalInfo?.address ?? ''} theme={theme} />
                  <InfoRow label="City" value={medicalInfo?.city ?? ''} theme={theme} />
                  <InfoRow label="Country" value={medicalInfo?.country ?? ''} theme={theme} />
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
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: theme.spacing['2xl'],
      paddingTop: theme.spacing['2xl'],
      paddingBottom: theme.spacing['4xl'],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 4,
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
    emptyCard: {
      marginTop: theme.spacing.xl,
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

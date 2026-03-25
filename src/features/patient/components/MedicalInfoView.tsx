import React, { useEffect, useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Card, Button } from '../../../components/ui';
import { usePatientStore } from '../../../store/patient.store';
import { useTheme } from '../../../theme';
import type { Theme } from '../../../theme';

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

  const { medicalInfo, isLoadingInfo, fetchMedicalInfo } = usePatientStore();

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
            onPress={() => router.push('/settings/medical-info')}
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
                onPress={() => router.push('/settings/medical-info')}
                style={{ marginTop: 24 }}
              />
            </View>
          </Card>
        ) : (
          <>
            {/* Vitals Card */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="water-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Vitals</Text>
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
            </Card>

            {/* Conditions & Allergies */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <Text style={styles.cardTitle}>Conditions & Allergies</Text>
              </View>

              {medicalInfo?.allergies ? (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.fieldLabel}>Allergies</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {medicalInfo.allergies.split(',').map((a, i) => (
                      <Badge
                        key={i}
                        label={a.trim()}
                        color={theme.colors.error}
                        bg={theme.colors.errorLight}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {medicalInfo?.chronic_conditions ? (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.fieldLabel}>Chronic Conditions</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {medicalInfo.chronic_conditions.split(',').map((c, i) => (
                      <Badge
                        key={i}
                        label={c.trim()}
                        color={theme.colors.warning}
                        bg={theme.colors.warningLight}
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
            </Card>

            {/* Medical History */}
            {medicalInfo?.medical_history ? (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>Medical History</Text>
                </View>
                <Text style={{ ...theme.typography.body, color: theme.colors.text, lineHeight: 22 }}>
                  {medicalInfo.medical_history}
                </Text>
              </Card>
            ) : null}

            {/* Location */}
            {(medicalInfo?.address || medicalInfo?.city || medicalInfo?.country) ? (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="location-outline" size={20} color={theme.colors.success} />
                  <Text style={styles.cardTitle}>Location</Text>
                </View>
                <InfoRow label="Address" value={medicalInfo?.address ?? ''} theme={theme} />
                <InfoRow label="City" value={medicalInfo?.city ?? ''} theme={theme} />
                <InfoRow label="Country" value={medicalInfo?.country ?? ''} theme={theme} />
              </Card>
            ) : null}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['2xl'],
      paddingBottom: theme.spacing['4xl'],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    card: {
      marginBottom: theme.spacing.lg,
    },
    emptyCard: {
      marginTop: theme.spacing.xl,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      gap: 8,
    },
    cardTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      fontWeight: '600',
    },
    fieldLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    bloodTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    bloodTypeBadge: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bloodTypeText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
  });

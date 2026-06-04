import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { EmptyState, ScreenContainer } from '../../../components/ui';
import { useTranslation } from '../../../i18n';
import { usePatientStore } from '../../../store/patient.store';
import type { Theme } from '../../../theme';
import { useTheme } from '../../../theme';
import { MedicalInfoModal } from './MedicalInfoModal';

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <View style={sharedStyles.infoRow}>
      <Text style={[sharedStyles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[sharedStyles.infoValue, { color: theme.colors.text }]}>{value || '—'}</Text>
    </View>
  );
}

function Badge({
  label,
  iconName,
  theme,
  type,
}: {
  label: string;
  iconName?: string;
  theme: Theme;
  type: 'allergy' | 'condition';
}) {
  const colors = {
    allergy: { bg: theme.colors.errorLight + '18', text: theme.colors.error, icon: 'alert-circle' },
    condition: { bg: theme.colors.warningLight + '18', text: theme.colors.warning, icon: 'medical' },
  };
  const colorSet = colors[type];
  return (
    <View style={[sharedStyles.badge, { backgroundColor: colorSet.bg, borderColor: colorSet.text + '22' }]}>
      <Ionicons name={(iconName ?? colorSet.icon) as any} size={13} color={colorSet.text} />
      <Text style={[sharedStyles.badgeText, { color: colorSet.text }]}>{label.trim()}</Text>
    </View>
  );
}

function SectionCard({
  icon,
  title,
  theme,
  children,
  style,
}: {
  icon: string;
  title: string;
  theme: Theme;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[sharedStyles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
      <View style={[sharedStyles.sectionHeader, { borderBottomColor: theme.colors.border }]}>
        <View style={[sharedStyles.iconPill, { backgroundColor: theme.colors.primary + '12' }]}>
          <Ionicons name={icon as any} size={15} color={theme.colors.primary} />
        </View>
        <Text style={[sharedStyles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <View style={sharedStyles.sectionBody}>{children}</View>
    </View>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────────

export function MedicalInfoView() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { t } = useTranslation('medicalInfo');
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  const allergies = medicalInfo?.allergies?.split(',').filter((a) => a.trim()) || [];
  const conditions = medicalInfo?.chronic_conditions?.split(',').filter((c) => c.trim()) || [];

  // Responsive: 2-col on wide screens, single col on mobile
  const isWide = width >= 768;

  return (
    <ScreenContainer scrollable={false} padded={false} constrained>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.container, isWide && styles.containerWide]}>

          {/* ── Header ── */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{t('header.title')}</Text>
              <Text style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}>{t('header.subtitle')}</Text>
            </View>
            {hasData && (
              <TouchableOpacity
                style={[styles.editBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil-outline" size={15} color={theme.colors.primary} />
                <Text style={[styles.editBtnText, { color: theme.colors.primary }]}>{t('header.editBtn')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Empty State ── */}
          {!hasData && !isLoadingInfo ? (
            <View style={styles.emptyWrapper}>
              <EmptyState
                icon="heart-outline"
                title={t('empty.title')}
                description={t('empty.description')}
                actionLabel={t('empty.actionLabel')}
                onAction={() => setIsModalVisible(true)}
              />
            </View>
          ) : (
            <>
              {/* ── Blood Type Hero Strip ── */}
              {medicalInfo?.blood_type && (
                <View style={[styles.heroStrip, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '20' }]}>
                  <View style={[styles.heroIconWrap, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Ionicons name="water" size={22} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>{t('bloodType.label')}</Text>
                    <Text style={[styles.heroValue, { color: theme.colors.primary }]}>{medicalInfo.blood_type}</Text>
                  </View>
                </View>
              )}

              {/* ── Grid (2-col on web, 1-col on mobile) ── */}
              <View style={[styles.grid, isWide && styles.gridWide]}>

                {/* Personal Info */}
                <SectionCard icon="person-outline" title={t('personal.sectionTitle')} theme={theme} style={isWide && styles.cellHalf}>
                  <InfoRow label={t('personal.dateOfBirth')} value={medicalInfo?.date_of_birth ?? ''} theme={theme} />
                  <InfoRow label={t('personal.gender')} value={medicalInfo?.gender ?? ''} theme={theme} />
                </SectionCard>

                {/* Location */}
                {(medicalInfo?.address || medicalInfo?.city || medicalInfo?.country) && (
                  <SectionCard icon="location-outline" title={t('location.sectionTitle')} theme={theme} style={isWide && styles.cellHalf}>
                    <InfoRow label={t('location.address')} value={medicalInfo?.address ?? ''} theme={theme} />
                    <InfoRow label={t('location.city')} value={medicalInfo?.city ?? ''} theme={theme} />
                    <InfoRow label={t('location.country')} value={medicalInfo?.country ?? ''} theme={theme} />
                  </SectionCard>
                )}

                {/* Conditions & Allergies — full width */}
                {(allergies.length > 0 || conditions.length > 0) && (
                  <SectionCard icon="medical-outline" title={t('conditions.sectionTitle')} theme={theme} style={isWide && styles.cellFull}>
                    {conditions.length > 0 && (
                      <View style={styles.badgeBlock}>
                        <Text style={[styles.badgeGroupLabel, { color: theme.colors.textSecondary }]}>{t('conditions.chronicLabel')}</Text>
                        <View style={styles.badgeRow}>
                          {conditions.map((c, i) => (
                            <Badge key={`c-${i}`} label={c} type="condition" theme={theme} />
                          ))}
                        </View>
                      </View>
                    )}
                    {allergies.length > 0 && (
                      <View style={[styles.badgeBlock, conditions.length > 0 && styles.badgeBlockBordered, { borderColor: theme.colors.border }]}>
                        <Text style={[styles.badgeGroupLabel, { color: theme.colors.textSecondary }]}>{t('conditions.allergiesLabel')}</Text>
                        <View style={styles.badgeRow}>
                          {allergies.map((a, i) => (
                            <Badge key={`a-${i}`} label={a} type="allergy" theme={theme} iconName="alert-circle" />
                          ))}
                        </View>
                      </View>
                    )}
                  </SectionCard>
                )}

                {/* Medical History — full width */}
                {medicalInfo?.medical_history && (
                  <SectionCard icon="document-text-outline" title={t('history.sectionTitle')} theme={theme} style={isWide && styles.cellFull}>
                    <Text style={[styles.historyText, { color: theme.colors.textSecondary }]}>
                      {medicalInfo.medical_history}
                    </Text>
                  </SectionCard>
                )}

              </View>
            </>
          )}
        </View>
      </ScrollView>

      <MedicalInfoModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </ScreenContainer>
  );
}

// ─── Shared Styles (used by sub-components) ────────────────────────────────────

const sharedStyles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  iconPill: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  sectionBody: {
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

// ─── Page-level Styles ─────────────────────────────────────────────────────────

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      paddingTop: 30,
      paddingBottom: 60,
    },
    containerWide: {
      alignSelf: 'center',
      width: '100%',
    },
    // Header
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    pageSubtitle: {
      fontSize: 13,
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
    },
    editBtnText: {
      fontSize: 13,
      fontWeight: '600',
    },
    emptyWrapper: {
      flex: 1,
      justifyContent: 'center',
      marginTop: 48,
    },
    // Hero strip
    heroStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 18,
      paddingVertical: 14,
      marginBottom: 20,
    },
    heroIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    heroValue: {
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    // Grid layout
    grid: {
      flexDirection: 'column',
    },
    gridWide: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    cellHalf: {
      flex: 1,
      minWidth: 280,
      marginBottom: 0,
    },
    cellFull: {
      width: '100%',
      marginBottom: 0,
    },
    // Badge groups inside conditions card
    badgeBlock: {
      paddingVertical: 12,
    },
    badgeBlockBordered: {
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    badgeGroupLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    historyText: {
      fontSize: 14,
      lineHeight: 22,
      paddingVertical: 12,
    },
  });
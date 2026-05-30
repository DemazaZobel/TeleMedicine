import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../../i18n';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Banner, Button, Card, Input, ScreenContainer } from '../../../components/ui';
import { usePatientStore } from '../../../store/patient.store';
import type { Theme } from '../../../theme';
import { useTheme } from '../../../theme';
import type { PatientProfileUpdate } from '../types/patient.types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const GENDER_OPTIONS = ['Male', 'Female'];

export function MedicalInfoForm() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const {
    medicalInfo,
    isLoadingInfo,
    isUpdatingInfo,
    error,
    fetchMedicalInfo,
    updateMedicalInfo,
    clearError,
  } = usePatientStore();

  // ── Form State ──
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [saved, setSaved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Fetch on mount ──
  useEffect(() => {
    fetchMedicalInfo();
  }, [fetchMedicalInfo]);

  // ── Populate form when data loads ──
  useEffect(() => {
    if (medicalInfo) {
      setDateOfBirth(medicalInfo.date_of_birth ?? '');
      setGender(medicalInfo.gender ?? '');
      setBloodType(medicalInfo.blood_type ?? '');
      setMedicalHistory(medicalInfo.medical_history ?? '');
      setChronicConditions(medicalInfo.chronic_conditions ?? '');
      setAllergies(medicalInfo.allergies ?? '');
      setAddress(medicalInfo.address ?? '');
      setCity(medicalInfo.city ?? '');
      setCountry(medicalInfo.country ?? '');
    }
  }, [medicalInfo]);

  const handleSave = useCallback(async () => {
    setSaved(false);
    clearError();
    setLocalError(null);

    // Ensure the date of birth is properly formatted to YYYY-MM-DD
    let formattedDob = dateOfBirth.trim() || null;
    if (formattedDob) {
      // Very basic parsing for common inputs like YYYY/M/D or YYYY.MM.DD
      const dateParts = formattedDob.split(/[-/.]/);
      if (dateParts.length === 3) {
        const year = dateParts[0].padStart(4, '0');
        const month = dateParts[1].padStart(2, '0');
        const day = dateParts[2].padStart(2, '0');
        formattedDob = `${year}-${month}-${day}`;
      }

      // Timezone-safe validation for Date of Birth in the past
      const parts = formattedDob.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS month is 0-indexed
        const day = parseInt(parts[2], 10);
        
        const dobDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(dobDate.getTime())) {
          setLocalError('Please enter a valid date of birth.');
          return;
        }
        
        if (dobDate >= today) {
          setLocalError('Date of Birth must be in the past.');
          return;
        }
      } else {
        setLocalError('Please enter a valid date of birth (YYYY-MM-DD).');
        return;
      }
    }

    const payload: PatientProfileUpdate = {
      date_of_birth: formattedDob,
      gender: gender.trim(),
      blood_type: bloodType.trim(),
      medical_history: medicalHistory.trim() || null,
      chronic_conditions: chronicConditions.trim(),
      allergies: allergies.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
    };
    try {
      await updateMedicalInfo(payload);
      setSaved(true);
    } catch {
      // Error is set in the store
    }
  }, [
    dateOfBirth, gender, bloodType, medicalHistory,
    chronicConditions, allergies, address, city, country,
    updateMedicalInfo, clearError,
  ]);

  const clear = useCallback(() => {
    clearError();
    setSaved(false);
    setLocalError(null);
  }, [clearError]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Web-only breadcrumb */}
        {isWeb && (
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={styles.breadcrumb}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
            <Text style={styles.breadcrumbText}>{t("patient:backToProfile")}</Text>
          </Pressable>
        )}

        <Text style={styles.title}>{t("doctor:medicalInformationTitle")}</Text>
        <Text style={styles.subtitle}>
          Keep your medical record up to date so doctors can serve you better.
        </Text>

        {(error || localError) && <Banner variant="error" message={(localError || error) ?? ''} />}
        {saved && <Banner variant="success" message={t("doctor:updateSuccess")} />}

        {/* ── Personal Details ── */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t("patient:personalDetails")}</Text>

          <Input
            label={t("patient:dob")}
            placeholder={t("common:dateFormatPlaceholder")}
            value={dateOfBirth}
            onChangeText={(t) => { setDateOfBirth(t); clear(); }}
          />

          {/* Gender Selector */}
          <Text style={styles.chipLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map((g) => (
              <Button
                key={g}
                title={g}
                variant={gender === g ? 'primary' : 'outline'}
                size="sm"
                onPress={() => { setGender(g); clear(); }}
                style={styles.chip}
              />
            ))}
          </View>

          {/* Blood Type Selector */}
          <Text style={styles.chipLabel}>{t("patient:bloodType")}</Text>
          <View style={styles.chipRow}>
            {BLOOD_TYPES.map((bt) => (
              <Button
                key={bt}
                title={bt}
                variant={bloodType === bt ? 'primary' : 'outline'}
                size="sm"
                onPress={() => { setBloodType(bt); clear(); }}
                style={styles.chip}
              />
            ))}
          </View>
        </Card>

        {/* ── Medical History ── */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Health Record</Text>

          <Input
            label={t("doctor:medicalHistoryTitle")}
            placeholder={t("doctor:pastHistoryDesc")}
            value={medicalHistory}
            onChangeText={(t) => { setMedicalHistory(t); clear(); }}
            multiline
            numberOfLines={3}
          />

          <Input
            label={t("doctor:chronicConditions")}
            placeholder={t("doctor:egChronic")}
            value={chronicConditions}
            onChangeText={(t) => { setChronicConditions(t); clear(); }}
          />

          <Input
            label={t("doctor:allergies")}
            placeholder={t("doctor:egAllergies")}
            value={allergies}
            onChangeText={(t) => { setAllergies(t); clear(); }}
          />
        </Card>

        {/* ── Address ── */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>

          <Input
            label={t("common:address")}
            placeholder={t("patient:streetAddress")}
            value={address}
            onChangeText={(t) => { setAddress(t); clear(); }}
          />

          <View style={styles.row}>
            <Input
              label={t("common:city")}
              placeholder={t("common:city")}
              value={city}
              onChangeText={(t) => { setCity(t); clear(); }}
              containerStyle={styles.halfField}
            />
            <Input
              label={t("common:country")}
              placeholder={t("common:country")}
              value={country}
              onChangeText={(t) => { setCountry(t); clear(); }}
              containerStyle={styles.halfField}
            />
          </View>
        </Card>

        <Button
          title={t("doctor:saveMedicalInfo")}
          onPress={handleSave}
          loading={isUpdatingInfo || isLoadingInfo}
          fullWidth
          style={styles.saveButton}
        />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing['4xl'],
    },
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    breadcrumbText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing['2xl'],
      lineHeight: 24,
    },
    card: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      fontWeight: '600',
    },
    chipLabel: {
      ...theme.typography.label,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    chip: {
      minWidth: 60,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    halfField: {
      flex: 1,
    },
    saveButton: {
      marginTop: theme.spacing.lg,
    },
  });

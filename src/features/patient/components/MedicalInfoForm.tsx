import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Banner, Button, Card, Input, ScreenContainer } from '../../../components/ui';
import { usePatientStore } from '../../../store/patient.store';
import type { Theme } from '../../../theme';
import { useTheme } from '../../../theme';
import type { PatientProfileUpdate } from '../types/patient.types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const GENDER_OPTIONS = ['Male', 'Female'];

export function MedicalInfoForm() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
    const payload: PatientProfileUpdate = {
      date_of_birth: dateOfBirth.trim() || null,
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
  }, [clearError]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Medical Information</Text>
        <Text style={styles.subtitle}>
          Keep your medical record up to date so doctors can serve you better.
        </Text>

        {error && <Banner variant="error" message={error} />}
        {saved && <Banner variant="success" message="Medical info updated successfully." />}

        {/* ── Personal Details ── */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
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
          <Text style={styles.chipLabel}>Blood Type</Text>
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
            label="Medical History"
            placeholder="Previous diagnoses, surgeries, etc."
            value={medicalHistory}
            onChangeText={(t) => { setMedicalHistory(t); clear(); }}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Chronic Conditions"
            placeholder="e.g. Diabetes, Hypertension"
            value={chronicConditions}
            onChangeText={(t) => { setChronicConditions(t); clear(); }}
          />

          <Input
            label="Allergies"
            placeholder="e.g. Penicillin, Peanuts"
            value={allergies}
            onChangeText={(t) => { setAllergies(t); clear(); }}
          />
        </Card>

        {/* ── Address ── */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>

          <Input
            label="Address"
            placeholder="Street address"
            value={address}
            onChangeText={(t) => { setAddress(t); clear(); }}
          />

          <View style={styles.row}>
            <Input
              label="City"
              placeholder="City"
              value={city}
              onChangeText={(t) => { setCity(t); clear(); }}
              containerStyle={styles.halfField}
            />
            <Input
              label="Country"
              placeholder="Country"
              value={country}
              onChangeText={(t) => { setCountry(t); clear(); }}
              containerStyle={styles.halfField}
            />
          </View>
        </Card>

        <Button
          title="Save Medical Info"
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
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing['4xl'],
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

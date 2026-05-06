import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Banner, Card } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { usePatientStore } from '../../../store/patient.store';
import { useTheme, Theme } from '../../../theme';
import type { PatientProfileUpdate } from '../types/patient.types';

interface MedicalInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDER_OPTIONS = ['Male', 'Female'];

export function MedicalInfoModal({ visible, onClose }: MedicalInfoModalProps) {
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

  useEffect(() => {
    if (visible) {
      fetchMedicalInfo();
      setSaved(false);
      clearError();
    }
  }, [visible, fetchMedicalInfo, clearError]);

  useEffect(() => {
    if (medicalInfo && visible) {
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
  }, [medicalInfo, visible]);

  const handleSave = useCallback(async () => {
    setSaved(false);
    clearError();

    let formattedDob = dateOfBirth.trim() || null;
    if (formattedDob) {
      const dateParts = formattedDob.split(/[-/.]/);
      if (dateParts.length === 3) {
        const year = dateParts[0].padStart(4, '0');
        const month = dateParts[1].padStart(2, '0');
        const day = dateParts[2].padStart(2, '0');
        formattedDob = `${year}-${month}-${day}`;
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
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [
    dateOfBirth, gender, bloodType, medicalHistory,
    chronicConditions, allergies, address, city, country,
    updateMedicalInfo, clearError, onClose
  ]);

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Medical Information"
      subtitle="Update your health profile and history."
    >
      <View style={styles.container}>
        {error && <Banner variant="error" message={error} />}
        {saved && <Banner variant="success" message="Medical information updated." />}

        {/* ── Basic Info Section ── */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
            onChangeText={(t) => { setDateOfBirth(t); clearError(); setSaved(false); }}
            containerStyle={{ marginBottom: 16 }}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipsRow}>
            {GENDER_OPTIONS.map((g) => {
              const isSelected = gender === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => { setGender(g); setSaved(false); clearError(); }}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {g}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Blood Type</Text>
          <View style={[styles.chipsRow, { flexWrap: 'wrap' }]}>
            {BLOOD_TYPES.map((bt) => {
              const isSelected = bloodType === bt;
              return (
                <Pressable
                  key={bt}
                  onPress={() => { setBloodType(bt); setSaved(false); clearError(); }}
                  style={[styles.chip, isSelected && styles.chipSelected, { width: 60, marginBottom: 8 }]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {bt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* ── Health History Section ── */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Health History</Text>
          </View>

          <Input
            label="Allergies"
            placeholder="E.g., Penicillin, Peanuts (or leave blank)"
            value={allergies}
            onChangeText={(t) => { setAllergies(t); clearError(); setSaved(false); }}
            containerStyle={{ marginBottom: 16 }}
          />

          <Input
            label="Chronic Conditions"
            placeholder="E.g., Asthma, Diabetes (or leave blank)"
            value={chronicConditions}
            onChangeText={(t) => { setChronicConditions(t); clearError(); setSaved(false); }}
            containerStyle={{ marginBottom: 16 }}
          />

          <Input
            label="General Medical History"
            placeholder="Any past surgeries, ongoing treatments, or other notes..."
            value={medicalHistory}
            onChangeText={(t) => { setMedicalHistory(t); clearError(); setSaved(false); }}
            multiline
            numberOfLines={4}
          />
        </Card>

        {/* ── Location Section ── */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Input
            label="Address"
            placeholder="Street address"
            value={address}
            onChangeText={(t) => { setAddress(t); clearError(); setSaved(false); }}
            containerStyle={{ marginBottom: 16 }}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input
              label="City"
              placeholder="Addis Ababa"
              value={city}
              onChangeText={(t) => { setCity(t); clearError(); setSaved(false); }}
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Country"
              placeholder="Ethiopia"
              value={country}
              onChangeText={(t) => { setCountry(t); clearError(); setSaved(false); }}
              containerStyle={{ flex: 1 }}
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
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: theme.spacing.xl,
    },
    sectionCard: {
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    chipsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    chipText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
    chipTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    saveButton: {
      marginTop: theme.spacing.lg,
    },
  });

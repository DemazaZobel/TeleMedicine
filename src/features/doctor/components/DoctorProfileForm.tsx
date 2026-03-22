import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, Input, Button, Card } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useDoctorStore } from '../../../store/doctor.store';
import { createDoctorProfileStyles } from '../styles/doctorProfile.styles';
import type { DoctorProfileUpdate } from '../types/doctor.types';

export function DoctorProfileForm() {
  const { theme } = useTheme();
  const styles = useMemo(() => createDoctorProfileStyles(theme), [theme]);

  const {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    error,
    fetchProfile,
    updateProfile,
    clearError,
    isDoctorVerified,
  } = useDoctorStore();

  const [specialization, setSpecialization] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [saved, setSaved] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setSpecialization(profile.specialization ?? '');
      setYearsOfExperience(
        profile.years_of_experience ? String(profile.years_of_experience) : ''
      );
      setConsultationFee(
        profile.consultation_fee ? String(profile.consultation_fee) : ''
      );
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    setSaved(false);
    const payload: DoctorProfileUpdate = {
      specialization: specialization.trim(),
      years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      consultation_fee: consultationFee ? Number(consultationFee) : undefined,
    };
    try {
      await updateProfile(payload);
      setSaved(true);
    } catch {
      // Error is set in the store
    }
  }, [specialization, yearsOfExperience, consultationFee, updateProfile]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Doctor Profile</Text>

        {!isDoctorVerified() && (
          <View style={[styles.errorBanner, { backgroundColor: theme.colors.warningLight }]}>
            <Text style={[styles.errorText, { color: theme.colors.warning }]}>
              ⚠️ Upload credentials in the Documents tab to get verified.
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {saved && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Profile updated successfully!</Text>
          </View>
        )}

        {profile && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Status & Stats</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Verification:</Text>
              <Text style={{ ...theme.typography.body, fontWeight: 'bold', color: profile.is_verified ? theme.colors.success : theme.colors.warning }}>
                {profile.is_verified ? '✅ Verified' : '🟡 Pending Review'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Average Rating:</Text>
              <Text style={{ ...theme.typography.body, fontWeight: 'bold' }}>⭐ {profile.average_rating}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Total Reviews:</Text>
              <Text style={{ ...theme.typography.body, fontWeight: 'bold' }}>{profile.review_count}</Text>
            </View>
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Professional Info</Text>

          <Input
            label="Specialization"
            placeholder="e.g. Cardiology"
            value={specialization}
            onChangeText={(t) => { setSpecialization(t); clearError(); setSaved(false); }}
          />

          <View style={styles.row}>
            <Input
              label="Experience (years)"
              placeholder="0"
              value={yearsOfExperience}
              onChangeText={(t) => { setYearsOfExperience(t); clearError(); setSaved(false); }}
              keyboardType="numeric"
              containerStyle={styles.halfField}
            />
            <Input
              label="Consultation Fee"
              placeholder="0.00"
              value={consultationFee}
              onChangeText={(t) => { setConsultationFee(t); clearError(); setSaved(false); }}
              keyboardType="decimal-pad"
              containerStyle={styles.halfField}
            />
          </View>
        </Card>

        <Button
          title="Save Profile"
          onPress={handleSave}
          loading={isUpdatingProfile || isLoadingProfile}
          fullWidth
          style={styles.submitButton}
        />
      </View>
    </ScreenContainer>
  );
}

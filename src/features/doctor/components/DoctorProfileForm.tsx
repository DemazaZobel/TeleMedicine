import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Button, Card, Input, ScreenContainer } from '../../../components/ui';
import { useDoctorStore } from '../../../store/doctor.store';
import { useTheme } from '../../../theme';
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
    verificationStage,
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
        {/* Premium Profile Header */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing['2xl'] }}>
          <Image 
            source={require('../../../../assets/images/doctor-avatar.png')} 
            style={{ width: 120, height: 120, borderRadius: 60, marginBottom: theme.spacing.md }} 
          />
          <Text style={{ ...theme.typography.h3, color: theme.colors.text }}>Doctor Profile</Text>
          {profile?.is_verified ? (
            <View style={{ backgroundColor: theme.colors.successLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: 8 }}>
              <Text style={{ color: theme.colors.success, fontWeight: '600', fontSize: 12 }}>Verified Practitioner</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: 8 }}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 12 }}>Pending Institutional Review</Text>
            </View>
          )}
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorLight, borderRadius: 12, padding: 16, marginBottom: 24 }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        )}

        {saved && (
          <View style={[styles.successBanner, { backgroundColor: theme.colors.successLight, borderRadius: 12, padding: 16, marginBottom: 24 }]}>
            <Text style={[styles.successText, { color: theme.colors.success, fontWeight: '500' }]}>Profile updated successfully!</Text>
          </View>
        )}

        {profile && (
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ ...theme.typography.h4, color: theme.colors.text, marginBottom: 16, fontWeight: '600' }}>Platform Stats</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Average Rating</Text>
              <Text style={{ ...theme.typography.body, fontWeight: 'bold' }}>★ {profile.average_rating}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Total Consultations Reviews</Text>
              <Text style={{ ...theme.typography.body, fontWeight: 'bold' }}>{profile.review_count}</Text>
            </View>
          </Card>
        )}

        <Card style={{ marginBottom: 24 }}>
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

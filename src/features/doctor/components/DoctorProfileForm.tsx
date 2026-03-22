import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer, Input, Button, Card } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useDoctorStore } from '../../../store/doctorStore';
import { createDoctorProfileStyles } from '../styles/doctorProfile.styles';
import type { ProviderProfileUpdate } from '../types';

export function DoctorProfileForm() {
  const { theme } = useTheme();
  const styles = useMemo(() => createDoctorProfileStyles(theme), [theme]);

  const { profile, isLoading, error, fetchProfile, updateProfile, clearError } =
    useDoctorStore();

  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [saved, setSaved] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setSpecialization(profile.specialization ?? '');
      setLicenseNumber(profile.licenseNumber ?? '');
      setBio(profile.bio ?? '');
      setYearsOfExperience(
        profile.yearsOfExperience ? String(profile.yearsOfExperience) : ''
      );
      setConsultationFee(
        profile.consultationFee ? String(profile.consultationFee) : ''
      );
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    setSaved(false);
    const payload: ProviderProfileUpdate = {
      specialization: specialization.trim(),
      licenseNumber: licenseNumber.trim(),
      bio: bio.trim(),
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      consultationFee: consultationFee ? Number(consultationFee) : undefined,
    };
    try {
      await updateProfile(payload);
      setSaved(true);
    } catch {
      // Error is set in the store
    }
  }, [specialization, licenseNumber, bio, yearsOfExperience, consultationFee, updateProfile]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Doctor Profile</Text>

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

        <Card>
          <Text style={styles.sectionTitle}>Professional Info</Text>

          <Input
            label="Specialization"
            placeholder="e.g. Cardiology"
            value={specialization}
            onChangeText={(t) => { setSpecialization(t); clearError(); setSaved(false); }}
          />

          <Input
            label="License Number"
            placeholder="Medical license number"
            value={licenseNumber}
            onChangeText={(t) => { setLicenseNumber(t); clearError(); setSaved(false); }}
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

          <Input
            label="Bio"
            placeholder="Tell patients about yourself..."
            value={bio}
            onChangeText={(t) => { setBio(t); clearError(); setSaved(false); }}
            multiline
            numberOfLines={4}
          />
        </Card>

        <Button
          title="Save Profile"
          onPress={handleSave}
          loading={isLoading}
          fullWidth
          style={styles.submitButton}
        />
      </View>
    </ScreenContainer>
  );
}

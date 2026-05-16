import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button, Card, Input } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useDoctorStore } from '../../../store/doctor.store';
import { useTheme, Theme } from '../../../theme';
import type { DoctorProfileUpdate } from '../types/doctor.types';

interface DoctorProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DoctorProfileModal({ visible, onClose }: DoctorProfileModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  } = useDoctorStore();

  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [hospital, setHospital] = useState('');
  const [biography, setBiography] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchProfile();
      setSaved(false);
      clearError();
    }
  }, [visible, fetchProfile, clearError]);

  useEffect(() => {
    if (profile && visible) {
      setSpecialization(profile.specialization ?? '');
      setLocation(profile.location ?? '');
      setHospital(profile.current_working_hospital ?? '');
      setBiography(profile.biography ?? '');
      setExperience(profile.experience ?? '');
      setEducation(profile.education ?? '');
      setYoutube(profile.youtube_link ?? '');
      setLinkedin(profile.linkedin_link ?? '');
      setYearsOfExperience(
        profile.years_of_experience ? String(profile.years_of_experience) : ''
      );
      setConsultationFee(
        profile.consultation_fee ? String(profile.consultation_fee) : ''
      );
    }
  }, [profile, visible]);

  const handleSave = useCallback(async () => {
    setSaved(false);
    clearError();
    
    const payload: DoctorProfileUpdate = {
      specialization: specialization.trim(),
      location: location.trim(),
      current_working_hospital: hospital.trim(),
      biography: biography.trim(),
      experience: experience.trim(),
      education: education.trim(),
      youtube_link: youtube.trim(),
      linkedin_link: linkedin.trim(),
      years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      consultation_fee: consultationFee ? Number(consultationFee) : undefined,
    };
    
    try {
      await updateProfile(payload);
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [
    specialization, location, hospital, biography, experience, education, 
    youtube, linkedin, yearsOfExperience, consultationFee, 
    updateProfile, clearError, onClose
  ]);

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Doctor Profile"
      subtitle="Complete your professional profile details."
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../../../../assets/images/doctor-avatar.png')} 
            style={styles.avatar} 
          />
          <Text style={styles.title}>{profile?.is_verified ? 'Verified Practitioner' : 'Profile Configuration'}</Text>
        </View>

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

        <Card style={styles.card}>
          <Input
            label="Specialization"
            placeholder="e.g. Cardiology"
            value={specialization}
            onChangeText={(t) => { setSpecialization(t); clearError(); setSaved(false); }}
          />

          <View style={styles.row}>
            <Input
              label="Location"
              placeholder="e.g. Addis Ababa"
              value={location}
              onChangeText={(t) => { setLocation(t); clearError(); setSaved(false); }}
              containerStyle={styles.halfField}
            />
            <Input
              label="Current Hospital/Clinic"
              placeholder="e.g. Tikur Anbessa"
              value={hospital}
              onChangeText={(t) => { setHospital(t); clearError(); setSaved(false); }}
              containerStyle={styles.halfField}
            />
          </View>

          <Input
            label="Biography"
            placeholder="Tell patients about your medical background..."
            value={biography}
            onChangeText={(t) => { setBiography(t); clearError(); setSaved(false); }}
            multiline
            numberOfLines={3}
            containerStyle={styles.multilineContainer}
          />

          <Input
            label="Education"
            placeholder="e.g. MD from Addis Ababa University"
            value={education}
            onChangeText={(t) => { setEducation(t); clearError(); setSaved(false); }}
            multiline
            numberOfLines={2}
            containerStyle={styles.multilineContainer}
          />

          <Input
            label="Experience"
            placeholder="e.g. Senior Cardiologist at St. Paul's"
            value={experience}
            onChangeText={(t) => { setExperience(t); clearError(); setSaved(false); }}
            multiline
            numberOfLines={2}
            containerStyle={styles.multilineContainer}
          />

          <View style={styles.row}>
            <Input
              label="YouTube Link (Optional)"
              placeholder="https://youtube.com/..."
              value={youtube}
              onChangeText={(t) => { setYoutube(t); clearError(); setSaved(false); }}
              containerStyle={styles.halfField}
              keyboardType="url"
              autoCapitalize="none"
            />
            <Input
              label="LinkedIn (Optional)"
              placeholder="https://linkedin.com/in/..."
              value={linkedin}
              onChangeText={(t) => { setLinkedin(t); clearError(); setSaved(false); }}
              containerStyle={styles.halfField}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

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
              label="Consultation Fee (ETB)"
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
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: theme.spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.text,
      fontWeight: '600',
    },
    card: {
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.lg,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    halfField: {
      flex: 1,
    },
    multilineContainer: {
      marginTop: theme.spacing.md,
    },
    submitButton: {
      marginTop: theme.spacing.md,
    },
    errorBanner: {
      backgroundColor: theme.colors.errorLight,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
    },
    successBanner: {
      backgroundColor: theme.colors.successLight,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    successText: {
      color: theme.colors.success,
      fontWeight: '500',
      fontSize: 14,
      textAlign: 'center',
    },
  });

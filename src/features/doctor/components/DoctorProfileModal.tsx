import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useDoctorStore } from '../../../store/doctor.store';
import { useTheme, Theme } from '../../../theme';
import type { DoctorProfileUpdate } from '../types/doctor.types';

interface DoctorProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  hospital: string;
  duration: string;
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
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAddEducation = () => {
    setEducationList([...educationList, { id: Date.now().toString(), degree: '', institution: '', year: '' }]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducationList(educationList.filter(e => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setEducationList(educationList.map(e => e.id === id ? { ...e, [field]: value } : e));
    clearError();
    setSaved(false);
  };

  const handleAddExperience = () => {
    setExperienceList([...experienceList, { id: Date.now().toString(), role: '', hospital: '', duration: '' }]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceList(experienceList.filter(e => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperienceList(experienceList.map(e => e.id === id ? { ...e, [field]: value } : e));
    clearError();
    setSaved(false);
  };

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
      
      // Parse backend arrays if available
      if (Array.isArray(profile.education)) {
        setEducationList(profile.education.map((e, i) => ({ id: i.toString(), ...e })));
      } else {
        setEducationList([]);
      }

      if (Array.isArray(profile.experience)) {
        setExperienceList(profile.experience.map((e, i) => ({ id: i.toString(), ...e })));
      } else {
        setExperienceList([]);
      }

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
      education: educationList.map(({ id, ...rest }) => rest), // Remove internal ID
      experience: experienceList.map(({ id, ...rest }) => rest),
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
    specialization, location, hospital, biography, educationList, experienceList, 
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

          {/* Education Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity onPress={handleAddEducation} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {educationList.map((edu, index) => (
            <View key={edu.id} style={styles.dynamicItemCard}>
              <View style={styles.dynamicItemHeader}>
                <Text style={styles.dynamicItemTitle}>Degree {index + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveEducation(edu.id)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Degree/Major (e.g. MD, PhD)"
                value={edu.degree}
                onChangeText={(t) => updateEducation(edu.id, 'degree', t)}
              />
              <View style={styles.row}>
                <Input
                  placeholder="Institution (e.g. AAU)"
                  value={edu.institution}
                  onChangeText={(t) => updateEducation(edu.id, 'institution', t)}
                  containerStyle={styles.halfField}
                />
                <Input
                  placeholder="Year (e.g. 2018)"
                  value={edu.year}
                  onChangeText={(t) => updateEducation(edu.id, 'year', t)}
                  containerStyle={styles.halfField}
                />
              </View>
            </View>
          ))}

          {/* Experience Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <TouchableOpacity onPress={handleAddExperience} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {experienceList.map((exp, index) => (
            <View key={exp.id} style={styles.dynamicItemCard}>
              <View style={styles.dynamicItemHeader}>
                <Text style={styles.dynamicItemTitle}>Role {index + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveExperience(exp.id)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Role/Title (e.g. Senior Surgeon)"
                value={exp.role}
                onChangeText={(t) => updateExperience(exp.id, 'role', t)}
              />
              <View style={styles.row}>
                <Input
                  placeholder="Hospital/Clinic"
                  value={exp.hospital}
                  onChangeText={(t) => updateExperience(exp.id, 'hospital', t)}
                  containerStyle={styles.halfField}
                />
                <Input
                  placeholder="Duration (e.g. 2020-Present)"
                  value={exp.duration}
                  onChangeText={(t) => updateExperience(exp.id, 'duration', t)}
                  containerStyle={styles.halfField}
                />
              </View>
            </View>
          ))}

          <View style={styles.divider} />

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
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      fontWeight: '700',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: theme.colors.primary + '15',
      borderRadius: 8,
    },
    addBtnText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    dynamicItemCard: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    dynamicItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    dynamicItemTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xl,
      opacity: 0.5,
    }
  });

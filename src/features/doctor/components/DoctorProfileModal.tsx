import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, Pressable, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  isEditing?: boolean;
}

interface ExperienceItem {
  id: string;
  role: string;
  hospital: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
  isEditing?: boolean;
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
  const [formError, setFormError] = useState('');
  const [showDatePickerId, setShowDatePickerId] = useState<string | null>(null);

  const handleAddEducation = () => {
    setEducationList([...educationList, { id: Date.now().toString(), degree: '', institution: '', year: '', isEditing: true }]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducationList(educationList.filter(e => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setEducationList(educationList.map(e => e.id === id ? { ...e, [field]: value } : e));
    clearError();
    setSaved(false);
  };

  const handleSaveEducation = (id: string) => {
    const edu = educationList.find(e => e.id === id);
    if (!edu?.degree || !edu?.institution || !edu?.year) {
      Alert.alert("Missing Fields", "Please complete all fields for this degree.");
      return;
    }
    updateEducation(id, 'isEditing', false);
  };

  const handleAddExperience = () => {
    setExperienceList([...experienceList, { id: Date.now().toString(), role: '', hospital: '', startYear: '', endYear: '', isCurrent: false, isEditing: true }]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceList(experienceList.filter(e => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setExperienceList(experienceList.map(e => e.id === id ? { ...e, [field]: value } : e));
    clearError();
    setSaved(false);
  };

  const handleSaveExperience = (id: string) => {
    const exp = experienceList.find(e => e.id === id);
    if (!exp?.role || !exp?.hospital || !exp?.startYear || (!exp.isCurrent && !exp?.endYear)) {
      Alert.alert("Missing Fields", "Please complete all fields for this experience.");
      return;
    }
    updateExperience(id, 'isEditing', false);
  };

  const handleYearsChange = (t: string) => {
    setYearsOfExperience(t.replace(/[^0-9]/g, ''));
    clearError();
    setSaved(false);
  };

  const handleFeeChange = (t: string) => {
    let val = t.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    setConsultationFee(val);
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
        setEducationList(profile.education.map((e, i) => ({ id: i.toString(), isEditing: false, ...e })));
      } else {
        setEducationList([]);
      }

      if (Array.isArray(profile.experience)) {
        setExperienceList(profile.experience.map((e, i) => ({ id: i.toString(), isEditing: false, ...e })));
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
    setFormError('');
    
    const parsedYears = yearsOfExperience ? Number(yearsOfExperience) : undefined;
    const parsedFee = consultationFee ? Number(consultationFee) : undefined;

    if (yearsOfExperience && isNaN(parsedYears!)) {
      setFormError('Experience (years) must be a valid number.');
      return;
    }
    if (consultationFee && isNaN(parsedFee!)) {
      setFormError('Consultation Fee must be a valid number.');
      return;
    }
    
    const payload: DoctorProfileUpdate = {
      specialization: specialization.trim(),
      location: location.trim(),
      current_working_hospital: hospital.trim(),
      biography: biography.trim(),
      education: educationList.map(({ id, isEditing, ...rest }) => rest), // Remove internal UI fields
      experience: experienceList.map(({ id, isEditing, ...rest }) => rest),
      youtube_link: youtube.trim(),
      linkedin_link: linkedin.trim(),
      years_of_experience: parsedYears,
      consultation_fee: parsedFee,
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

        {(error || formError) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{formError || error}</Text>
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
          {educationList.map((edu, index) => {
            const isEduComplete = edu.degree.trim() !== '' && edu.institution.trim() !== '' && edu.year.trim() !== '';
            
            return (
              <View key={edu.id} style={styles.dynamicItemCard}>
                <View style={styles.dynamicItemHeader}>
                  <Text style={styles.dynamicItemTitle}>Degree {index + 1}</Text>
                  <View style={styles.dynamicItemActions}>
                    {edu.isEditing ? (
                      <TouchableOpacity 
                        onPress={() => handleSaveEducation(edu.id)} 
                        style={[styles.textActionBtn, !isEduComplete && { opacity: 0.4 }]}
                        disabled={!isEduComplete}
                      >
                        <Text style={styles.textActionBtnSuccess}>Done</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => updateEducation(edu.id, 'isEditing', true)} style={styles.textActionBtn}>
                        <Text style={styles.textActionBtnPrimary}>Edit</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleRemoveEducation(edu.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              
              {edu.isEditing ? (
                <>
                  <Input
                    label="Degree/Major"
                    placeholder="e.g. MD, PhD"
                    value={edu.degree}
                    onChangeText={(t) => updateEducation(edu.id, 'degree', t)}
                    containerStyle={styles.dynamicInputMargin}
                  />
                  <View style={styles.inputStack}>
                    <Input
                      label="Institution"
                      placeholder="e.g. AAU"
                      value={edu.institution}
                      onChangeText={(t) => updateEducation(edu.id, 'institution', t)}
                      containerStyle={styles.dynamicInputMargin}
                    />
                    
                    {/* Date Picker for Graduation Year */}
                    {Platform.OS === 'web' ? (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={styles.dateLabel}>Graduation Date</Text>
                        <input 
                          type="date" 
                          value={edu.year} 
                          onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 12,
                            border: '1px solid ' + theme.colors.border,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            fontSize: 16,
                            fontFamily: 'inherit'
                          }}
                        />
                      </View>
                    ) : (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={styles.dateLabel}>Graduation Date</Text>
                        <Pressable 
                          style={[styles.dateInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} 
                          onPress={() => setShowDatePickerId(edu.id)}
                        >
                          <Text style={{ color: edu.year ? theme.colors.text : theme.colors.placeholder }}>
                            {edu.year || "Select Date"}
                          </Text>
                          <Ionicons name="calendar-outline" size={20} color={theme.colors.textTertiary} />
                        </Pressable>
                        {showDatePickerId === edu.id && (
                          <DateTimePicker
                            value={edu.year ? new Date(edu.year) : new Date()}
                            mode="date"
                            display="default"
                            onChange={(event: any, selectedDate?: Date) => {
                              setShowDatePickerId(null);
                              if (selectedDate) {
                                updateEducation(edu.id, 'year', selectedDate.toISOString().split('T')[0]);
                              }
                            }}
                            maximumDate={new Date()}
                          />
                        )}
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryTitle}>{edu.degree || 'Untitled Degree'}</Text>
                  <Text style={styles.summarySubtitle}>
                    {edu.institution}{edu.institution && edu.year ? ' • ' : ''}{edu.year}
                  </Text>
                </View>
              )}
            </View>
            );
          })}

          {/* Experience Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <TouchableOpacity onPress={handleAddExperience} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {experienceList.map((exp, index) => {
            const isExpComplete = exp.role.trim() !== '' && exp.hospital.trim() !== '' && exp.startYear.trim() !== '' && (exp.isCurrent || exp.endYear.trim() !== '');

            return (
              <View key={exp.id} style={styles.dynamicItemCard}>
                <View style={styles.dynamicItemHeader}>
                  <Text style={styles.dynamicItemTitle}>Role {index + 1}</Text>
                  <View style={styles.dynamicItemActions}>
                    {exp.isEditing ? (
                      <TouchableOpacity 
                        onPress={() => handleSaveExperience(exp.id)} 
                        style={[styles.textActionBtn, !isExpComplete && { opacity: 0.4 }]}
                        disabled={!isExpComplete}
                      >
                        <Text style={styles.textActionBtnSuccess}>Done</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => updateExperience(exp.id, 'isEditing', true)} style={styles.textActionBtn}>
                        <Text style={styles.textActionBtnPrimary}>Edit</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleRemoveExperience(exp.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              
              {exp.isEditing ? (
                <>
                  <Input
                    label="Role/Title"
                    placeholder="e.g. Senior Surgeon"
                    value={exp.role}
                    onChangeText={(t) => updateExperience(exp.id, 'role', t)}
                    containerStyle={styles.dynamicInputMargin}
                  />
                  <View style={styles.inputStack}>
                    <Input
                      label="Hospital/Clinic"
                      placeholder="e.g. Tikur Anbessa"
                      value={exp.hospital}
                      onChangeText={(t) => updateExperience(exp.id, 'hospital', t)}
                      containerStyle={styles.dynamicInputMargin}
                    />
                    
                    <View style={styles.row}>
                      <Input
                        label="Start Year"
                        placeholder="e.g. 2018"
                        value={exp.startYear || ''}
                        onChangeText={(t) => updateExperience(exp.id, 'startYear', t.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        containerStyle={styles.halfField}
                      />
                      {!exp.isCurrent && (
                        <Input
                          label="End Year"
                          placeholder="e.g. 2023"
                          value={exp.endYear || ''}
                          onChangeText={(t) => updateExperience(exp.id, 'endYear', t.replace(/[^0-9]/g, ''))}
                          keyboardType="numeric"
                          containerStyle={styles.halfField}
                        />
                      )}
                    </View>

                    <View style={styles.switchRow}>
                      <Switch 
                        value={exp.isCurrent} 
                        onValueChange={(val) => updateExperience(exp.id, 'isCurrent', val)}
                        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                      />
                      <Text style={styles.switchLabel}>I currently work here</Text>
                    </View>

                  </View>
                </>
              ) : (
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryTitle}>{exp.role || 'Untitled Role'}</Text>
                  <Text style={styles.summarySubtitle}>
                    {exp.hospital} • {exp.startYear} - {exp.isCurrent ? 'Present' : exp.endYear}
                  </Text>
                </View>
              )}
            </View>
            );
          })}

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
              onChangeText={handleYearsChange}
              keyboardType="numeric"
              containerStyle={styles.halfField}
            />
            <Input
              label="Consultation Fee (ETB)"
              placeholder="0.00"
              value={consultationFee}
              onChangeText={handleFeeChange}
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
    inputStack: {
      flexDirection: 'column',
    },
    dynamicInputMargin: {
      marginBottom: theme.spacing.sm,
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
    dynamicItemActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    actionBtn: {
      padding: 4,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.sm,
    },
    switchLabel: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    textActionBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    textActionBtnSuccess: {
      color: theme.colors.success,
      fontWeight: '600',
      fontSize: 14,
    },
    textActionBtnPrimary: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    dateLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 6,
    },
    dateInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
    },
    summaryContainer: {
      paddingVertical: theme.spacing.xs,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    summarySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xl,
      opacity: 0.5,
    }
  });

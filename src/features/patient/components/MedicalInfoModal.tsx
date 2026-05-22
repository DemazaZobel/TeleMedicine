import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [documents, setDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const { maxDate, maxDateString } = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      maxDate: yesterday,
      maxDateString: yesterday.toISOString().split('T')[0],
    };
  }, []);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until confirmed
    if (selectedDate) {
      setDateOfBirth(selectedDate.toISOString().split('T')[0]);
      setSaved(false);
      clearError();
      setLocalError(null);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });
      if (!result.canceled) {
        setDocuments(prev => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

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
    setLocalError(null);

    let formattedDob = dateOfBirth.trim() || null;
    if (formattedDob) {
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

    const formData = new FormData();
    if (formattedDob) formData.append('date_of_birth', formattedDob);
    formData.append('gender', gender.trim());
    formData.append('blood_type', bloodType.trim());
    formData.append('medical_history', medicalHistory.trim() || '');
    formData.append('chronic_conditions', chronicConditions.trim());
    formData.append('allergies', allergies.trim());
    formData.append('address', address.trim());
    formData.append('city', city.trim());
    formData.append('country', country.trim());

    documents.forEach((doc, index) => {
      formData.append('medical_documents', {
        uri: Platform.OS === 'ios' ? doc.uri.replace('file://', '') : doc.uri,
        name: doc.name || `document_${index}`,
        type: doc.mimeType || 'application/pdf',
      } as any);
    });

    try {
      await updateMedicalInfo(formData);
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [
    dateOfBirth, gender, bloodType, medicalHistory,
    documents, updateMedicalInfo, clearError, onClose
  ]);

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Medical Information"
      subtitle="Update your health profile and history."
    >
      <View style={styles.container}>
        {(error || localError) && <Banner variant="error" message={(localError || error) ?? ''} />}
        {saved && <Banner variant="success" message="Medical information updated." />}

        {/* ── Basic Info Section ── */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          {Platform.OS === 'web' ? (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Date of Birth</Text>
              <input 
                type="date" 
                value={dateOfBirth} 
                max={maxDateString}
                onChange={(e) => { 
                  setDateOfBirth(e.target.value); 
                  clearError(); 
                  setLocalError(null);
                  setSaved(false); 
                }}
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
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Date of Birth</Text>
              <Pressable 
                style={[styles.dateInput]} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: dateOfBirth ? theme.colors.text : theme.colors.placeholder }}>
                  {dateOfBirth || "YYYY-MM-DD"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textTertiary} />
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth ? new Date(dateOfBirth) : maxDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={maxDate}
                />
              )}
            </View>
          )}

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
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Documents Upload UI */}
          <Text style={styles.label}>Attachments & Files</Text>
          <View style={styles.documentsContainer}>
            {documents.map((doc, index) => (
              <View key={index} style={styles.documentChip}>
                <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                <Pressable onPress={() => setDocuments(docs => docs.filter((_, i) => i !== index))}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.error} />
                </Pressable>
              </View>
            ))}
            <Button 
              title="Upload File" 
              variant="outline" 
              icon={<Ionicons name="cloud-upload-outline" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />}
              onPress={pickDocument} 
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            />
          </View>
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
    dateInput: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'web' ? 12 : 14,
      backgroundColor: theme.colors.background,
    },
    documentsContainer: {
      gap: 8,
    },
    documentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 8,
    },
    documentName: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text,
    },
  });

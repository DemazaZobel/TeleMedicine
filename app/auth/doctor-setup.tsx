import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, RADII, SPACING } from '../../src/constants/theme';
import { providerService } from '../../src/services/api';

export default function DoctorSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [spec, setSpec] = useState('');
  const [exp, setExp] = useState('');
  const [fee, setFee] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handlePickDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
    });
    if (!res.canceled) setFile(res.assets[0]);
  };

  const handleSubmit = async () => {
    if (!file) return Alert.alert("Missing File", "Please upload your medical license.");
    setLoading(true);

    try {
      // 1. Update Profile info first (FR7)
      await providerService.updateProfile({
        specialization: spec,
        years_of_experience: parseInt(exp),
        consultation_fee: fee,
      });

      // 2. Prepare Multipart Form Data (FR2)
      const formData = new FormData();
      formData.append('document_type', 'Medical License');
      formData.append('license_number', licenseNo);
      // @ts-ignore - React Native FormData requires this structure
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });

      await providerService.uploadDocument(formData);

      Alert.alert("Submitted", "Your profile is now under review by MedLink Admin.");
      router.replace('/doctor/pending' as any);
    } catch (err) {
      Alert.alert("Error", "Submission failed. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Professional Onboarding</Text>
      <Text style={styles.subHeader}>Step {step} of 2</Text>

      {step === 1 ? (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>What is your medical specialization?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. General Practitioner, Cardiologist"
            placeholderTextColor={COLORS.textMuted}
            value={spec}
            onChangeText={setSpec}
          />

          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            value={exp}
            onChangeText={setExp}
          />

          <Text style={styles.label}>Consultation Fee (ETB)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="500.00"
            placeholderTextColor={COLORS.textMuted}
            value={fee}
            onChangeText={setFee}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => spec && exp && fee ? setStep(2) : Alert.alert("Required", "Fill all fields")}
          >
            <Text style={styles.btnText}>Next: Verification Docs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>Medical License Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter license ID"
            placeholderTextColor={COLORS.textMuted}
            value={licenseNo}
            onChangeText={setLicenseNo}
          />

          <TouchableOpacity style={styles.filePicker} onPress={handlePickDocument}>
            <Text style={styles.fileText}>{file ? file.name : "📁 Tap to select Medical License (PDF/JPG)"}</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)}>
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit for Approval</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.l, backgroundColor: COLORS.background, flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: SPACING.xl },
  subHeader: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.l },
  stepContainer: { gap: SPACING.m },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  input: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.m, padding: SPACING.m, color: COLORS.text },
  filePicker: { padding: SPACING.xl, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.primary, borderRadius: RADII.m, alignItems: 'center', backgroundColor: COLORS.surface, marginVertical: SPACING.m },
  fileText: { color: COLORS.primary, fontWeight: '500' },
  primaryBtn: { backgroundColor: COLORS.primary, padding: SPACING.m, borderRadius: RADII.m, flex: 1, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { padding: SPACING.m, flex: 0.4, alignItems: 'center' },
  secondaryBtnText: { color: COLORS.textMuted, fontWeight: '600' },
  row: { flexDirection: 'row', gap: SPACING.m, marginTop: SPACING.l, alignItems: 'center' }
});
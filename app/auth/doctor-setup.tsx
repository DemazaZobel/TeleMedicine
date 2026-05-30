import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, RADII, SPACING } from '../../src/constants/theme';
import { doctorApi } from '../../src/features/doctor/services/doctor.api';

export default function DoctorSetupScreen() {
  const { t } = useTranslation();
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
    if (!file) return Alert.alert(t("errors:missingFile"), t("doctor:uploadLicenseWarning"));
    setLoading(true);

    try {
      // 1. Update Profile info first (FR7)
      await doctorApi.updateDoctorProfile({
        specialization: spec,
        years_of_experience: parseInt(exp),
        consultation_fee: parseFloat(fee),
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

      await doctorApi.uploadDoctorDocument(formData);

      Alert.alert(t("common:submitted"), t("doctor:underReviewDesc"));
      router.replace('/doctor/pending' as any);
    } catch (err) {
      Alert.alert("Error", t("errors:submissionFailedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{t("doctor:professionalOnboarding")}</Text>
      <Text style={styles.subHeader}>Step {step} of 2</Text>

      {step === 1 ? (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>{t("doctor:specializationQuestion")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("doctor:egRole")}
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
            onPress={() => spec && exp && fee ? setStep(2) : Alert.alert(t("errors:required"), t("common:fillAllFields"))}
          >
            <Text style={styles.btnText}>{t("doctor:nextDocs")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>{t("doctor:medicalLicenseNumber")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("doctor:enterLicenseId")}
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
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t("doctor:submitForApproval")}</Text>}
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
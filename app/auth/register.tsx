import React, { useState } from 'react';
import {
  View, TextInput, Text, Alert, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../src/services/api';
import { Role } from '../../src/types/auth';
import { AxiosError } from 'axios';
import { COLORS, SPACING, RADII } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    phone_number: '', password: '', role: 'PATIENT' as Role
  });

  const handleRegister = async () => {
    try {
      const response = await api.post<{ message: string }>('/auth/register/', formData);
      Alert.alert('Success', response.data.message);

      router.push({
        pathname: '/auth/otp',
        params: { email: formData.email }
      } as any);

    } catch (error) {
      const axiosError = error as AxiosError<Record<string, string[]>>;
      const errorData = axiosError.response?.data;

      if (errorData) {
        const firstErrorKey = Object.keys(errorData)[0];
        const firstErrorMessage = errorData[firstErrorKey][0];
        Alert.alert('Error', `${firstErrorKey}: ${firstErrorMessage}`);
      } else {
        Alert.alert('Error', 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Join MedLink</Text>
            <Text style={styles.subtitle}>Quality healthcare, anywhere in Ethiopia.</Text>
          </View>

          <View style={styles.form}>
            <TextInput placeholder="First Name" placeholderTextColor={COLORS.textMuted} style={styles.input} onChangeText={(t) => setFormData({ ...formData, first_name: t })} />
            <TextInput placeholder="Last Name" placeholderTextColor={COLORS.textMuted} style={styles.input} onChangeText={(t) => setFormData({ ...formData, last_name: t })} />
            <TextInput placeholder="Email" placeholderTextColor={COLORS.textMuted} style={styles.input} onChangeText={(t) => setFormData({ ...formData, email: t })} autoCapitalize="none" keyboardType="email-address" />
            <TextInput placeholder="Phone (+251...)" placeholderTextColor={COLORS.textMuted} style={styles.input} onChangeText={(t) => setFormData({ ...formData, phone_number: t })} keyboardType="phone-pad" />
            <TextInput placeholder="Password" placeholderTextColor={COLORS.textMuted} style={styles.input} secureTextEntry onChangeText={(t) => setFormData({ ...formData, password: t })} />

            <Text style={styles.label}>I am a:</Text>
            <TouchableOpacity
              style={styles.roleButton}
              onPress={() => setFormData({ ...formData, role: formData.role === 'PATIENT' ? 'DOCTOR' : 'PATIENT' })}
            >
              <Text style={styles.roleButtonText}>{formData.role === 'PATIENT' ? '😷 Patient' : '🩺 Doctor'}</Text>
              <Text style={styles.roleSubtext}>(Tap to change)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/auth/login' as any)}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Log in</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: SPACING.l, justifyContent: 'center' },
  header: { marginBottom: SPACING.xl, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.s },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.s, marginTop: SPACING.s },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    fontSize: 16,
    color: COLORS.text,
  },
  roleButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    padding: SPACING.m,
    marginBottom: SPACING.l,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.s,
  },
  roleButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  roleSubtext: { fontSize: 14, color: COLORS.textMuted },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    borderRadius: RADII.m,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: SPACING.l, alignItems: 'center' },
  linkText: { color: COLORS.textMuted, fontSize: 15 },
  linkTextBold: { color: COLORS.primary, fontWeight: 'bold' },
});
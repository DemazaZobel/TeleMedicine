import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Medlink, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use the platform. These terms apply to all users including patients, doctors, and visitors.',
  },
  {
    title: '2. Description of Services',
    body: `Medlink provides a digital healthcare platform that enables:

- Patients to discover, evaluate, and book appointments with verified doctors.
- Doctors to manage their profiles, availability, and patient appointments.
- Online and in-person consultations between patients and healthcare providers.
- Secure health record management and appointment tracking.

Medlink is a technology platform and is not itself a healthcare provider. We do not provide medical advice, diagnosis, or treatment.`,
  },
  {
    title: '3. User Accounts',
    body: `To use Medlink's core features, you must create an account. You agree to:

- Provide accurate, current, and complete registration information.
- Maintain the security of your password and not share it with others.
- Notify us immediately of any unauthorized use of your account.
- Take responsibility for all activities that occur under your account.

Medlink reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`,
  },
  {
    title: '4. Doctor Verification and Responsibility',
    body: `Medlink verifies doctor credentials through a multi-step process. However:

- Medlink does not guarantee the accuracy or completeness of doctor-provided information.
- Doctors are independent healthcare professionals and are solely responsible for the medical advice and treatment they provide.
- Medlink is not liable for any medical outcomes resulting from consultations arranged through the platform.
- Patients should exercise independent judgment when selecting a healthcare provider.`,
  },
  {
    title: '5. Appointments and Cancellations',
    body: `By booking an appointment, you agree to:

- Attend at the scheduled time or cancel at least 24 hours in advance for a full refund.
- Provide accurate health information relevant to your consultation.
- Respect the doctor's time and professional boundaries.

Doctors reserve the right to cancel appointments at their discretion. In such cases, patients receive a full refund.`,
  },
  {
    title: '6. Payments',
    body: 'All payments are processed securely through Chapa. By completing a payment, you authorize Medlink to charge the stated amount. Refund eligibility is governed by our cancellation policy. Medlink is not responsible for errors or delays caused by the payment processor.',
  },
  {
    title: '7. Prohibited Conduct',
    body: `You agree not to:

- Use Medlink for any unlawful purpose or in violation of applicable Ethiopian law.
- Impersonate any person or entity, including medical professionals.
- Upload false, misleading, or fraudulent information.
- Interfere with or disrupt the integrity of the platform.
- Attempt to gain unauthorized access to any part of Medlink's systems.
- Use the platform to send unsolicited communications or spam.

Violations may result in immediate account suspension and legal action.`,
  },
  {
    title: '8. Intellectual Property',
    body: 'All content on Medlink, including the logo, design, text, and software, is the property of Medlink and protected by Ethiopian copyright law. You may not reproduce, distribute, or create derivative works from our content without written permission.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'To the maximum extent permitted by law, Medlink shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to medical outcomes, data loss, or service interruptions. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.',
  },
  {
    title: '10. Changes to Terms',
    body: 'Medlink reserves the right to update these Terms of Service at any time. Significant changes will be communicated via email or in-app notification. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms of Service are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes arising from these terms shall be resolved in the courts of Addis Ababa, Ethiopia.',
  },
  {
    title: '12. Contact',
    body: 'For questions about these Terms of Service, contact us at:\n\nEmail: legal@medlink.et\nPhone: +251 911 234 567\nAddress: Addis Ababa, Ethiopia',
  },
];

export default function TermsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isMobile = width < 768;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: isMobile ? 16 : 48, paddingTop: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>Back</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: isMobile ? 16 : 64, paddingVertical: isMobile ? 24 : 48, gap: 32 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: isMobile ? 26 : 32, fontWeight: '800', color: theme.colors.text }}>{t("common:termsOfService")}</Text>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>Last updated: May 2026</Text>
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24 }}>
              Please read these Terms of Service carefully before using the Medlink platform.
            </Text>
          </View>

          {SECTIONS.map((s) => (
            <View key={s.title} style={{ gap: 10 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text }}>{s.title}</Text>
              <View style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: theme.colors.primary }} />
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 24 }}>{s.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
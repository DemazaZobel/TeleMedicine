import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect the following types of information when you use Medlink:

- Personal Information: Name, email address, phone number, date of birth, and gender when you register.
- Health Information: Medical history, appointment details, consultation notes, and any information you share with doctors through the platform.
- Usage Data: Device type, operating system, IP address, pages visited, and actions taken within the app to improve our services.
- Payment Information: Transaction references processed through Chapa. We do not store full card numbers or bank account details.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to:

- Provide and operate the Medlink platform and its features.
- Facilitate appointment bookings between patients and doctors.
- Send appointment confirmations, reminders, and updates.
- Process payments securely through our payment partner Chapa.
- Improve our platform through analytics and user feedback.
- Comply with legal obligations under Ethiopian law.

We do not use your personal or medical information for advertising purposes.`,
  },
  {
    title: '3. How We Share Your Information',
    body: `We share your information only in the following circumstances:

- With Doctors: Relevant medical and appointment information is shared with the doctor you book with, solely for the purpose of providing healthcare services.
- With Payment Processors: Transaction information is shared with Chapa to process payments securely.
- Legal Requirements: We may disclose information if required by Ethiopian law, court order, or government authority.
- Business Transfers: In the event of a merger or acquisition, your data may be transferred to the new entity under the same privacy protections.

We never sell your personal or medical information to third parties.`,
  },
  {
    title: '4. Data Security',
    body: `Medlink implements industry-standard security measures to protect your information:

- All data is transmitted using TLS 1.3 encryption.
- Passwords are hashed using bcrypt and never stored in plain text.
- Medical records are stored on secure servers with access controls.
- Regular security audits are conducted to identify and address vulnerabilities.

While we implement strong safeguards, no digital system is 100% immune to breaches. We will notify you promptly in the event of a data breach affecting your information.`,
  },
  {
    title: '5. Your Rights',
    body: `As a Medlink user, you have the right to:

- Access: Request a copy of the personal data we hold about you.
- Correction: Request corrections to inaccurate or incomplete data.
- Deletion: Request the deletion of your account and associated data.
- Portability: Request your data in a structured, machine-readable format.
- Withdrawal of Consent: Withdraw consent for data processing at any time.

To exercise any of these rights, contact us at privacy@medlink.et.`,
  },
  {
    title: '6. Data Retention',
    body: 'We retain your personal information for as long as your account is active or as needed to provide services. Medical records are retained for a minimum of 7 years in accordance with Ethiopian healthcare regulations. Upon account deletion, personal data is removed within 30 days, except where retention is legally required.',
  },
  {
    title: '7. Children\'s Privacy',
    body: 'Medlink is not intended for use by individuals under the age of 18 without parental consent. We do not knowingly collect personal information from minors. If you believe a child has provided us with their information, please contact us immediately at support@medlink.et.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or in-app notification. Continued use of Medlink after changes are posted constitutes acceptance of the updated policy.',
  },
  {
    title: '9. Contact Us',
    body: 'If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact our Data Protection Officer at:\n\nEmail: privacy@medlink.et\nPhone: +251 911 234 567\nAddress: Addis Ababa, Ethiopia',
  },
];

export default function PrivacyScreen() {
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
            <Text style={{ fontSize: isMobile ? 26 : 32, fontWeight: '800', color: theme.colors.text }}>{t("common:privacyPolicy")}</Text>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>Last updated: May 2026</Text>
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24 }}>
              This Privacy Policy describes how Medlink collects, uses, and protects your personal and medical information when you use our platform.
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
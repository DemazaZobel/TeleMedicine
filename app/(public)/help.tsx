import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

const HELP_CATEGORIES = [
  {
    icon: 'calendar-outline',
    title: 'Booking Appointments',
    color: '#10B981',
    articles: [
      { title: 'How to book an appointment', body: 'To book an appointment, browse the Available Doctors section, select a doctor, tap "Book Appointment", choose a date and time slot, confirm your details, and complete payment if required. You will receive a confirmation notification once your appointment is confirmed by the doctor.' },
      { title: 'How to cancel or reschedule', body: 'Go to the Appointments tab, find your appointment, tap the three-dot menu, and select Cancel or Request Reschedule. Cancellations made 24 hours before the appointment are fully refunded. Same-day cancellations may incur a fee.' },
      { title: 'What happens after I book?', body: 'After booking, your appointment enters a REQUESTED state. The doctor reviews and confirms it. You will receive a push notification and email when confirmed. You can track the status in your Appointments tab.' },
    ],
  },
  {
    icon: 'videocam-outline',
    title: 'Online Consultations',
    color: '#3B82F6',
    articles: [
      { title: 'How do online consultations work?', body: 'Once your online appointment is confirmed, a secure meeting link is generated. At your appointment time, tap the meeting link from your Appointments tab to join the video consultation. Ensure you have a stable internet connection.' },
      { title: 'What devices can I use?', body: 'Online consultations work on iOS, Android, and web browsers. We recommend using a device with a front-facing camera and a stable Wi-Fi connection for the best experience.' },
    ],
  },
  {
    icon: 'lock-closed-outline',
    title: 'Account & Security',
    color: '#8B5CF6',
    articles: [
      { title: 'How do I reset my password?', body: 'On the login screen, tap "Forgot Password", enter your registered email address, and follow the link sent to your email to set a new password. Password reset links expire after 30 minutes.' },
      { title: 'Is my data secure?', body: 'All data transmitted on Medlink is encrypted using TLS 1.3. Medical records and personal information are stored securely on our servers and are never sold to third parties. See our Privacy Policy for full details.' },
      { title: 'How do I delete my account?', body: 'Go to Profile > Settings > Account > Delete Account. This action is irreversible and permanently removes all your data, appointments, and medical history from our systems within 30 days.' },
    ],
  },
  {
    icon: 'card-outline',
    title: 'Payments',
    color: '#F59E0B',
    articles: [
      { title: 'What payment methods are accepted?', body: 'Medlink accepts payments via Chapa, which supports Telebirr, CBE Birr, bank transfers, and major credit/debit cards. All transactions are processed securely.' },
      { title: 'How do refunds work?', body: 'Refunds are processed within 3–5 business days back to your original payment method. Cancellations made at least 24 hours before the appointment receive a full refund. Same-day cancellations are non-refundable unless the doctor cancels.' },
    ],
  },
];

function HelpArticle({ title, body, theme }: { title: string; body: string; theme: any }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((p) => !p)} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: 14, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: theme.colors.text }}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textSecondary} />
      </View>
      {open && <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 }}>{body}</Text>}
    </Pressable>
  );
}

export default function HelpScreen() {
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
            <Text style={{ fontSize: isMobile ? 26 : 32, fontWeight: '800', color: theme.colors.text }}>Help Center</Text>
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24 }}>Find answers to common questions about using Medlink.</Text>
          </View>

          {HELP_CATEGORIES.map((cat) => (
            <View key={cat.title} style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: cat.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text }}>{cat.title}</Text>
              </View>
              <View style={{ backgroundColor: theme.colors.surface, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border }}>
                {cat.articles.map((a) => (
                  <HelpArticle key={a.title} title={a.title} body={a.body} theme={theme} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

const FAQS = [
  { q: 'What is Medlink?', a: 'Medlink is Ethiopia\'s digital healthcare platform that connects patients with verified doctors for in-person and online appointments. We make it easy to find the right specialist, book appointments instantly, and manage your health records in one place.' },
  { q: 'Is Medlink free to use?', a: 'Creating an account and browsing doctors on Medlink is completely free. Appointment fees are set by individual doctors and vary by specialty and consultation type. You only pay when you confirm a booking.' },
  { q: 'How are doctors verified on Medlink?', a: 'Every doctor on Medlink goes through a multi-step verification process including license verification, credential review, and identity confirmation. Verified doctors display a blue checkmark on their profile.' },
  { q: 'Can I book same-day appointments?', a: 'Yes, if a doctor has same-day availability slots open, you can book them instantly. Filter by "Available Today" in the search section to find doctors with immediate openings.' },
  { q: 'What happens if a doctor cancels my appointment?', a: 'If a doctor cancels your confirmed appointment, you will receive a full refund within 3–5 business days and a notification to rebook. We prioritize your time and aim to notify you as early as possible.' },
  { q: 'Is my medical information private?', a: 'Yes. All your health data is encrypted and stored securely. Medlink complies with Ethiopian health data regulations and never shares or sells your personal medical information to third parties.' },
  { q: 'Can I use Medlink outside Addis Ababa?', a: 'Yes. Medlink is available across Ethiopia. Online consultations can be accessed from anywhere with an internet connection. In-person appointments are available at the doctor\'s listed location.' },
  { q: 'How do I become a doctor on Medlink?', a: 'Doctors can register through the Sign Up page by selecting the Doctor role. After completing your profile and submitting your credentials, our team reviews and verifies your account within 2–5 business days.' },
  { q: 'What languages does Medlink support?', a: 'Medlink currently supports English. Amharic language support is planned for a future update.' },
  { q: 'How do I contact Medlink support?', a: 'You can reach us via the Contact Us section on this page, by email at support@medlink.et, or by calling +251 911 234 567 during working hours (Mon–Fri, 8am–6pm EAT).' },
];

export default function FAQScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isMobile = width < 768;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: isMobile ? 16 : 48, paddingTop: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>Back</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: isMobile ? 16 : 64, paddingVertical: isMobile ? 24 : 48, gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: isMobile ? 26 : 32, fontWeight: '800', color: theme.colors.text }}>Frequently Asked Questions</Text>
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24 }}>Everything you need to know about Medlink.</Text>
          </View>

          <View style={{ backgroundColor: theme.colors.surface, borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: theme.colors.border }}>
            {FAQS.map((faq, idx) => (
              <Pressable
                key={idx}
                onPress={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{ borderBottomWidth: idx < FAQS.length - 1 ? 1 : 0, borderBottomColor: theme.colors.border, paddingVertical: 16, gap: 10 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: theme.colors.text }}>{faq.q}</Text>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: openIndex === idx ? theme.colors.primary : theme.colors.border + '44', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={openIndex === idx ? 'remove' : 'add'} size={16} color={openIndex === idx ? '#fff' : theme.colors.textSecondary} />
                  </View>
                </View>
                {openIndex === idx && (
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 }}>{faq.a}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
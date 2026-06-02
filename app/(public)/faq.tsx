import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

export default function FAQScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isMobile = width < 768;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const FAQS = [
    { q: t('faq:q1'), a: t('faq:a1') },
    { q: t('faq:q2'), a: t('faq:a2') },
    { q: t('faq:q3'), a: t('faq:a3') },
    { q: t('faq:q4'), a: t('faq:a4') },
    { q: t('faq:q5'), a: t('faq:a5') },
    { q: t('faq:q6'), a: t('faq:a6') },
    { q: t('faq:q7'), a: t('faq:a7') },
    { q: t('faq:q8'), a: t('faq:a8') },
    { q: t('faq:q9'), a: t('faq:a9') },
    { q: t('faq:q10'), a: t('faq:a10') },
  ];

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{
          paddingHorizontal: isMobile ? 16 : 48,
          paddingTop: 24,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>
              {t('common:back')}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: isMobile ? 16 : 64, paddingVertical: isMobile ? 24 : 48, gap: 24 }}>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: isMobile ? 26 : 32, fontWeight: '800', color: theme.colors.text }}>
              {t('common:faqTitle')}
            </Text>
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24 }}>
              {t('common:faqPromo')}
            </Text>
          </View>

          <View style={{ backgroundColor: theme.colors.surface, borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: theme.colors.border }}>
            {FAQS.map((faq, idx) => (
              <Pressable
                key={idx}
                onPress={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{
                  borderBottomWidth: idx < FAQS.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.border,
                  paddingVertical: 16,
                  gap: 10
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: theme.colors.text }}>
                    {faq.q}
                  </Text>

                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: openIndex === idx ? theme.colors.primary : theme.colors.border + '44',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons
                      name={openIndex === idx ? 'remove' : 'add'}
                      size={16}
                      color={openIndex === idx ? '#fff' : theme.colors.textSecondary}
                    />
                  </View>
                </View>

                {openIndex === idx && (
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 }}>
                    {faq.a}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
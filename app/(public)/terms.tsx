import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

export default function TermsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isMobile = width < 768;

  const SECTIONS = [
    { title: t('terms:section1Title'), body: t('terms:section1Body') },
    { title: t('terms:section2Title'), body: t('terms:section2Body') },
    { title: t('terms:section3Title'), body: t('terms:section3Body') },
    { title: t('terms:section4Title'), body: t('terms:section4Body') },
    { title: t('terms:section5Title'), body: t('terms:section5Body') },
    { title: t('terms:section6Title'), body: t('terms:section6Body') },
    { title: t('terms:section7Title'), body: t('terms:section7Body') },
    { title: t('terms:section8Title'), body: t('terms:section8Body') },
    { title: t('terms:section9Title'), body: t('terms:section9Body') },
    { title: t('terms:section10Title'), body: t('terms:section10Body') },
    { title: t('terms:section11Title'), body: t('terms:section11Body') },
    { title: t('terms:section12Title'), body: t('terms:section12Body') },
  ];

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>

        {/* Header */}
        <View style={{
          paddingHorizontal: isMobile ? 16 : 48,
          paddingTop: 24,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={{ marginLeft: 6, color: theme.colors.primary, fontWeight: '600' }}>
              {t('terms:back')}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: isMobile ? 16 : 64, paddingVertical: isMobile ? 24 : 48 }}>

          <Text style={{ fontSize: isMobile ? 26 : 32, fontWeight: '800', color: theme.colors.text }}>
            {t('common:termsOfService')}
          </Text>

          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 8 }}>
            {t('terms:lastUpdated')}
          </Text>

          <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24, marginTop: 8 }}>
            {t('terms:intro')}
          </Text>

          {SECTIONS.map((s, index) => (
            <View key={index} style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text }}>
                {s.title}
              </Text>

              <View style={{
                width: 32,
                height: 2,
                borderRadius: 1,
                backgroundColor: theme.colors.primary,
                marginTop: 10
              }} />

              <Text style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                lineHeight: 24,
                marginTop: 10
              }}>
                {s.body}
              </Text>
            </View>
          ))}

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
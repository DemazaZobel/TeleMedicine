import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isMobile = width < 768;

  const SECTIONS = [
    {
      title: t('privacy:section1Title'),
      body: t('privacy:section1Body'),
    },
    {
      title: t('privacy:section2Title'),
      body: t('privacy:section2Body'),
    },
    {
      title: t('privacy:section3Title'),
      body: t('privacy:section3Body'),
    },
    {
      title: t('privacy:section4Title'),
      body: t('privacy:section4Body'),
    },
    {
      title: t('privacy:section5Title'),
      body: t('privacy:section5Body'),
    },
    {
      title: t('privacy:section6Title'),
      body: t('privacy:section6Body'),
    },
    {
      title: t('privacy:section7Title'),
      body: t('privacy:section7Body'),
    },
    {
      title: t('privacy:section8Title'),
      body: t('privacy:section8Body'),
    },
    {
      title: t('privacy:section9Title'),
      body: t('privacy:section9Body'),
    },
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
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600', marginLeft: 6 }}>
              {t('privacy:back')}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: isMobile ? 16 : 64, paddingVertical: isMobile ? 24 : 48 }}>

          <Text style={{ fontSize: isMobile ? 26 : 32, fontWeight: '800', color: theme.colors.text }}>
            {t('common:privacyPolicy')}
          </Text>

          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 8 }}>
            {t('privacy:lastUpdated')}
          </Text>

          <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24, marginTop: 8 }}>
            {t('privacy:intro')}
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
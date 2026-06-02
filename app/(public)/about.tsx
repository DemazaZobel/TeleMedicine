import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions, ImageBackground } from 'react-native';
import logo from '../../assets/images/logo.png';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

const TEAM = [
  {
    name: 'Bemnet Beyene',
    roleKey: 'frontendDeveloper',
    gender: 'F',
    color: '#8B5CF6',
    
  },
  {
    name: 'Birtukan Kussa',
    roleKey: 'frontendDeveloper',
    gender: 'F',
    color: '#EC4899',
    
  },
  {
    name: 'Betlehem Seleshi',
    roleKey: 'frontendDeveloper',
    gender: 'F',
    color: '#F59E0B',
    
  },
  {
    name: 'Beni Fessiha',
    roleKey: 'backendDeveloper',
    gender: 'M',
    color: '#3B82F6',
    
  },
  {
    name: 'Bekalu Bekele',
    roleKey: 'backendDeveloper',
    gender: 'M',
    color: '#10B981',
    
  },
];

const FEATURES = [
  {
    icon: 'phone-portrait-outline',
    titleKey: 'crossPlatformTitle',
    descKey: 'crossPlatformDesc',
  },
  {
    icon: 'server-outline',
    titleKey: 'backendTitle',
    descKey: 'backendDesc',
  },
  {
    icon: 'shield-checkmark-outline',
    titleKey: 'verificationTitle',
    descKey: 'verificationDesc',
  },
  {
    icon: 'videocam-outline',
    titleKey: 'onlineTitle',
    descKey: 'onlineDesc',
  },
  {
    icon: 'notifications-outline',
    titleKey: 'remindersTitle',
    descKey: 'remindersDesc',
  },
  {
    icon: 'card-outline',
    titleKey: 'paymentTitle',
    descKey: 'paymentDesc',
  },
];

export default function AboutScreen() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isMobile = width < 768;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{
          paddingHorizontal: isMobile ? 16 : 48,
          paddingTop: 24,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>
              {t('about:back')}
            </Text>
          </Pressable>

          <Image source={logo} style={{ width: 100, height: 32, resizeMode: 'contain' }} />
          <View style={{ width: 60 }} />
        </View>

        {/* Hero */}
        <View style={{
          backgroundColor: isDark ? '#0a5c4e' : '#ecfdf5',
          paddingHorizontal: isMobile ? 24 : 64,
          paddingVertical: isMobile ? 40 : 64,
          alignItems: 'center',
          gap: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? theme.colors.border : '#bbf7d0'
        }}>
          <Image source={logo} style={{ width: 300, height: 50, resizeMode: 'contain' }} />
          <Text style={{
            fontSize: isMobile ? 28 : 36,
            fontWeight: '800',
            color: isDark ? '#fff' : '#065f46',
            textAlign: 'center'
          }}>
            {t('about:title')}
          </Text>

          <Text style={{
            fontSize: 15,
            color: isDark ? '#dcfce7' : '#047857',
            textAlign: 'center',
            lineHeight: 24,
            maxWidth: 600
          }}>
            {t('about:subtitle')}
          </Text>
        </View>

        <View style={{ paddingHorizontal: isMobile ? 16 : 64, paddingVertical: isMobile ? 32 : 56, gap: 48 }}>

          {/* Story */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text }}>
              {t('about:ourStory')}
            </Text>

            <View style={{ width: 48, height: 3, backgroundColor: theme.colors.primary }} />

            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 26 }}>
              {t('about:story1')}
            </Text>

            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 26 }}>
              {t('about:story2')}
            </Text>
          </View>

          {/* Features */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text }}>
              {t('about:whatWeBuilt')}
            </Text>

            <View style={{ width: 48, height: 3, backgroundColor: theme.colors.primary }} />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {FEATURES.map((item) => (
                <View
                  key={item.titleKey}
                  style={{
                    width: isMobile ? '100%' : '47%',
                    flexDirection: 'row',
                    gap: 14,
                    backgroundColor: theme.colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }}
                >
                  <Ionicons name={item.icon as any} size={22} color={theme.colors.primary} />

                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text }}>
                      {t(`about:${item.titleKey}`)}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 }}>
                      {t(`about:${item.descKey}`)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Team */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text }}>
              {t('about:meetTeam')}
            </Text>

            <Text style={{ fontSize: 15, color: theme.colors.textSecondary }}>
              {t('about:teamIntro')}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {TEAM.map((m) => (
                <View
                  key={m.name}
                  style={{
                    width: isMobile ? '100%' : '30%',
                    backgroundColor: theme.colors.surface,
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }}
                >
                  <View style={{ height: 6, backgroundColor: m.color }} />

                  <View style={{ padding: 20, alignItems: 'center', gap: 8 }}>
                    <View style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: m.color + '22',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ionicons name="person" size={36} color={m.color} />
                    </View>

                    <Text style={{ fontWeight: '800', color: theme.colors.text }}>
                      {m.name}
                    </Text>

                    <Text style={{ fontSize: 12, color: m.color, fontWeight: '700' }}>
                      {t(`about:${m.roleKey}`)}
                    </Text>

                   
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Mission */}
          <View style={{
            backgroundColor: isDark ? '#0a5c4e' : '#ecfdf5',
            padding: isMobile ? 24 : 36,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? theme.colors.border : '#bbf7d0'
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text }}>
              {t('about:missionTitle')}
            </Text>

            <Text style={{ marginTop: 8, color: theme.colors.textSecondary, lineHeight: 26 }}>
              {t('about:missionBody')}
            </Text>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
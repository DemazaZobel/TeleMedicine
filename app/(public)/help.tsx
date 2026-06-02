import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';

const HELP_CATEGORIES = [
  {
    icon: 'calendar-outline',
    titleKey: 'help:bookingTitle',
    color: '#10B981',
    articles: [
      {
        titleKey: 'help:bookAppointmentTitle',
        bodyKey: 'help:bookAppointmentBody',
      },
      {
        titleKey: 'help:cancelRescheduleTitle',
        bodyKey: 'help:cancelRescheduleBody',
      },
      {
        titleKey: 'help:afterBookingTitle',
        bodyKey: 'help:afterBookingBody',
      },
    ],
  },
  {
    icon: 'videocam-outline',
    titleKey: 'help:onlineTitle',
    color: '#3B82F6',
    articles: [
      {
        titleKey: 'help:onlineWorksTitle',
        bodyKey: 'help:onlineWorksBody',
      },
      {
        titleKey: 'help:devicesTitle',
        bodyKey: 'help:devicesBody',
      },
    ],
  },
  {
    icon: 'lock-closed-outline',
    titleKey: 'help:accountTitle',
    color: '#8B5CF6',
    articles: [
      {
        titleKey: 'help:resetPasswordTitle',
        bodyKey: 'help:resetPasswordBody',
      },
      {
        titleKey: 'help:dataSecureTitle',
        bodyKey: 'help:dataSecureBody',
      },
      {
        titleKey: 'help:deleteAccountTitle',
        bodyKey: 'help:deleteAccountBody',
      },
    ],
  },
  {
    icon: 'card-outline',
    titleKey: 'help:paymentsTitle',
    color: '#F59E0B',
    articles: [
      {
        titleKey: 'help:paymentMethodsTitle',
        bodyKey: 'help:paymentMethodsBody',
      },
      {
        titleKey: 'help:refundsTitle',
        bodyKey: 'help:refundsBody',
      },
    ],
  },
];

function HelpArticle({
  title,
  body,
  theme,
}: {
  title: string;
  body: string;
  theme: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen((p) => !p)}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: 14,
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
          }}
        >
          {title}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.textSecondary}
        />
      </View>

      {open && (
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 22,
          }}
        >
          {body}
        </Text>
      )}
    </Pressable>
  );
}

export default function HelpScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isMobile = width < 768;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 48,
            paddingTop: 24,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.primary,
                fontWeight: '600',
              }}
            >
              {t('help:back')}
            </Text>
          </Pressable>
        </View>

        {/* CONTENT */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 64,
            paddingVertical: isMobile ? 24 : 48,
            gap: 32,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: isMobile ? 26 : 32,
                fontWeight: '800',
                color: theme.colors.text,
              }}
            >
              {t('common:helpCenter')}
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: theme.colors.textSecondary,
                lineHeight: 24,
              }}
            >
              {t('common:faqDesc')}
            </Text>
          </View>

          {HELP_CATEGORIES.map((cat) => (
            <View key={cat.titleKey} style={{ gap: 12 }}>
              {/* CATEGORY HEADER */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: cat.color + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={cat.color}
                  />
                </View>

                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: theme.colors.text,
                  }}
                >
                  {t(cat.titleKey)}
                </Text>
              </View>

              {/* ARTICLES */}
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                {cat.articles.map((a) => (
                  <HelpArticle
                    key={a.titleKey}
                    title={t(a.titleKey)}
                    body={t(a.bodyKey)}
                    theme={theme}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
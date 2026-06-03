import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  TouchableOpacity
} from 'react-native';
import femaleDoc from '../../assets/images/femaleDoc.jpeg';
import logo from '../../assets/images/logo.png';
import { Card, ScreenContainer } from '../../src/components/ui';
import type { ProviderSearchResult } from '../../src/features/doctor/types/doctor.types';
import { DoctorDetailsModal } from '../../src/features/patient';
import { useTranslation } from '../../src/i18n';
import { setItemAsync } from '../../src/services/storage';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme'; 
import { useAmharicInput } from '../../src/hooks/useAmharicInput';
import {TranslitGuideModal} from "../../src/components/ui/TranslitGuideModal";
import apiClient from '../../src/services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const FAKE_DOCTORS: any[] = [
  { id: '1', first_name: 'Samuel', last_name: 'Bekele', specialization: 'Cardiologist', average_rating: 4.9, years_of_experience: 12, is_verified: true, hospital: 'Zewditu Memorial Hospital' },
  { id: '2', first_name: 'Lidiya', last_name: 'Tesfaye', specialization: 'Pediatrician', average_rating: 4.8, years_of_experience: 8, is_verified: true, hospital: 'Tikur Anbessa Hospital' },
  { id: '3', first_name: 'Mulugeta', last_name: 'Alemu', specialization: 'Dermatologist', average_rating: 4.7, years_of_experience: 10, is_verified: true, hospital: "St. Paul's Hospital" },
  { id: '4', first_name: 'Hana', last_name: 'Wondimu', specialization: 'Gynecologist', average_rating: 4.9, years_of_experience: 15, is_verified: true, hospital: 'Ayder Referral Hospital' },
  { id: '5', first_name: 'Ermias', last_name: 'Getachew', specialization: 'General Practitioner', average_rating: 4.6, years_of_experience: 6, is_verified: true, hospital: 'Menelik II Hospital' },
  { id: '6', first_name: 'Bethlehem', last_name: 'Haile', specialization: 'Cardiologist', average_rating: 4.8, years_of_experience: 11, is_verified: true, hospital: 'Black Lion Hospital' },
  { id: '7', first_name: 'Dawit', last_name: 'Girma', specialization: 'Dermatologist', average_rating: 4.7, years_of_experience: 9, is_verified: true, hospital: 'Tikur Anbessa Hospital' },
  { id: '8', first_name: 'Tigist', last_name: 'Mengistu', specialization: 'Pediatrician', average_rating: 4.9, years_of_experience: 13, is_verified: true, hospital: 'Yekatit 12 Hospital' },
];

const FEATURE_KEYS = ['item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5'] as const;
const FEATURE_ICONS = ['calendar-outline', 'videocam-outline', 'notifications-outline', 'location-outline', 'document-text-outline', 'time-outline'] as const;



// Specialty keys used for i18n lookup — values come from translation files
const SPECIALTY_KEYS = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Gynecologist', 'General'] as const;
type SpecialtyKey = typeof SPECIALTY_KEYS[number];

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiologist: '#EF4444',
  Dermatologist: '#8B5CF6',
  Pediatrician: '#F59E0B',
  Gynecologist: '#EC4899',
  General: '#10B981',
  'General Practitioner': '#10B981',
  default: '#3B82F6',
};

const SOCIAL_LINKS = [
  { icon: 'logo-twitter', label: 'X' },
  { icon: 'logo-instagram', label: 'Instagram' },
  { icon: 'logo-tiktok', label: 'TikTok' },
  { icon: 'logo-facebook', label: 'Facebook' },
];

interface SectionProps {
  theme: Theme;
  isDark: boolean;
  isMobile: boolean;
  width: number;
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name="star" size={size} color={i < Math.floor(rating) ? '#F59E0B' : theme.colors.border} />
      ))}
      <Text style={{ fontSize: size - 1, color: theme.colors.textSecondary, marginLeft: 3, fontWeight: '600' }}>{rating}</Text>
    </View>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavBarProps extends SectionProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onLogin: () => void;
  onSignup: () => void;
  menuAnim: Animated.Value;
  navItems: { label: string; onPress: () => void }[];
}

function NavBar({ theme, isMobile, menuOpen, onToggleMenu, onLogin, onSignup, menuAnim, navItems }: NavBarProps) {
  const { i18n, t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const menuOpacity = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const menuTranslateY = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  const ThemeToggle = () => (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.8}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: 6,
      }}
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={18}
        color={isDark ? '#139746ff' : '#287552ff'}
      />
    </TouchableOpacity>
  );

  const LanguageButton = ({ label, value }: { label: string; value: string }) => {
    const active = i18n.language === value;
    return (
      <TouchableOpacity
        onPress={() => {
          i18n.changeLanguage(value);
          setItemAsync('preferred_language', value);
        }}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          backgroundColor: active ? theme.colors.primary + '15' : 'transparent',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '700', color: active ? theme.colors.primary : theme.colors.text }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: isMobile ? 12 : 32, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background, zIndex: 100 }}>
        <Image source={logo} style={{ width: isMobile ? 96 : 110, height: isMobile ? 32 : 36, flexShrink: 0 }} resizeMode="contain" />

        {!isMobile && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LanguageButton label={t('common:langEN')} value="en" />
              <LanguageButton label="አማ" value="am" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {navItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  style={{ marginLeft: index === 0 ? 0 : 28 }}
                >
                  <Text style={{ fontSize: 13, color: theme.colors.text, fontWeight: '500' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemeToggle />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onLogin}
                style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.primary, marginRight: 10 }}
              >
                <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '700' }}>
                  {t('common:login')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onSignup}
                style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, backgroundColor: theme.colors.primary }}
              >
                <Text style={{ fontSize: 13, color: '#fff', fontWeight: '700' }}>
                  {t('common:signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {isMobile && (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <ThemeToggle />
            <TouchableOpacity
              onPress={onLogin}
              activeOpacity={0.8}
              style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.primary, minHeight: 36, justifyContent: 'center', marginRight: 6 }}
            >
              <Text style={{ fontSize: 12, color: theme.colors.primary, fontWeight: '700' }}>
                {t('common:login')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSignup}
              activeOpacity={0.8}
              style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.primary, minHeight: 36, justifyContent: 'center', marginRight: 6 }}
            >
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>
                {t('common:signUp')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onToggleMenu}
              activeOpacity={0.8}
              style={{ width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
            >
              <Ionicons name={menuOpen ? 'close' : 'menu'} size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {menuOpen && isMobile && (
        <Animated.View style={{ backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: 20, paddingVertical: 12, zIndex: 99, opacity: menuOpacity, transform: [{ translateY: menuTranslateY }] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <LanguageButton label={t('common:langEN')} value="en" />
            <LanguageButton label="አማ" value="am" />
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              }}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={14}
                color={isDark ? '#0d8c2dff' : '#111117ff'}
                style={{ marginRight: 5 }}
              />
              <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#087d37ff' : '#020203ff' }}>
                {isDark ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>
          </View>

          {navItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border + '55' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

// ─── Hero Section ─────────────────────────────────────────────────────────────
// Drop-in replacement for HeroSection in PublicHomeScreen.
// Only the floating card icons/backgrounds changed — everything else is identical
// to the rest of the file (Ionicons, Animated, theme.colors, t(), same structure).

function HeroSection({ theme, isDark, isMobile, onGetStarted, onLogin }: SectionProps & { onGetStarted: () => void; onLogin: () => void }) {
  const { t } = useTranslation();
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    const makeFloat = (anim: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: -10, duration: 2200, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])).start();
    makeFloat(floatAnim1, 0);
    makeFloat(floatAnim2, 700);
    makeFloat(floatAnim3, 1400);
  }, [fadeAnim, floatAnim1, floatAnim2, floatAnim3]);

  // ── Mobile layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Animated.View style={{ opacity: fadeAnim, backgroundColor: theme.colors.background }}>
        <View style={{ width: '100%', height: 260, overflow: 'hidden', position: 'relative' }}>
          <Image source={femaleDoc} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000018' }} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.primary, lineHeight: 36, letterSpacing: -0.5, marginBottom: 12 }}>
            {t('common:qualityHealthcare')}
          </Text>

          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22, marginBottom: 16 }}>
            {t('common:heroSubtitle')}{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{t('common:anytimeAnywhere')}</Text>
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={onGetStarted}
              activeOpacity={0.85}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                marginRight: 8, backgroundColor: '#10B981', paddingVertical: 14,
                borderRadius: 14, minHeight: 48, elevation: 5,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, marginRight: 6 }}>
                {t('common:getStarted')}
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onLogin}
              activeOpacity={0.85}
              style={{
                flex: 1, alignItems: 'center', justifyContent: 'center',
                paddingVertical: 14, borderRadius: 14, minHeight: 48,
                borderWidth: 2, borderColor: '#10B981', backgroundColor: theme.colors.background,
              }}
            >
              <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 15 }}>
                {t('common:login')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
            {[
              { icon: 'shield-checkmark-outline', label: t('common:trustedDoctors') },
              { icon: 'lock-closed-outline', label: t('common:securePrivate') },
              { icon: 'location-outline', label: t('common:acrossEthiopia') },
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: theme.colors.surface, borderRadius: 20,
                  paddingHorizontal: 10, paddingVertical: 5,
                  borderWidth: 1, borderColor: theme.colors.border,
                  marginRight: 6, marginBottom: 6,
                }}
              >
                <Ionicons name={item.icon as any} size={11} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Stats pills — mobile */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              { dot: '#10B981', label: t('common:patients') },
              // ribbon-outline = accreditation/quality, replaces generic star
              { icon: 'ribbon-outline', iconColor: '#F59E0B', label: t('common:rating') },
              // medkit-outline = clinical equipment, replaces generic heart
              { icon: 'medkit-outline', iconColor: '#3B82F6', label: t('common:doctors') },
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: theme.colors.surface, borderRadius: 20,
                  paddingHorizontal: 10, paddingVertical: 5,
                  borderWidth: 1, borderColor: theme.colors.border,
                  marginRight: 6, marginBottom: 6,
                }}
              >
                {item.dot
                  ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: item.dot, marginRight: 4 }} />
                  : <Ionicons name={item.icon as any} size={11} color={item.iconColor} style={{ marginRight: 4 }} />
                }
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.colors.text }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  }

  // ── Desktop layout ───────────────────────────────────────────────────────────
  return (
    <Animated.View style={{ opacity: fadeAnim, flexDirection: 'row', minHeight: 580, overflow: 'hidden' }}>

      {/* Left: copy + CTAs */}
      <View style={{
        width: '36%', zIndex: 2, paddingLeft: 58, paddingRight: 0, paddingVertical: 56,
        justifyContent: 'center', alignItems: 'center', gap: 24,
        backgroundColor: theme.colors.background,
      }}>
        <Text style={{ fontSize: 42, fontWeight: '800', color: theme.colors.primary, lineHeight: 52, letterSpacing: -1, textAlign: 'center' }}>
          {t('common:qualityHealthcare')}
        </Text>
        <Text style={{ fontSize: 16, color: theme.colors.textSecondary, lineHeight: 28, maxWidth: 400, textAlign: 'center' }}>
          {t('common:heroSubtitle')}{' '}
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{t('common:anytimeAnywhere')}</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', paddingRight: 22 }}>
          <TouchableOpacity
            onPress={onGetStarted}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14,
              shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{t('common:getStarted')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogin}
            activeOpacity={0.85}
            style={{ paddingHorizontal: 48, paddingVertical: 16, borderRadius: 14, borderWidth: 2, borderColor: theme.colors.primary }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 16 }}>{t('common:login')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {[
            { icon: 'shield-checkmark-outline', label: t('common:trustedDoctors') },
            { icon: 'lock-closed-outline', label: t('common:securePrivate') },
            { icon: 'location-outline', label: t('common:acrossEthiopia') },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={item.icon as any} size={15} color={theme.colors.primary} />
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Right: image + floating cards */}
      <View style={{ width: '64%', position: 'relative' }}>
        <Image source={femaleDoc} style={{ width: '100%', height: '100%' }} resizeMode="cover" />

        {/* Left-edge fade to match background */}
        <View
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '15%', flexDirection: 'row' }}
          pointerEvents="none"
        >
          <View style={{ flex: 3, backgroundColor: theme.colors.background }} />
          <View style={{ flex: 1, backgroundColor: theme.colors.background, opacity: 0.85 }} />
          <View style={{ flex: 1, backgroundColor: theme.colors.background, opacity: 0.6 }} />
          <View style={{ flex: 1, backgroundColor: theme.colors.background, opacity: 0.35 }} />
          <View style={{ flex: 1, backgroundColor: theme.colors.background, opacity: 0.15 }} />
          <View style={{ flex: 1, backgroundColor: theme.colors.background, opacity: 0.05 }} />
        </View>

        {/* ── Card 1: Doctors — medkit-outline (clinical bag) instead of heart ── */}
        <Animated.View style={{ position: 'absolute', top: 40, left: '18%', transform: [{ translateY: floatAnim1 }] }}>
          <View style={{
            backgroundColor: isDark ? '#1e293bfa' : '#fffffff4',
            borderRadius: 16, padding: 12,
            flexDirection: 'row', alignItems: 'center', gap: 10,
            borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0',
          }}>
            <View style={{
              width: 34, height: 34, borderRadius: 17,
              // Blue tint — clinical/trustworthy, distinct from the red heart
              backgroundColor: isDark ? '#1e3a5f' : '#DBEAFE',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="medkit-outline" size={17} color="#185FA5" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#f1f5f9' : '#111' }}>
                {t('common:doctors')}
              </Text>
              <Text style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#666' }}>
                {t('common:verifiedSpecialists')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Card 2: Rating — ribbon-outline (accreditation) instead of star ── */}
        <Animated.View style={{ position: 'absolute', top: 40, right: 24, transform: [{ translateY: floatAnim2 }] }}>
          <View style={{
            backgroundColor: isDark ? '#1e293bfa' : '#fffffff4',
            borderRadius: 16, padding: 12,
            flexDirection: 'row', alignItems: 'center', gap: 10,
            borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0',
          }}>
            <View style={{
              width: 34, height: 34, borderRadius: 17,
              // Amber tint kept — ribbon reads as quality award, amber = excellence
              backgroundColor: isDark ? '#3d2c00' : '#FEF3C7',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="ribbon-outline" size={17} color="#B45309" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#f1f5f9' : '#111' }}>
                {t('common:rating')}
              </Text>
              <Text style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#666' }}>
                {t('common:averageScore')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Card 3: Available Now — pulse dot + time-outline (clock) ── */}
        <Animated.View style={{ position: 'absolute', bottom: 60, right: 24, transform: [{ translateY: floatAnim3 }] }}>
          <View style={{
            backgroundColor: isDark ? '#1e293bfa' : '#fffffff4',
            borderRadius: 16, padding: 12,
            flexDirection: 'row', alignItems: 'center', gap: 8,
            borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0',
          }}>
            {/* Green pulse dot — live availability signal */}
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
            {/* Clock icon — anchors "now" without feeling like a generic alarm */}
            <Ionicons name="time-outline" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#f1f5f9' : '#111' }}>
              {t('common:availableNow')}
            </Text>
          </View>
        </Animated.View>

        {/* ── Card 4: Patients — stacked avatars (unchanged, already appropriate) ── */}
        <View style={{ position: 'absolute', bottom: 60, left: '18%' }}>
          <View style={{
            backgroundColor: isDark ? '#1e293bfa' : '#fffffff4',
            borderRadius: 16, padding: 12,
            flexDirection: 'row', alignItems: 'center', gap: 10,
            borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0',
          }}>
            <View style={{ flexDirection: 'row' }}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center', justifyContent: 'center',
                    marginLeft: i === 0 ? 0 : -9,
                    borderWidth: 2, borderColor: isDark ? '#1e293b' : '#fff',
                  }}
                >
                  <Ionicons name="person" size={12} color="#fff" />
                </View>
              ))}
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#f1f5f9' : '#111' }}>
                {t('common:patients')}
              </Text>
              <Text style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#666' }}>
                {t('common:trustMedlink')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Search Section ───────────────────────────────────────────────────────────

interface SearchSectionProps extends SectionProps {
  searchQuery?: string;
  setSearchQuery?: (s: string) => void;
  translitEnabled?: boolean;
  setTranslitEnabled?: (b: boolean) => void;
}

function SearchSection({
  theme,
  isMobile,
  searchQuery = '',
  setSearchQuery,
  translitEnabled = false,
  setTranslitEnabled,
}: SearchSectionProps) {
  const { t } = useTranslation();
  const [guideVisible, setGuideVisible] = useState(false);

  const { displayValue, handleChange, reset } = useAmharicInput({
    enabled: translitEnabled,
    onChangeText: (amharicText, _latinText) => {
      setSearchQuery?.(amharicText);
    },
  });

  const handleToggleTranslit = () => {
    setTranslitEnabled?.(!translitEnabled);
    reset();
    setSearchQuery?.('');
  };

  return (
    <View style={{ paddingHorizontal: isMobile ? 16 : 32, marginTop: isMobile ? 20 : 32 }}>
      <TranslitGuideModal
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
        theme={theme}
      />

      <View style={{
        backgroundColor: '#ecfdf5', borderRadius: 20, padding: isMobile ? 18 : 26,
        borderWidth: 1, borderColor: '#bbf7d0',
        shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
      }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#065f46', marginBottom: 4 }}>
          {t('common:findRightDoctor')}
        </Text>
        <Text style={{ fontSize: 13, color: '#047857', marginBottom: 18, lineHeight: 20 }}>
          {t('patient:desc')}
        </Text>

        <View style={{ gap: 12 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff',
          }}>
            <Ionicons name="search-outline" size={17} color="#047857" />

            <TextInput
              placeholder={t('common:searchPlaceholder')}
              placeholderTextColor="#6ee7b7"
              value={translitEnabled ? displayValue : searchQuery}
              onChangeText={translitEnabled ? handleChange : setSearchQuery}
              style={{
                flex: 1, fontSize: 14, color: '#065f46',
                ...Platform.select({ web: { outlineStyle: 'none' } as any }),
              }}
            />

            {/* Tap = toggle, Long press = open guide */}
            <TouchableOpacity
              onPress={handleToggleTranslit}
              onLongPress={() => setGuideVisible(true)}
              delayLongPress={400}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: translitEnabled ? '#ecfdf5' : '#f1f5f9',
                borderWidth: 1.5,
                borderColor: translitEnabled ? '#10b981' : '#cbd5e1',
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 5,
                gap: 5,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: translitEnabled ? '#059669' : '#94a3b8' }}>
                Ha
              </Text>
              <Text style={{ fontSize: 10, color: translitEnabled ? '#6ee7b7' : '#cbd5e1' }}>|</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: !translitEnabled ? '#475569' : '#a7f3d0' }}>
                {t('common:letterA')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hint shown when transliteration is active */}
          {translitEnabled && (
            <View style={{
              backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10,
              flexDirection: 'row', alignItems: 'center', gap: 8,
              borderWidth: 1, borderColor: '#bbf7d0',
            }}>
              <Text style={{ fontSize: 16 }}>💡</Text>
              <Text style={{ flex: 1, fontSize: 12, color: '#065f46', lineHeight: 18 }}>
                {t('common:translitHint')}{' '}
                <Text style={{ fontWeight: '800' }}>selam</Text>
                {' → ሰላም. '}
                {t('common:translitLongPressHint', { button: 'Ha|A' })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────

function DoctorCard({ doctor, index, theme, isDark, onPress, onBook }: { doctor: any; index: number; theme: Theme; isDark: boolean; onPress: () => void; onBook: () => void }) {
  const { t } = useTranslation();
  const isAvailable = index % 3 !== 2;
  const specKey = Object.keys(SPECIALTY_COLORS).find((k) => (doctor.specialization || '').toLowerCase().includes(k.toLowerCase())) || 'default';
  const specColor = SPECIALTY_COLORS[specKey];

  return (
    <TouchableOpacity onPress={onBook} activeOpacity={0.92}>
      <View style={{ width: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 }}>
        <View style={{ width: '100%', height: 180, backgroundColor: isDark ? '#1a2e2a' : '#e9fbf4', alignItems: 'center', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: specColor }} />
          <View style={{ position: 'absolute', top: 14, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: isAvailable ? '#D1FAE5' : '#FEF3C7' }}>
            
          </View>
          <View style={{ width: 130, height: 160, borderRadius: 12, backgroundColor: specColor + '22', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
            {doctor.profile_image ? (
              <Image source={{ uri: doctor.profile_image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            ) : (
              <Ionicons name="person" size={110} color={specColor + 'bb'} style={{ marginBottom: -10 }} />
            )}
          </View>
        </View>
        <View style={{ padding: 14, gap: 6, backgroundColor: theme.colors.background }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: theme.colors.text, textAlign: 'center' }} numberOfLines={1}>
            Dr. {doctor.first_name} {doctor.last_name}
          </Text>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: specColor, textAlign: 'center' }} numberOfLines={1}>
              {doctor.specialization || 'General Practitioner'}
            </Text>
            <View style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: specColor }} />
          </View>
          <Text style={{ fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center' }} numberOfLines={1}>
            {doctor.hospital || 'Tikur Anbessa Hospital'}
          </Text>
          <Text style={{ fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center' }}>
            {doctor.years_of_experience || 8}+ {t('common:yearsExperience')}
          </Text>
          <View style={{ alignItems: 'center', marginVertical: 2 }}>
            <StarRating rating={Number(doctor.average_rating || 4.7)} size={13} />
          </View>
          {(() => {
            const socialLinks = [
              { icon: 'logo-linkedin' as const, url: doctor.linkedin },
              { icon: 'logo-facebook' as const, url: doctor.facebook },
              { icon: 'logo-twitter' as const, url: doctor.twitter },
              { icon: 'logo-instagram' as const, url: doctor.instagram },
            ].filter((s) => !!s.url);
            return socialLinks.length > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 4 }}>
                {socialLinks.map(({ icon, url }) => (
                  <TouchableOpacity key={icon} activeOpacity={0.6}>
                    <Ionicons name={icon} size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null;
          })()}
          <TouchableOpacity
            onPress={onBook}
            activeOpacity={0.85}
            style={{ width: '100%', backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{t('common:bookAppointment')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Doctors Section ──────────────────────────────────────────────────────────

function DoctorsSection({
  theme, isDark, isMobile, doctors, isLoading, hasFetchError,
  searchQuery, selectedSpecialty, onSelectSpecialty, onSelectDoctor,
  onBook, onViewAll, hasMore, isLoadingMore, onLoadMore,
}: SectionProps & {
  doctors: any[];
  isLoading: boolean;
  hasFetchError: boolean;
  searchQuery: string;
  selectedSpecialty: string;
  onSelectSpecialty: (s: string) => void;
  onSelectDoctor: (d: any) => void;
  onBook: () => void;
  onViewAll: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation();

  // Translated specialty labels — keys map to i18n translation keys
  const specialtyLabels: Record<SpecialtyKey, string> = {
    All: t('common:specialtyAll'),
    Cardiologist: t('common:specialtyCardiologist'),
    Dermatologist: t('common:specialtyDermatologist'),
    Pediatrician: t('common:specialtyPediatrician'),
    Gynecologist: t('common:specialtyGynecologist'),
    General: t('common:specialtyGeneral'),
  };

  const isSearching = searchQuery.trim().length > 0;
  const hasResults = doctors.length > 0;

  return (
    <View style={{ marginTop: isMobile ? 28 : 44, paddingHorizontal: isMobile ? 16 : 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: '800', color: theme.colors.text }}>
          {t('common:availableDoctors')}
        </Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>{t('common:viewAllBtn')}</Text>
          <Ionicons name="arrow-forward" size={13} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Specialty filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
          {SPECIALTY_KEYS.map((s) => {
            const isActive = s === 'All'
              ? !selectedSpecialty || selectedSpecialty === 'All'
              : selectedSpecialty === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => onSelectSpecialty(s)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.background,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#fff' : theme.colors.textSecondary }}>
                  {specialtyLabels[s]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Loading skeletons */}
      {isLoading && (
        <FlatList
          horizontal
          data={Array.from({ length: 5 })}
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingVertical: 8, paddingRight: 16 }}
          renderItem={() => (
            <Card style={{ width: 200, borderRadius: 20, overflow: 'hidden' }}>
              <View style={{ width: '100%', height: 180, backgroundColor: theme.colors.border }} />
              <View style={{ padding: 14, gap: 8 }}>
                <View style={{ height: 11, width: '80%', borderRadius: 6, backgroundColor: theme.colors.border, alignSelf: 'center' }} />
                <View style={{ height: 9, width: '55%', borderRadius: 5, backgroundColor: theme.colors.border, alignSelf: 'center' }} />
                <View style={{ height: 32, width: '100%', borderRadius: 10, backgroundColor: theme.colors.border, marginTop: 4 }} />
              </View>
            </Card>
          )}
        />
      )}

      {/* Empty / no-results state */}
      {!isLoading && !hasResults && (
        <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
          <Ionicons name="search-outline" size={40} color={theme.colors.textSecondary} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.text }}>
            {isSearching ? t('common:noSearchResults') : t('common:noDoctorsFound')}
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 20 }}>
            {isSearching
              ? t('common:noSearchResultsDesc')
              : t('common:noDoctorsFoundDesc')}
          </Text>
        </View>
      )}

      {/* Doctor cards */}
      {!isLoading && hasResults && (
        <FlatList
          horizontal
          data={doctors}
          keyExtractor={(item, i) => item?.id ?? String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingVertical: 8, paddingRight: 16 }}
          renderItem={({ item: doctor, index }) => (
            <DoctorCard
              doctor={doctor}
              index={index}
              theme={theme}
              isDark={isDark}
              onPress={() => onSelectDoctor(doctor)}
              onBook={onBook}
            />
          )}
        />
      )}

      {hasMore && !isLoadingMore && !isLoading && hasResults && (
        <TouchableOpacity
          onPress={onLoadMore}
          activeOpacity={0.8}
          style={{
            alignSelf: 'center',
            marginTop: 16,
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.colors.primary + '66',
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>{t('common:viewAllBtn')}</Text>
        </TouchableOpacity>
      )}

      {isLoadingMore && (
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>{t('common:loading')}</Text>
        </View>
      )}
    </View>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection({ theme, isDark, isMobile }: SectionProps) {
  const { t } = useTranslation();
  const connectorAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(connectorAnim, { toValue: 1, duration: 1000, delay: 300, useNativeDriver: false }).start();
  }, [connectorAnim]);

  const steps = [
    { num: '1', icon: 'search-outline', title: t('common:stepSearchTitle'), desc: t('common:stepSearchDesc') },
    { num: '2', icon: 'calendar-outline', title: t('common:stepBookTitle'), desc: t('common:stepBookDesc') },
    { num: '3', icon: 'videocam-outline', title: t('common:stepConsultTitle'), desc: t('common:stepConsultDesc') },
  ];

  return (
    <View style={{ marginTop: isMobile ? 40 : 60, paddingHorizontal: isMobile ? 16 : 32, alignItems: 'center' }}>
      <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text, textAlign: 'center' }}>{t('common:howMedlinkWorks')}</Text>
      <View style={{ width: 48, height: 3, borderRadius: 2, backgroundColor: theme.colors.primary, marginTop: 10, marginBottom: 36 }} />
      <View style={[{ width: '100%', gap: 32 }, !isMobile && { flexDirection: 'row', justifyContent: 'space-between' }]}>
        {steps.map((step, idx) => (
          <View key={step.num} style={{ alignItems: 'center', flex: isMobile ? undefined : 1, gap: 12, position: 'relative' }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: isDark ? theme.colors.surface : '#ecfdf5', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: isDark ? theme.colors.border : '#bbf7d0', position: 'relative' }}>
              <View style={{ position: 'absolute', top: -6, right: -6, width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{step.num}</Text>
              </View>
              <Ionicons name={step.icon as any} size={34} color={theme.colors.primary} />
            </View>
            {idx < 2 && !isMobile && (
              <Animated.View style={{ position: 'absolute', left: '60%', top: 42, height: 2, backgroundColor: theme.colors.primary + '44', width: connectorAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }) }} />
            )}
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, textAlign: 'center' }}>{step.title}</Text>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 220 }}>{step.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

function FeaturesSection({ theme, isDark, isMobile }: SectionProps) {
  const { t } = useTranslation();
  return (
    <View style={{ marginTop: isMobile ? 40 : 56, paddingHorizontal: isMobile ? 16 : 32 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
        {FEATURE_KEYS.map((key, idx) => (
          <Card key={key} style={{ width: isMobile ? '47%' : '31%', borderRadius: 16, padding: 18, gap: 10, marginBottom: 2 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isDark ? theme.colors.surface : '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={FEATURE_ICONS[idx] as any} size={22} color={theme.colors.primary} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, lineHeight: 19 }}>{t(`common:${key}.title`)}</Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 }}>{t(`common:${key}.desc`)}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────

function TestimonialsSection({ theme, isMobile, width }: SectionProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const cardWidth = isMobile ? width - 64 : Math.min(420, width * 0.32);
  const gap = 16;
  const TESTIMONIALS = [1, 2, 3, 4].map((i) => ({
    id: `tm-${i}`,
    name: t(`common:testimonial${i}Name`),
    rating: 5,
    text: t(`common:testimonial${i}Text`),
  }));

  const slideTo = useCallback((idx: number) => {
    Animated.spring(slideAnim, { toValue: -idx * (cardWidth + gap), useNativeDriver: true, tension: 60, friction: 10 }).start();
    setActiveIndex(idx);
  }, [slideAnim, cardWidth, gap]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % TESTIMONIALS.length;
        slideTo(next);
        return next;
      });
    }, 3800);
    return () => clearInterval(timer);
  }, [slideTo]);

  return (
    <View style={{ marginTop: isMobile ? 48 : 64, alignItems: 'center' }}>
      <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text, textAlign: 'center' }}>{t('common:whatPatientsSay')}</Text>
      <View style={{ width: 48, height: 3, borderRadius: 2, backgroundColor: theme.colors.primary, marginTop: 10, marginBottom: 32 }} />
      <View style={{ width: '100%', overflow: 'hidden', paddingHorizontal: isMobile ? 16 : 32 }}>
        <Animated.View style={{ flexDirection: 'row', gap, transform: [{ translateX: slideAnim }] }}>
          {TESTIMONIALS.map((item, idx) => {
            const isCenter = idx === activeIndex;
            return (
              <Animated.View key={item.id} style={{ width: cardWidth, transform: [{ scale: isCenter ? 1.04 : 0.95 }] }}>
                <Card style={{ borderRadius: 18, padding: 22, gap: 12, borderWidth: isCenter ? 1.5 : 1, borderColor: isCenter ? theme.colors.primary + '66' : theme.colors.border, shadowColor: isCenter ? theme.colors.primary : '#000', shadowOpacity: isCenter ? 0.12 : 0.04, shadowRadius: isCenter ? 16 : 4, elevation: isCenter ? 6 : 1 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={28} color={theme.colors.primary + '55'} />
                  <Text style={{ fontSize: isCenter ? 15 : 13, fontWeight: isCenter ? '600' : '400', color: isCenter ? theme.colors.text : theme.colors.textSecondary, lineHeight: isCenter ? 26 : 22, fontStyle: 'italic' }}>{item.text}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isCenter ? theme.colors.primary : theme.colors.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: isCenter ? '#fff' : theme.colors.primary }}>{item.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: isCenter ? '800' : '600', color: theme.colors.text }}>{item.name}</Text>
                      <StarRating rating={item.rating} size={isCenter ? 13 : 11} />
                    </View>
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 }}>
        {TESTIMONIALS.map((_, idx) => (
          <TouchableOpacity key={idx} onPress={() => slideTo(idx)} activeOpacity={0.7}>
            <View style={{ width: idx === activeIndex ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: idx === activeIndex ? theme.colors.primary : theme.colors.border }} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────


function ContactSection({ theme, isDark, isMobile }: SectionProps) {
  const { i18n, t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [translitEnabled, setTranslitEnabled] = useState(i18n.language === 'am');
  const [guideVisible, setGuideVisible] = useState(false);

  const nameInput = useAmharicInput({
    enabled: translitEnabled,
    onChangeText: (amharic) => setName(amharic),
  });

  const subjectInput = useAmharicInput({
    enabled: translitEnabled,
    onChangeText: (amharic) => setSubject(amharic),
  });

  const messageInput = useAmharicInput({
    enabled: translitEnabled,
    onChangeText: (amharic) => setMessage(amharic),
  });

  useEffect(() => {
    setTranslitEnabled(i18n.language === 'am');
  }, [i18n.language]);

  const handleToggleTranslit = () => {
    const next = !translitEnabled;
    setTranslitEnabled(next);
    // Reset all inputs when toggling
    nameInput.reset();
    subjectInput.reset();
    messageInput.reset();
    setName('');
    setSubject('');
    setMessage('');
  };

  const handleSend = useCallback(async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(t('common:missingFields'), t('common:fillNameEmailMessage'));
      return;
    }
  
    setSending(true);
    try {
      await apiClient.post('/contact/', {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
  
      setSent(true);
      setName(''); setEmail(''); setSubject(''); setMessage('');
      nameInput.reset(); subjectInput.reset(); messageInput.reset();
      setTimeout(() => setSent(false), 4000);
    } catch (error: any) {
      const data = error?.response?.data;
      const msg = data?.detail ?? data?.message ?? t('common:errorGeneric');
      Alert.alert(t('common:errorTitle'), error?.response ? msg : t('common:errorNetwork'));
    } finally {
      setSending(false);
    }
  }, [name, email, subject, message, t, nameInput, subjectInput, messageInput]);

  return (
    <View style={{ marginTop: isMobile ? 48 : 64, paddingHorizontal: isMobile ? 16 : 32 }}>
      <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text, textAlign: 'center' }}>
        {t('common:contactUsTitle')}
      </Text>
      <View style={{ width: 48, height: 3, borderRadius: 2, backgroundColor: theme.colors.primary, marginTop: 10, marginBottom: 32, alignSelf: 'center' }} />

      {/* Transliteration Guide Modal */}
      <TranslitGuideModal
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
        theme={theme}
      />

      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: 20, padding: isMobile ? 20 : 28, borderWidth: 1, borderColor: theme.colors.border, gap: 14 }}>

          {/* Header with ሀ/A toggle */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.text }}>
              {t('common:sendAMessage')}
            </Text>

            {/* Tap = toggle, Long press = open guide */}
            <TouchableOpacity
              onPress={handleToggleTranslit}
              onLongPress={() => setGuideVisible(true)}
              delayLongPress={400}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: translitEnabled ? '#ecfdf5' : '#f1f5f9',
                borderWidth: 1.5,
                borderColor: translitEnabled ? '#10b981' : '#cbd5e1',
                borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, gap: 5,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: translitEnabled ? '#059669' : '#94a3b8' }}>ሀ</Text>
              <Text style={{ fontSize: 10, color: translitEnabled ? '#6ee7b7' : '#cbd5e1' }}>|</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: !translitEnabled ? '#475569' : '#a7f3d0' }}>
                {t('common:letterA')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hint text when transliteration is on */}
          {translitEnabled && (
            <View style={{
              backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10,
              flexDirection: 'row', alignItems: 'center', gap: 8,
              borderWidth: 1, borderColor: '#bbf7d0',
            }}>
              <Text style={{ fontSize: 16 }}>💡</Text>
              <Text style={{ flex: 1, fontSize: 12, color: '#065f46', lineHeight: 18 }}>
                {t('common:translitHint')}{' '}
                <Text style={{ fontWeight: '800' }}>selam</Text>
                {' → ሰላም. '}
                {t('common:translitLongPressHint', { button: 'Ha|A' })}
              </Text>
            </View>
          )}

          {sent && (
            <View style={{ backgroundColor: '#ecfdf5', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={{ fontSize: 14, color: '#065f46', fontWeight: '600' }}>{t('common:sentMessage')}</Text>
            </View>
          )}

          {/* Name + Email row */}
          <View style={[{ gap: 14 }, !isMobile && { flexDirection: 'row' }]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('common:fullName')}
              </Text>
              {/* ── FIXED: uses nameInput hook ── */}
              <TextInput
                value={translitEnabled ? nameInput.displayValue : name}
                onChangeText={(text) => {
                  if (translitEnabled) nameInput.handleChange(text);
                  else setName(text);
                }}
                placeholder={t('common:placeholderName')}
                placeholderTextColor={theme.colors.textSecondary}
                style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.colors.text, backgroundColor: theme.colors.background }}
              />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('common:emailAddress')}
              </Text>
              {/* Email never transliterates */}
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('common:placeholderEmail')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.colors.text, backgroundColor: theme.colors.background }}
              />
            </View>
          </View>

          {/* Subject */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('common:subject')}
            </Text>
            {/* ── FIXED: uses subjectInput hook ── */}
            <TextInput
              value={translitEnabled ? subjectInput.displayValue : subject}
              onChangeText={(text) => {
                if (translitEnabled) subjectInput.handleChange(text);
                else setSubject(text);
              }}
              placeholder={t('common:placeholderSubject')}
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.colors.text, backgroundColor: theme.colors.background }}
            />
          </View>

          {/* Message */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('common:message')}
            </Text>
            {/* ── FIXED: uses messageInput hook ── */}
            <TextInput
              value={translitEnabled ? messageInput.displayValue : message}
              onChangeText={(text) => {
                if (translitEnabled) messageInput.handleChange(text);
                else setMessage(text);
              }}
              placeholder={t('common:placeholderMessage')}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.colors.text, backgroundColor: theme.colors.background, minHeight: 120 }}
            />
          </View>

          {/* Send button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.85}
            style={{ backgroundColor: sending ? theme.colors.primary + '88' : theme.colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {sending ? t('common:sending') : t('common:sendMessage')}
            </Text>
            {!sending && <Ionicons name="send" size={16} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Download CTA Section ─────────────────────────────────────────────────────

function DownloadCTASection({ theme, isDark, isMobile }: SectionProps) {
  const { t } = useTranslation();
  const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  const handleShare = useCallback(async () => {
    try { await Share.share({ message: t('common:sharePromoMessage') }); } catch {}
  }, [t]);

  if (isNativeMobile) {
    return (
      <View style={{ margin: 16, borderRadius: 22, backgroundColor: isDark ? '#0a5c4e' : '#0d8b78', padding: 24, overflow: 'hidden', position: 'relative' }}>
        <Ionicons name="heart" size={100} color="#ffffff0a" style={{ position: 'absolute', top: -20, right: 20 }} />
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 }}>{t('common:enjoyingMedlink')}</Text>
        <Text style={{ fontSize: 13, color: '#dcfce7', lineHeight: 20, marginBottom: 20 }}>{t('common:appPromoMessage')}</Text>
        <View style={{ gap: 12 }}>
          <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff22', borderRadius: 14, padding: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="star" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{t('common:rateMedlink')}</Text>
              <Text style={{ color: '#dcfce7', fontSize: 12 }}>{t('common:rateMedlinkSub')}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#dcfce7" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff22', borderRadius: 14, padding: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="share-social" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{t('common:shareWithFriend')}</Text>
              <Text style={{ color: '#dcfce7', fontSize: 12 }}>{t('common:sharePromoDesc')}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#dcfce7" />
          </TouchableOpacity>

          <View style={{ backgroundColor: '#ffffff11', borderRadius: 14, padding: 14 }}>
            <Text style={{ color: '#dcfce7', fontSize: 12, fontWeight: '600', marginBottom: 10 }}>{t('common:followUsOn')}</Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map((s) => (
                <TouchableOpacity key={s.label} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Ionicons name={s.icon as any} size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ margin: isMobile ? 16 : 24, borderRadius: 22, backgroundColor: isDark ? '#0a5c4e' : '#0d8b78', padding: isMobile ? 24 : 36, overflow: 'hidden', position: 'relative' }}>
      <Ionicons name="heart" size={140} color="#ffffff08" style={{ position: 'absolute', top: -30, right: 30 }} />
      <Ionicons name="medical" size={100} color="#ffffff06" style={{ position: 'absolute', bottom: -20, left: 10 }} />
      <View style={[{ gap: 28 }, !isMobile && { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={{ flex: 1, gap: 14, minWidth: 200 }}>
          <Text style={{ fontSize: isMobile ? 22 : 28, fontWeight: '800', color: '#fff', lineHeight: isMobile ? 30 : 36 }}>{t('common:getAppTitle')}</Text>
          <Text style={{ fontSize: 14, color: '#dcfce7', lineHeight: 22 }}>{t('common:appPromoMessage')}</Text>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff22', borderWidth: 1, borderColor: '#ffffff33', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 }}>
              <Ionicons name="logo-apple" size={22} color="#fff" />
              <View>
                <Text style={{ color: '#ffffff99', fontSize: 10 }}>{t('common:downloadOnThe')}</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{t('common:appStore')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff22', borderWidth: 1, borderColor: '#ffffff33', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 }}>
              <Ionicons name="logo-google-playstore" size={22} color="#fff" />
              <View>
                <Text style={{ color: '#ffffff99', fontSize: 10 }}>Get it on</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{t('common:googlePlay')}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 10 }}>
            <Text style={{ color: '#dcfce7', fontSize: 13, fontWeight: '600' }}>{t('common:followUsOn')}</Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map((s) => (
                <TouchableOpacity key={s.label} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff1a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 }}>
                  <Ionicons name={s.icon as any} size={17} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        {!isMobile && (
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View style={{ width: 160, height: 300, borderRadius: 30, backgroundColor: isDark ? '#1a1a1a' : '#fff', borderWidth: 2, borderColor: '#ffffff44', padding: 14, alignItems: 'center' }}>
              <View style={{ width: 60, height: 6, borderRadius: 3, backgroundColor: isDark ? '#333' : '#e2e8f0', marginBottom: 16 }} />
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Image source={logo} style={{ width: 110, height: 44, resizeMode: 'contain' }} />
                <Text style={{ fontSize: 11, color: isDark ? '#aaa' : '#888', textAlign: 'center' }}>{t('common:healthLink')}</Text>
              </View>
              <View style={{ height: 8, width: '85%', borderRadius: 4, backgroundColor: isDark ? '#2a2a2a' : '#f1f5f9', marginBottom: 8 }} />
              <View style={{ height: 8, width: '60%', borderRadius: 4, backgroundColor: isDark ? '#2a2a2a' : '#f1f5f9', marginBottom: 10 }} />
              <View style={{ height: 72, width: '100%', borderRadius: 14, backgroundColor: isDark ? '#222' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#333' : '#e2e8f0' }} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABannerSection({ theme, isMobile, onSignup, onLogin }: SectionProps & { onSignup: () => void; onLogin: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ marginHorizontal: isMobile ? 16 : 24, marginTop: 8, marginBottom: 8, borderRadius: 22, backgroundColor: theme.colors.primary, padding: isMobile ? 28 : 36, overflow: 'hidden', position: 'relative' }}>
      <Ionicons name="heart" size={140} color="#ffffff0f" style={{ position: 'absolute', top: -20, right: 40 }} />
      <Ionicons name="medical" size={100} color="#ffffff08" style={{ position: 'absolute', bottom: -15, left: 10 }} />
      <View style={[{ gap: 24 }, !isMobile && { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={{ flex: 1, gap: 10, minWidth: 200 }}>
          <Text style={{ fontSize: isMobile ? 24 : 30, fontWeight: '800', color: '#fff', lineHeight: isMobile ? 32 : 40 }}>{t('common:yourHealthJourney')}</Text>
          <Text style={{ fontSize: 14, color: '#dcfce7', lineHeight: 22 }}>{t('common:joinThousands')}</Text>
        </View>
        <View style={{ minWidth: 160 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onSignup}
            style={{ backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 15 }}>
              {t('common:signUp')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onLogin}
            style={{ backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#ffffff88', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {t('common:login')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterSection({ theme, isDark, isMobile, onContactPress, onNavigate }: SectionProps & { onContactPress: () => void; onNavigate: (path: string) => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: isDark ? theme.colors.surface : '#f8faf9', borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 8 }}>
      <View style={[{ padding: isMobile ? 20 : 32, gap: 28 }, !isMobile && { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }]}>
        <View style={{ width: isMobile ? '100%' : '25%', gap: 12 }}>
          <Image source={logo} style={{ width: 110, height: 38, resizeMode: 'contain' }} />
          <Text style={{ fontSize: 11, color: theme.colors.textSecondary, fontStyle: 'italic' }}>{t('common:healthLink')}</Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, lineHeight: 20 }}>{t('common:subtitle')}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {SOCIAL_LINKS.map((s) => (
              <TouchableOpacity key={s.label} activeOpacity={0.7} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
                <Ionicons name={s.icon as any} size={15} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ width: isMobile ? '45%' : '14%', gap: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 4 }}>{t('common:company')}</Text>
          <TouchableOpacity onPress={() => onNavigate('/(public)/about')} activeOpacity={0.7}>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{t('common:aboutUs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onContactPress} activeOpacity={0.7}>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{t('common:contact')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: isMobile ? '45%' : '14%', gap: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 4 }}>{t('common:services')}</Text>
          {[
            t('common:findDoctors'),
            t('common:bookAppointmentLink'),
            t('common:onlineConsultation'),
            t('common:healthPackages'),
          ].map((link) => (
            <Text key={link} style={{ fontSize: 12, color: theme.colors.textSecondary }}>{link}</Text>
          ))}
        </View>

        <View style={{ width: isMobile ? '45%' : '14%', gap: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 4 }}>{t('common:support')}</Text>
          {[
            { label: t('common:helpCenter'), path: '/(public)/help' },
            { label: t('common:faqTitle'), path: '/(public)/faq' },
            { label: t('common:privacyPolicy'), path: '/(public)/privacy' },
            { label: t('common:termsOfService'), path: '/(public)/terms' },
          ].map((item) => (
            <TouchableOpacity key={item.label} onPress={() => onNavigate(item.path)} activeOpacity={0.7}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ width: isMobile ? '100%' : '20%', gap: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 4 }}>{t('common:contactUsTitle')}</Text>
          {[
            { icon: 'call-outline', text: t('common:phone') },
            { icon: 'mail-outline', text: t('common:emailContact') },
            { icon: 'location-outline', text: t('common:addisAbabaEthiopia') },
          ].map((c) => (
            <View key={c.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={c.icon as any} size={14} color={theme.colors.primary} />
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{c.text}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingVertical: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{t('common:copyright')}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PublicHomeScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  // 2. Add state inside Input component:
const [guideVisible, setGuideVisible] = useState(false);

// 3. Add modal before the suggestion bar:
 <TranslitGuideModal visible={guideVisible} onClose={() => setGuideVisible(false)} theme={theme} />




  

  const {
    doctors,
    isLoading,
    hasMore,
    isLoadingMore,
    searchQuery,
    setSearchQuery,
    selectedSpecialization,
    setSelectedSpecialization,
    fetchDoctors,
    fetchMoreDoctors,
  } = useDiscoveryStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<ProviderSearchResult | null>(null);
  const [searchTranslitEnabled, setSearchTranslitEnabled] = useState(i18n.language === 'am');
  // Track whether the backend fetch succeeded at least once
  const [fetchFailed, setFetchFailed] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const heroY = useRef(0);
  const doctorsY = useRef(0);
  const howItWorksY = useRef(0);
  const testimonialsY = useRef(0);
  const contactY = useRef(0);

  const isMobile = width < 768;
  const sectionProps: SectionProps = { theme, isDark, isMobile, width };

  useEffect(() => {
    fetchDoctors().catch(() => setFetchFailed(true));
    console.log('TranslitGuideModal', TranslitGuideModal);
  }, [fetchDoctors]);

  useEffect(() => { setSearchTranslitEnabled(i18n.language === 'am'); }, [i18n.language]);

  // ── Doctor list logic ────────────────────────────────────────────────────────
  // Only fall back to fake doctors when the API call actually failed.
  // When doctors is empty due to search/filter returning no results, show empty state.
  const displayDoctors = useMemo(() => {
    if (fetchFailed && doctors.length === 0) return FAKE_DOCTORS;
    return doctors;
  }, [doctors, fetchFailed]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((text: string) => {
    useDiscoveryStore.setState({ searchQuery: text });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(text);
    }, 500);
  }, [setSearchQuery]);
  
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const scrollToSection = useCallback((yRef: React.MutableRefObject<number>) => {
    scrollViewRef.current?.scrollTo({ y: yRef.current, animated: true });
    setMenuOpen(false);
    Animated.timing(menuAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }, [menuAnim]);

  const toggleMenu = useCallback(() => {
    const toValue = menuOpen ? 0 : 1;
    Animated.timing(menuAnim, { toValue, duration: 220, useNativeDriver: true }).start();
    setMenuOpen((prev) => !prev);
  }, [menuOpen, menuAnim]);

  const promptAuth = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const NAV_ITEMS = [
    { label: t('common:home'), onPress: () => scrollToSection(heroY) },
    { label: t('common:findDoctors'), onPress: () => scrollToSection(doctorsY) },
    { label: t('common:how'), onPress: () => scrollToSection(howItWorksY) },
    { label: t('common:testimonials'), onPress: () => scrollToSection(testimonialsY) },
  ];

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <NavBar
        {...sectionProps}
        menuOpen={menuOpen}
        onToggleMenu={toggleMenu}
        onLogin={() => router.push('/(auth)/login')}
        onSignup={() => router.push('/(auth)/register')}
        menuAnim={menuAnim}
        navItems={NAV_ITEMS}
      />
    
      <ScrollView ref={scrollViewRef} style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
        <View onLayout={(e) => { heroY.current = e.nativeEvent.layout.y; }}>
          <HeroSection {...sectionProps} onGetStarted={() => router.push('/(auth)/register')} onLogin={() => router.push('/(auth)/login')} />
        </View>

        <SearchSection
          {...sectionProps}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          translitEnabled={searchTranslitEnabled}
          setTranslitEnabled={setSearchTranslitEnabled}
        />

        <View onLayout={(e) => { doctorsY.current = e.nativeEvent.layout.y; }}>
          <DoctorsSection
            {...sectionProps}
            doctors={displayDoctors}
            isLoading={isLoading && doctors.length === 0 && !fetchFailed}
            hasFetchError={fetchFailed}
            searchQuery={searchQuery}
            selectedSpecialty={selectedSpecialization || 'All'}
            onSelectSpecialty={(s) => setSelectedSpecialization(s === 'All' ? null : s)}
            onSelectDoctor={(d) => setSelectedDoctor(d)}
            onBook={promptAuth}
            onViewAll={promptAuth}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={fetchMoreDoctors}
          />
        </View>

        <View onLayout={(e) => { howItWorksY.current = e.nativeEvent.layout.y; }}>
          <HowItWorksSection {...sectionProps} />
        </View>

        <FeaturesSection {...sectionProps} />

        <View onLayout={(e) => { testimonialsY.current = e.nativeEvent.layout.y; }}>
          <TestimonialsSection {...sectionProps} />
        </View>

        <View onLayout={(e) => { contactY.current = e.nativeEvent.layout.y; }}>
          <ContactSection {...sectionProps} />
        </View>

        <DownloadCTASection {...sectionProps} />

        <CTABannerSection {...sectionProps} onSignup={() => router.push('/(auth)/register')} onLogin={() => router.push('/(auth)/login')} />

        <FooterSection {...sectionProps} onContactPress={() => scrollToSection(contactY)} onNavigate={(path) => router.push(path as any)} />
      </ScrollView>

      <DoctorDetailsModal visible={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} doctor={selectedDoctor} />
    </ScreenContainer>
  );
}
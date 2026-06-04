import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AccountSwitcher, ScreenContainer } from '../../src/components/ui';
import { useTheme, Theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { getFullMediaUrl } from '../../src/lib/utils';
import { CreateLinkedPatientModal } from '../../src/components/ui/CreateLinkedPatientModal';
import { LinkExistingAccountModal } from '../../src/components/ui/LinkExistingAccountModal';
import { useBookingStore } from '../../src/store/booking.store';
import { EditProfileModal } from '../../src/features/profile/components/EditProfileModal';
import { ChangePasswordModal } from '../../src/features/profile/components/ChangePasswordModal';
import { MedicalInfoModal } from '../../src/features/patient/components/MedicalInfoModal';
import { useTranslation } from '../../src/i18n';
import { setItemAsync } from '../../src/services/storage';
import { authService } from '../../src/features/auth/services/authService';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  theme: Theme;
}

function MenuItem({ icon, label, onPress, rightElement, destructive, theme }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
      }}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: destructive
            ? theme.colors.errorLight
            : theme.colors.primaryLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: '500',
          color: destructive ? theme.colors.error : theme.colors.text,
        }}
      >
        {label}
      </Text>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setUser = useAuthStore((s) => s.setUser);
  const hasLinkedAccount = useAuthStore((s) => s.hasLinkedAccount);
  const profileImageVersion = useAuthStore((s) => s.profileImageVersion);
  const { preferences, isLoading, fetchPreferences, updatePreferences } = useBookingStore();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isMedicalInfoVisible, setMedicalInfoVisible] = useState(false);
  const [isChangePasswordVisible, setChangePasswordVisible] = useState(false);
  const [isCreatePatientVisible, setIsCreatePatientVisible] = useState(false);
  const [isLinkAccountVisible, setLinkAccountVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, [fetchProfile, fetchPreferences]);

  const initials = `${user?.first_name?.[0] ?? 'U'}${user?.last_name?.[0] ?? ''}`;
  const avatarUri = user?.profile_image
    ? `${getFullMediaUrl(user.profile_image)}?v=${profileImageVersion}`
    : user?.avatar
    ? `${getFullMediaUrl(user.avatar)}?v=${profileImageVersion}`
    : null;

  const handleTogglePreference = async (key: 'email_appointments' | 'in_app_appointments', value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      // Error handled by store
    }
  };

  const LANGUAGES = [
    { value: 'en' as const, label: 'English' },
    { value: 'am' as const, label: 'አማርኛ (Amharic)' },
  ];

  const currentLang = (i18n.language || 'en').startsWith('am') ? 'am' : 'en';
  const currentLangLabel = LANGUAGES.find(l => l.value === currentLang)?.label || 'English';

  const handleLanguageChange = () => {
    const currentIndex = LANGUAGES.findIndex(l => l.value === currentLang);
    const nextLang = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
    const nextLangCode = nextLang.value;

    // Instant local change
    i18n.changeLanguage(nextLangCode);
    setItemAsync('preferred_language', nextLangCode);

    // Background sync with API (non-blocking, direct API call)
    authService.updateProfile({ preferred_language: nextLangCode })
      .then((profileData) => {
        const existingUser = useAuthStore.getState().user;
        if (existingUser) {
          setUser({ ...existingUser, ...profileData, role: existingUser.role });
        }
      })
      .catch((error) => {
        console.warn("Failed to sync language preference with backend:", error);
      });
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* ── Avatar Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setEditProfileVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: '100%', height: '100%', borderRadius: 50 }}
                />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </View>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {user?.first_name ?? 'User'} {user?.last_name ?? ''}
          </Text>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
            {user?.email ?? ''}
          </Text>
        </View>

        {/* ── Account Switcher ── */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <AccountSwitcher 
            variant="profile" 
            onCreatePatient={() => setIsCreatePatientVisible(true)}
            onLinkExisting={() => setLinkAccountVisible(true)}
          />
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.sectionCard}>
          <MenuItem
            icon="person-outline"
            label={t("common:editProfile")}
            onPress={() => setEditProfileVisible(true)}
            theme={theme}
          />
          {user?.role === 'DOCTOR' && (
            <>
              <View style={styles.divider} />
              <MenuItem
                icon="calendar-outline"
                label={t("common:availability")}
                onPress={() => router.push('/(doctor)/availability')}
                theme={theme}
              />
            </>
          )}
          {user?.role === 'PATIENT' && (
            <>
              <View style={styles.divider} />
              <MenuItem
                icon="heart-outline"
                label={t("doctor:medicalInfo")}
                onPress={() => setMedicalInfoVisible(true)}
                theme={theme}
              />
            </>
          )}
          <View style={styles.divider} />
          <MenuItem
            icon="lock-closed-outline"
            label={t("common:changePassword")}
            onPress={() => setChangePasswordVisible(true)}
            theme={theme}
          />
        </View>

        <Text style={styles.sectionTitle}>{t("common:profileSettings")}</Text>
        <View style={styles.sectionCard}>
          <MenuItem
            icon="mail-outline"
            label={t("common:emailNotifications")}
            theme={theme}
            rightElement={
              <Switch
                value={preferences?.email_appointments ?? false}
                onValueChange={(val) => handleTogglePreference('email_appointments', val)}
                disabled={isLoading}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={styles.divider} />
          <MenuItem
            icon="apps-outline"
            label={t("common:inAppNotifications")}
            theme={theme}
            rightElement={
              <Switch
                value={preferences?.in_app_appointments ?? false}
                onValueChange={(val) => handleTogglePreference('in_app_appointments', val)}
                disabled={isLoading}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>{t("common:appSettings")}</Text>
        <View style={styles.sectionCard}>
          <MenuItem
            icon="moon-outline"
            label={t("common:darkMode")}
            theme={theme}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={styles.divider} />
          <MenuItem
            icon="language-outline"
            label={t("common:languagePref")}
            theme={theme}
            onPress={handleLanguageChange}
            rightElement={
              <View style={styles.langBadge}>
                <Text style={[styles.langText, { color: theme.colors.primary }]}>{currentLangLabel}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </View>
            }
          />
          <View style={styles.divider} />
          <MenuItem
            icon="help-circle-outline"
            label={t("common:helpCenter")}
            theme={theme}
            onPress={() => {}}
          />
        </View>

        <View style={[styles.sectionCard, { marginTop: theme.spacing.xl, marginBottom: 60 }]}>
          <MenuItem
            icon="log-out-outline"
            label={t("auth:logout")}
            onPress={logout}
            destructive
            theme={theme}
          />
        </View>
      </View>

      {/* Modals */}
      <EditProfileModal 
        visible={isEditProfileVisible} 
        onClose={async () => {
          setEditProfileVisible(false);
          await fetchProfile();
        }} 
      />
      <MedicalInfoModal 
        visible={isMedicalInfoVisible} 
        onClose={() => setMedicalInfoVisible(false)} 
      />
      <ChangePasswordModal 
        visible={isChangePasswordVisible} 
        onClose={() => setChangePasswordVisible(false)} 
      />
      <CreateLinkedPatientModal
        visible={isCreatePatientVisible}
        onClose={() => setIsCreatePatientVisible(false)}
      />
      <LinkExistingAccountModal
        visible={isLinkAccountVisible}
        onClose={() => setLinkAccountVisible(false)}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing['4xl'],
    },
    header: {
      alignItems: 'center',
      paddingTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing['2xl'],
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primaryLight + '50',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: theme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    avatarInitials: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.colors.background,
    },
    name: {
      ...theme.typography.h3,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
      textAlign: 'center',
      maxWidth: '100%',
    },
    email: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      maxWidth: '100%',
    },
    sectionTitle: {
      ...theme.typography.label,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
      overflow: 'hidden',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.5,
      marginLeft: 68, // Aligns with the text, skipping the icon
    },
    langBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    langText: {
      fontSize: 13,
      fontWeight: '600',
    },
  });

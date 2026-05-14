import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AccountSwitcher, ScreenContainer } from '../../src/components/ui';
import { useTheme, Theme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { CreateLinkedPatientModal } from '../../src/components/ui/CreateLinkedPatientModal';
import { useBookingStore } from '../../src/store/booking.store';
import { EditProfileModal } from '../../src/features/profile/components/EditProfileModal';
import { ChangePasswordModal } from '../../src/features/profile/components/ChangePasswordModal';
import { MedicalInfoModal } from '../../src/features/patient/components/MedicalInfoModal';

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
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { preferences, isLoading, fetchPreferences, updatePreferences } = useBookingStore();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isMedicalInfoVisible, setMedicalInfoVisible] = useState(false);
  const [isChangePasswordVisible, setChangePasswordVisible] = useState(false);
  const [isCreatePatientVisible, setIsCreatePatientVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, [fetchProfile, fetchPreferences]);

  const initials = `${user?.first_name?.[0] ?? 'U'}${user?.last_name?.[0] ?? ''}`;

  const handleTogglePreference = async (key: 'email_appointments' | 'in_app_appointments', value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      // Error handled by store
    }
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
              <Text style={styles.avatarInitials}>{initials}</Text>
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
          <AccountSwitcher variant="profile" onCreatePatient={() => setIsCreatePatientVisible(true)} />
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.sectionCard}>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => setEditProfileVisible(true)}
            theme={theme}
          />
          {user?.role === 'DOCTOR' && (
            <>
              <View style={styles.divider} />
              <MenuItem
                icon="calendar-outline"
                label="Set Availability"
                onPress={() => router.push('/doctor/availability')}
                theme={theme}
              />
            </>
          )}
          {user?.role === 'PATIENT' && (
            <>
              <View style={styles.divider} />
              <MenuItem
                icon="heart-outline"
                label="Medical Info"
                onPress={() => setMedicalInfoVisible(true)}
                theme={theme}
              />
            </>
          )}
          <View style={styles.divider} />
          <MenuItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => setChangePasswordVisible(true)}
            theme={theme}
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <MenuItem
            icon="mail-outline"
            label="Email Notifications"
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
            label="In-App Notifications"
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

        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.sectionCard}>
          <MenuItem
            icon="moon-outline"
            label="Dark Mode"
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
            icon="help-circle-outline"
            label="Help Center"
            theme={theme}
            onPress={() => {}}
          />
        </View>

        <View style={[styles.sectionCard, { marginTop: theme.spacing.xl, marginBottom: 60 }]}>
          <MenuItem
            icon="log-out-outline"
            label="Log Out"
            onPress={logout}
            destructive
            theme={theme}
          />
        </View>
      </View>

      {/* Modals */}
      <EditProfileModal 
        visible={isEditProfileVisible} 
        onClose={() => setEditProfileVisible(false)} 
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
  });

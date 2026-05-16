import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import type { Theme } from '../../theme';
import { useTheme } from '../../theme';

interface AccountSwitcherProps {
  isCollapsed?: boolean;
  onCreatePatient?: () => void;
  onLinkExisting?: () => void;
  variant?: 'sidebar' | 'profile';
}

export function AccountSwitcher({ isCollapsed, onCreatePatient, onLinkExisting, variant = 'sidebar' }: AccountSwitcherProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const user = useAuthStore((s) => s.user);
  const linkedAccount = useAuthStore((s) => s.linkedAccount);
  const hasLinkedAccount = useAuthStore((s) => s.hasLinkedAccount);
  const isSwitchingAccount = useAuthStore((s) => s.isSwitchingAccount);
  const switchAccount = useAuthStore((s) => s.switchAccount);

  if (!user) return null;

  const isDoctor = user.role === 'DOCTOR';

  // We now show prompts to link/create even if no account is linked yet
  // (e.g., Doctor can create Patient, Patient can link Doctor)

  const roleColor = isDoctor ? theme.colors.primary : '#13C2C2';

  const handleSwitch = () => {
    if (hasLinkedAccount && linkedAccount) {
      switchAccount(linkedAccount.id);
    }
  };

  const actionText = `Switch to ${isDoctor ? 'Patient' : 'Doctor'}`;
  const actionIcon = 'swap-horizontal-outline' as const;

  // ─── Profile Variant ──────────────────────────────────────
  if (variant === 'profile') {
    // 1. CTA Card (No linked account yet)
    if (!hasLinkedAccount) {
      const isDoc = user.role === 'DOCTOR';
      const themeColor = isDoc ? theme.colors.primary : '#13C2C2';
      const cardTitle = isDoc ? 'Patient Account' : 'Doctor Account';
      const cardSub = isDoc 
        ? 'Book appointments as a patient too.' 
        : 'Manage your medical practice and patients.';
      const createLabel = isDoc ? 'Create New Account' : 'Apply as Doctor';
      const createSub = isDoc 
        ? 'Set up a fresh patient profile' 
        : 'Start your professional onboarding';

      return (
        <View style={[styles.profileCard, styles.ctaCard]}>
          <View style={[styles.ctaHeader, { backgroundColor: themeColor }]}>
            <View style={styles.ctaIconBg}>
              <Ionicons 
                name={isDoc ? "people" : "medical"} 
                size={22} 
                color={themeColor} 
              />
            </View>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>{cardTitle}</Text>
              <Text style={styles.ctaSub}>{cardSub}</Text>
            </View>
          </View>

          <View style={styles.ctaOptions}>
            <Pressable
              style={({ pressed }) => [
                styles.ctaOption,
                pressed && { backgroundColor: themeColor + '08' },
              ]}
              onPress={onCreatePatient}
            >
              <View style={[styles.ctaOptionIcon, { backgroundColor: themeColor + '12' }]}>
                <Ionicons 
                  name={isDoc ? "person-add-outline" : "document-text-outline"} 
                  size={18} 
                  color={themeColor} 
                />
              </View>
              <View style={styles.ctaOptionText}>
                <Text style={[styles.ctaOptionTitle, { color: theme.colors.text }]}>{createLabel}</Text>
                <Text style={[styles.ctaOptionSub, { color: theme.colors.textTertiary }]}>
                  {createSub}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Pressable>

            <View style={styles.ctaDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.ctaOption,
                pressed && { backgroundColor: themeColor + '08' },
              ]}
              onPress={onLinkExisting}
            >
              <View style={[styles.ctaOptionIcon, { backgroundColor: themeColor + '12' }]}>
                <Ionicons name="link-outline" size={18} color={themeColor} />
              </View>
              <View style={styles.ctaOptionText}>
                <Text style={[styles.ctaOptionTitle, { color: theme.colors.text }]}>Link Existing Account</Text>
                <Text style={[styles.ctaOptionSub, { color: theme.colors.textTertiary }]}>
                  Connect an account you already have
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Pressable>
          </View>
        </View>
      );
    }

    // 2. Switch Card (Already has linked account)
    const targetRole = user.role === 'DOCTOR' ? 'Patient' : 'Doctor';
    const targetColor = user.role === 'DOCTOR' ? '#13C2C2' : theme.colors.primary;

    return (
      <View style={[styles.profileCard, styles.ctaCard]}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaHeader, 
            { backgroundColor: targetColor },
            pressed && { opacity: 0.9 }
          ]}
          onPress={handleSwitch}
          disabled={isSwitchingAccount}
        >
          <View style={styles.ctaIconBg}>
            {isSwitchingAccount ? (
              <ActivityIndicator size="small" color={targetColor} />
            ) : (
              <Ionicons name="swap-horizontal" size={22} color={targetColor} />
            )}
          </View>
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>
              {isSwitchingAccount ? 'Switching Account...' : `Switch to ${targetRole}`}
            </Text>
            <Text style={styles.ctaSub}>
              Currently using your {user.role.toLowerCase()} profile.
            </Text>
          </View>
          {!isSwitchingAccount && (
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          )}
        </Pressable>
      </View>
    );
  }

  // ─── Sidebar Variant ──────────────────────────────────────
  if (!hasLinkedAccount) {
    const isDoc = user.role === 'DOCTOR';
    const themeColor = isDoc ? theme.colors.primary : '#13C2C2';
    const createIcon = isDoc ? "person-add-outline" : "document-text-outline";
    const createLabel = isDoc ? 'Create Patient' : 'Apply as Doctor';

    if (isCollapsed) {
      return (
        <Pressable
          onPress={onCreatePatient}
          disabled={isSwitchingAccount}
          style={({ hovered }) => [
            styles.sidebarItem,
            styles.sidebarCreateItem,
            { borderColor: themeColor + '40', backgroundColor: themeColor + '10' },
            styles.sidebarItemCollapsed,
            hovered && Platform.OS === 'web' && { backgroundColor: themeColor + '20' }
          ]}
        >
          <Ionicons name={isDoc ? "people-outline" : "medical-outline"} size={20} color={themeColor} />
        </Pressable>
      );
    }

    return (
      <View style={styles.sidebarDualContainer}>
        <Pressable
          onPress={onCreatePatient}
          disabled={isSwitchingAccount}
          style={({ hovered }) => [
            styles.sidebarItem,
            styles.sidebarCreateItem,
            { borderColor: themeColor + '40', backgroundColor: themeColor + '10' },
            hovered && Platform.OS === 'web' && { backgroundColor: themeColor + '20' }
          ]}
        >
          <Ionicons name={createIcon} size={18} color={themeColor} />
          <Text style={[styles.sidebarText, { color: themeColor, fontWeight: '600' }]}>
            {createLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={onLinkExisting}
          disabled={isSwitchingAccount}
          style={({ hovered }) => [
            styles.sidebarItem,
            styles.sidebarLinkItem,
            { borderColor: themeColor + '40', backgroundColor: themeColor + '05' },
            hovered && Platform.OS === 'web' && { backgroundColor: themeColor + '15' }
          ]}
        >
          <Ionicons name="link-outline" size={18} color={themeColor} />
          <Text style={[styles.sidebarText, { color: themeColor, fontWeight: '600' }]}>
            Link Existing
          </Text>
        </Pressable>
      </View>
    );
  }

  // Has linked account → Switch box in sidebar
  const targetColor = user.role === 'DOCTOR' ? '#13C2C2' : theme.colors.primary;

  return (
    <Pressable
      onPress={handleSwitch}
      disabled={isSwitchingAccount}
      style={({ hovered }) => [
        styles.sidebarItem,
        { backgroundColor: targetColor + '10', borderColor: targetColor + '30', borderWidth: 1 },
        isCollapsed && styles.sidebarItemCollapsed,
        hovered && Platform.OS === 'web' && { backgroundColor: targetColor + '20' }
      ]}
    >
      {isSwitchingAccount ? (
        <ActivityIndicator size={20} color={targetColor} />
      ) : (
        <Ionicons name={actionIcon} size={20} color={targetColor} />
      )}
      
      {!isCollapsed && (
        <Text style={[styles.sidebarText, { color: targetColor, fontWeight: '600' }]}>
          {isSwitchingAccount ? 'Switching...' : actionText}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // ─── Sidebar ─────────────────────────────────────────
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
    },
    sidebarItemCollapsed: {
      justifyContent: 'center',
      paddingHorizontal: 0,
      width: 40,
    },
    sidebarText: {
      marginLeft: 10,
      fontSize: 14,
      fontWeight: '500',
    },
    sidebarCreateItem: {
      backgroundColor: theme.colors.primary + '10',
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
      borderStyle: 'dashed',
    },
    sidebarLinkItem: {
      backgroundColor: '#13C2C2' + '10',
      borderWidth: 1,
      borderColor: '#13C2C2' + '20',
      borderStyle: 'dashed',
    },
    sidebarDualContainer: {
      gap: 4,
    },

    // ─── Profile: Switch ─────────────────────────────────
    profileCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
      overflow: 'hidden',
    },
    profileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    profileIconBg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    profileText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },

    // ─── Profile: Combined CTA Card ─────────────────────
    ctaCard: {
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    ctaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 18,
      paddingHorizontal: 20,
    },
    ctaIconBg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    ctaTextContainer: {
      flex: 1,
    },
    ctaTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 2,
    },
    ctaSub: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 18,
    },
    ctaOptions: {
      paddingVertical: 4,
    },
    ctaOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    ctaOptionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    ctaOptionText: {
      flex: 1,
    },
    ctaOptionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 1,
    },
    ctaOptionSub: {
      fontSize: 12,
      lineHeight: 16,
    },
    ctaDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.5,
      marginLeft: 68,
    },
  });

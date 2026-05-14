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

  // If the user is a patient and they don't have a linked doctor account,
  // there is no account switching functionality to show.
  if (!isDoctor && !hasLinkedAccount) return null;

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
    // Doctor without linked account → show combined CTA card
    if (!hasLinkedAccount && isDoctor) {
      return (
        <View style={[styles.profileCard, styles.ctaCard]}>
          {/* Green header */}
          <View style={styles.ctaHeader}>
            <View style={styles.ctaIconBg}>
              <Ionicons name="people" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Patient Account</Text>
              <Text style={styles.ctaSub}>Book appointments as a patient too.</Text>
            </View>
          </View>

          {/* Two options */}
          <View style={styles.ctaOptions}>
            <Pressable
              style={({ pressed }) => [
                styles.ctaOption,
                pressed && { backgroundColor: theme.colors.primary + '08' },
              ]}
              onPress={onCreatePatient}
            >
              <View style={[styles.ctaOptionIcon, { backgroundColor: theme.colors.primary + '12' }]}>
                <Ionicons name="person-add-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.ctaOptionText}>
                <Text style={[styles.ctaOptionTitle, { color: theme.colors.text }]}>Create New Account</Text>
                <Text style={[styles.ctaOptionSub, { color: theme.colors.textTertiary }]}>
                  Set up a fresh patient profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Pressable>

            <View style={styles.ctaDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.ctaOption,
                pressed && { backgroundColor: theme.colors.primary + '08' },
              ]}
              onPress={onLinkExisting}
            >
              <View style={[styles.ctaOptionIcon, { backgroundColor: '#13C2C2' + '12' }]}>
                <Ionicons name="link-outline" size={18} color="#13C2C2" />
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

    // Has linked account → show switch button
    if (hasLinkedAccount) {
      return (
        <View style={styles.profileCard}>
          <Pressable
            style={styles.profileItem}
            onPress={handleSwitch}
            disabled={isSwitchingAccount}
          >
            <View style={[styles.profileIconBg, { backgroundColor: roleColor + '15' }]}>
              <Ionicons name={actionIcon} size={20} color={roleColor} />
            </View>
            <Text style={[styles.profileText, { color: theme.colors.text }]}>
              {isSwitchingAccount ? 'Switching...' : actionText}
            </Text>
            {isSwitchingAccount ? (
              <ActivityIndicator size="small" color={roleColor} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            )}
          </Pressable>
        </View>
      );
    }

    return null;
  }

  // ─── Sidebar Variant ──────────────────────────────────────
  if (!hasLinkedAccount && isDoctor) {
    if (isCollapsed) {
      return (
        <Pressable
          onPress={onCreatePatient}
          disabled={isSwitchingAccount}
          style={({ hovered }) => [
            styles.sidebarItem,
            styles.sidebarCreateItem,
            styles.sidebarItemCollapsed,
            hovered && Platform.OS === 'web' && { backgroundColor: theme.colors.primary + '15' }
          ]}
        >
          <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
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
            hovered && Platform.OS === 'web' && { backgroundColor: theme.colors.primary + '15' }
          ]}
        >
          <Ionicons name="person-add-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.sidebarText, { color: theme.colors.primary, fontWeight: '600' }]}>
            Create Patient
          </Text>
        </Pressable>

        <Pressable
          onPress={onLinkExisting}
          disabled={isSwitchingAccount}
          style={({ hovered }) => [
            styles.sidebarItem,
            styles.sidebarLinkItem,
            hovered && Platform.OS === 'web' && { backgroundColor: '#13C2C2' + '15' }
          ]}
        >
          <Ionicons name="link-outline" size={18} color="#13C2C2" />
          <Text style={[styles.sidebarText, { color: '#13C2C2', fontWeight: '600' }]}>
            Link Existing
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleSwitch}
      disabled={isSwitchingAccount}
      style={({ hovered }) => [
        styles.sidebarItem,
        isCollapsed && styles.sidebarItemCollapsed,
        hovered && Platform.OS === 'web' && { backgroundColor: theme.colors.border + '50' }
      ]}
    >
      {isSwitchingAccount ? (
        <ActivityIndicator size={20} color={roleColor} />
      ) : (
        <Ionicons name={actionIcon} size={20} color={roleColor} />
      )}
      
      {!isCollapsed && (
        <Text style={[styles.sidebarText, { color: theme.colors.textSecondary }]}>
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

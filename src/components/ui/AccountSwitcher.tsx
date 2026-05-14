import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import type { Theme } from '../../theme';
import { useTheme } from '../../theme';

interface AccountSwitcherProps {
  isCollapsed?: boolean;
  onCreatePatient?: () => void;
  variant?: 'sidebar' | 'profile';
}

export function AccountSwitcher({ isCollapsed, onCreatePatient, variant = 'sidebar' }: AccountSwitcherProps) {
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
  const iconName = isDoctor ? 'medkit-outline' : 'person-outline';

  const handlePress = () => {
    if (hasLinkedAccount && linkedAccount) {
      switchAccount(linkedAccount.id);
    } else if (isDoctor && onCreatePatient) {
      onCreatePatient();
    }
  };

  const actionText = hasLinkedAccount
    ? `Switch to ${isDoctor ? 'Patient' : 'Doctor'}`
    : 'Create Patient Profile';
  
  const actionIcon = hasLinkedAccount ? 'swap-horizontal-outline' : 'person-add-outline';

  if (variant === 'profile') {
    if (!hasLinkedAccount) {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.profileCard, 
            styles.createCard,
            { backgroundColor: theme.colors.primary },
            pressed && { opacity: 0.9 }
          ]}
          onPress={handlePress}
          disabled={isSwitchingAccount}
        >
          <View style={styles.createContent}>
            <View style={styles.createIconBg}>
              <Ionicons name="person-add" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.createTextContainer}>
              <Text style={styles.createTitle}>Patient Account</Text>
              <Text style={styles.createSub}>Create a profile to book your own appointments.</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ opacity: 0.8 }} />
          </View>
        </Pressable>
      );
    }

    return (
      <View style={styles.profileCard}>
        <Pressable
          style={styles.profileItem}
          onPress={handlePress}
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

  // Sidebar Variant
  if (!hasLinkedAccount) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isSwitchingAccount}
        style={({ hovered }) => [
          styles.sidebarItem,
          styles.sidebarCreateItem,
          isCollapsed && styles.sidebarItemCollapsed,
          hovered && Platform.OS === 'web' && { backgroundColor: theme.colors.primary + '15' }
        ]}
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
        {!isCollapsed && (
          <Text style={[styles.sidebarText, { color: theme.colors.primary, fontWeight: '600' }]}>
            Create Patient Profile
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
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
    createCard: {
      marginBottom: 0,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    createContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    createIconBg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    createTextContainer: {
      flex: 1,
    },
    createTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 2,
    },
    createSub: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 18,
    },
    sidebarCreateItem: {
      backgroundColor: theme.colors.primary + '10',
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
      borderStyle: 'dashed',
    },
  });

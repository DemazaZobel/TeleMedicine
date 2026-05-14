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
  });

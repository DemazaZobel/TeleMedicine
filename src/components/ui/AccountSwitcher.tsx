import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import type { Theme } from '../../theme';
import { useTheme } from '../../theme';

interface AccountSwitcherProps {
  isCollapsed?: boolean;
  onCreatePatient?: () => void;
}

export function AccountSwitcher({ isCollapsed, onCreatePatient }: AccountSwitcherProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const user = useAuthStore((s) => s.user);
  const linkedAccount = useAuthStore((s) => s.linkedAccount);
  const hasLinkedAccount = useAuthStore((s) => s.hasLinkedAccount);
  const isSwitchingAccount = useAuthStore((s) => s.isSwitchingAccount);
  const switchAccount = useAuthStore((s) => s.switchAccount);

  if (!user) return null;

  const isDoctor = user.role === 'DOCTOR';
  const roleLabel = isDoctor ? 'Doctor' : 'Patient';
  const roleIcon = isDoctor ? 'medkit' : 'person';
  const roleColor = isDoctor ? '#0070E0' : '#13C2C2';

  // Collapsed: just show role badge icon
  if (isCollapsed) {
    return (
      <TouchableOpacity
        style={styles.collapsedBadge}
        onPress={() => {
          if (hasLinkedAccount && linkedAccount) {
            switchAccount(linkedAccount.id);
          }
        }}
        disabled={isSwitchingAccount || !hasLinkedAccount}
      >
        {isSwitchingAccount ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <View style={[styles.roleIconCircle, { backgroundColor: roleColor + '15' }]}>
            <Ionicons name={roleIcon as any} size={16} color={roleColor} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Current Account */}
      <View style={styles.currentAccount}>
        <View style={[styles.avatar, { backgroundColor: roleColor + '15' }]}>
          <Ionicons name={roleIcon as any} size={18} color={roleColor} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {isDoctor ? `Dr. ${user.last_name}` : `${user.first_name} ${user.last_name}`}
          </Text>
          <Text style={[styles.roleTag, { color: roleColor }]}>{roleLabel}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Switch or Create */}
      {isSwitchingAccount ? (
        <View style={styles.switchingRow}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.switchingText}>Switching account...</Text>
        </View>
      ) : hasLinkedAccount && linkedAccount ? (
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => switchAccount(linkedAccount.id)}
        >
          <Ionicons name="swap-horizontal" size={18} color={theme.colors.primary} />
          <Text style={styles.actionText}>
            Switch to {linkedAccount.role === 'DOCTOR' ? 'Doctor' : 'Patient'}
          </Text>
        </TouchableOpacity>
      ) : isDoctor ? (
        <TouchableOpacity
          style={styles.actionRow}
          onPress={onCreatePatient}
        >
          <Ionicons name="person-add-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.actionText}>Create Patient Account</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: 8,
      marginBottom: 12,
      overflow: 'hidden',
    },
    currentAccount: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 10,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountInfo: {
      flex: 1,
    },
    name: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
    },
    roleTag: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 1,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 12,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 10,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    switchingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 10,
    },
    switchingText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    collapsedBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    roleIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import type { Theme } from '../../../theme';
import type { ProviderSearchResult } from '../../doctor/types/doctor.types';

interface DoctorCardProps {
  doctor: ProviderSearchResult;
  onPress: () => void;
}

export const DoctorCard = React.memo(function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../../../assets/images/doctor-avatar.png')}
            style={styles.avatar}
          />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              Dr. {doctor.first_name} {doctor.last_name}
            </Text>
            {doctor.is_verified && (
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} style={styles.badge} />
            )}
          </View>
          <Text style={styles.specialization}>{doctor.specialization}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.statText}>{doctor.average_rating}</Text>
            </View>
            <Text style={styles.statDot}>•</Text>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{doctor.years_of_experience} yrs</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.feeLabel}>Consultation Fee</Text>
        <Text style={styles.feeAmount}>Br {doctor.consultation_fee}</Text>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      marginBottom: 16,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primaryLight + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
    },
    badge: {
      marginLeft: 6,
    },
    specialization: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    statDot: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textTertiary,
      marginHorizontal: 8,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 16,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    feeLabel: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    feeAmount: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
    },
  });

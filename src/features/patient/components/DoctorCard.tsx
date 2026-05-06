import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import type { Theme } from '../../../theme';
import type { ProviderSearchResult } from '../../doctor/types/doctor.types';
import { StarRating } from '../../../components/ui';

interface DoctorCardProps {
  doctor: ProviderSearchResult;
  onPress: () => void;
}

export const DoctorCard = React.memo(function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../../../assets/images/doctor-avatar.png')}
            style={styles.avatar}
          />
          {doctor.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-sharp" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                Dr. {doctor.first_name} {doctor.last_name}
              </Text>
              <Text style={styles.specialization}>{doctor.specialization}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>Br {doctor.consultation_fee}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StarRating rating={Number(doctor.average_rating)} size={12} />
              <Text style={styles.statValue}>{doctor.average_rating}</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.statItem}>
              <Ionicons name="briefcase-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={styles.statLabel}>{doctor.years_of_experience} yrs exp</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.sm,
    },
    mainContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoContainer: {
      flex: 1,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    name: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    specialization: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    priceTag: {
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    priceText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      marginLeft: 2,
    },
    statLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.colors.textTertiary,
      marginHorizontal: 8,
    },
  });

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open profile for Dr. ${doctor.first_name} ${doctor.last_name}`}
    >
      <View style={styles.backgroundGlow} />
      <View style={styles.containerAccent} />
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
              <StarRating rating={Number(doctor.average_rating)} size={14} />
            </View>
            <View style={styles.dot} />
            <View style={styles.statItem}>
              <Ionicons name="briefcase-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={styles.statLabel}>{doctor.years_of_experience} yrs exp</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.success} />
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      marginBottom: 14,
      ...theme.shadows.md,
      overflow: 'hidden',
    },
    containerPressed: {
      transform: [{ scale: 0.985 }],
      opacity: 0.96,
    },
    backgroundGlow: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      right: -40,
      top: -55,
      backgroundColor: theme.colors.primary + '0F',
    },
    containerAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: theme.colors.primary,
    },
    mainContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 18,
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
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
      marginBottom: 10,
    },
    name: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.2,
    },
    specialization: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      marginTop: 4,
      letterSpacing: 0.7,
    },
    priceTag: {
      backgroundColor: theme.colors.primary + '12',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.primary + '1F',
    },
    priceText: {
      fontSize: 13,
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
      fontWeight: '800',
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

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Image
            source={require('../../../../assets/images/avatar-placeholder.png')}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                Dr. {doctor.user.first_name} {doctor.user.last_name}
              </Text>
              {doctor.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              )}
            </View>
            <Text style={styles.specialization}>{doctor.specialization}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.statText}>{doctor.average_rating}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
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
      </Card>
    </TouchableOpacity>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowOpacity: 0.05,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primaryLight,
      marginRight: theme.spacing.md,
    },
    info: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    name: {
      ...theme.typography.h4,
      color: theme.colors.text,
      fontWeight: '700',
    },
    specialization: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '600',
      marginTop: 2,
      marginBottom: 6,
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
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    statDivider: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textTertiary,
      marginHorizontal: 8,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    feeLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    feeAmount: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '700',
    },
  });

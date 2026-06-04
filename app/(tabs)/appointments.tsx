import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { EmptyState, PageHeader, ScreenContainer } from '../../src/components/ui';
import { AppointmentCard } from '../../src/features/booking/components/AppointmentCard';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/booking.store';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED';

export default function AppointmentsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation('appointment');

  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === 'DOCTOR';
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());

  const {
    appointments,
    isLoading,
    fetchMyAppointments,
    doctorDecision
  } = useBookingStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  useEffect(() => {
    if (!isDoctor || (isDoctor && isVerified)) {
      fetchMyAppointments();
    }
  }, [isDoctor, isVerified]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyAppointments();
    setRefreshing(false);
  };

  const handleAccept = async (id: string | number) => {
    try {
      await doctorDecision(id, { action: 'accept' });
      Alert.alert(t('alerts.success'), t('alerts.acceptSuccess'));
    } catch (err) {
      Alert.alert(t('alerts.error'), t('alerts.acceptError'));
    }
  };

  const { width } = useWindowDimensions();
  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

  // Filter label map — keys match FilterStatus, values pull from t()
  const filterLabels: Record<FilterStatus, string> = useMemo(() => ({
    ALL: t('filters.all'),
    PENDING: t('filters.pending'),
    CONFIRMED: t('filters.confirmed'),
    COMPLETED: t('filters.completed'),
  }), [t]);

  // ── 📊 DATA PROCESSING & SORTING ENGINE ──
  const processedAppointments = useMemo(() => {
    // 1. Omit baseline cancelled records immediately
    const activeItems = appointments.filter(a => a.status?.toUpperCase() !== 'CANCELLED');

    // 2. Sort chronologically: Newest records first at index 0 (using fallback creation fields)
    const sorted = [...activeItems].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.scheduled_start).getTime();
      const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.scheduled_start).getTime();
      return dateB - dateA;
    });

    // 3. Evaluate conditional filter matching array states
    if (activeFilter === 'ALL') return sorted;
    return sorted.filter(a => a.status?.toUpperCase() === activeFilter);
  }, [appointments, activeFilter]);

  if (isDoctor && !isVerified) {
    return <PendingApproval />;
  }

  const renderEmpty = () => {
    if (isLoading && !refreshing) return null;

    const filterKey = activeFilter.toLowerCase() as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

    return (
      <EmptyState
        icon="calendar-outline"
        title={t(`empty.${filterKey}.title`)}
        description={t(`empty.${filterKey}.desc`)}
      />
    );
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.pageWrapper}>
        <PageHeader
          title={t('header.title')}
          subtitle={isDoctor ? t('header.subtitleDoctor') : t('header.subtitlePatient')}
        />

        {/* ── 🎛️ ACCESSIBILITY FILTER CONTROLS ── */}
        <View style={styles.filterBar}>
          {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'] as FilterStatus[]).map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, isSelected && styles.filterTabActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                  {filterLabels[filter]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading && !refreshing && appointments.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            key={`grid-${numColumns}`}
            data={processedAppointments}
            numColumns={numColumns}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
            renderItem={({ item }) => (
              <View style={[
                styles.cardContainer,
                { maxWidth: `${100 / numColumns}%` }
              ]}>
                {/* 💡 CRITICAL FIX FOR EQUAL GROWTH DESIGN: 
                   The component container style applies flex: 1 layout bounds. 
                   Ensure inside <AppointmentCard /> that the topmost parent tag is set 
                   to { flex: 1, justifyContent: 'space-between' } so their structural bounds 
                   stretch and align perfectly matching card heights across rows!
                */}
                <AppointmentCard
                  appointment={item}
                  isDoctor={isDoctor}
                  onCancel={() => { }}
                  onAccept={isDoctor ? handleAccept : undefined}
                />
              </View>
            )}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pageWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: 1100,
      alignSelf: 'center',
    },
    filterBar: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    filterTab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterTabText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    filterTabTextActive: {
      color: '#FFFFFF',
    },
    listContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: 100,
      paddingTop: theme.spacing.sm,
      flexGrow: 1,
    },
    columnWrapper: {
      gap: theme.spacing.md,
      alignItems: 'stretch',
    },
    cardContainer: {
      flex: 1,
      marginBottom: theme.spacing.md,
      alignSelf: 'stretch',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
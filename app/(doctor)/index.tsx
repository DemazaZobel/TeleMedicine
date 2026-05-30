import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Card, EmptyState, PageHeader, ScreenContainer } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { DoctorCard, DoctorDetailsModal, FilterChips, SearchBar } from '../../src/features/patient';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/booking.store';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const styles = useMemo(() => createStyles(theme), [theme]);

  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

  // Booking Store
  const {
    notifications,
    fetchNotifications,
    appointments,
    fetchMyAppointments,
    setIsNotificationsDrawerOpen
  } = useBookingStore();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Discovery Store (Patient)
  const {
    doctors,
    isLoading,
    isLoadingMore,
    hasMore,
    searchQuery,
    selectedSpecialization,
    setSearchQuery,
    setSelectedSpecialization,
    fetchDoctors,
    fetchMoreDoctors
  } = useDiscoveryStore();

  // Doctor Store
  const { profile, isLoadingProfile, fetchProfile } = useDoctorStore();
  const [selectedDoctor, setSelectedDoctor] = React.useState<any>(null);

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      fetchDoctors();
      fetchMyAppointments();
    } else if (user?.role === 'DOCTOR') {
      fetchMyAppointments();
      fetchProfile();
    }
    fetchNotifications();
  }, [user?.role, fetchDoctors, fetchMyAppointments, fetchNotifications, fetchProfile]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleFilter = useCallback((spec: string | null) => {
    setSelectedSpecialization(spec);
  }, [setSelectedSpecialization]);

  // Guard for doctor loading and verification
  if (user?.role === 'DOCTOR') {
    if (isLoadingProfile && !profile) {
      return (
        <ScreenContainer centered>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </ScreenContainer>
      );
    }
    if (profile && !profile.is_verified) {
      return <PendingApproval />;
    }
  }

  const renderBellIcon = () => (
    <TouchableOpacity onPress={() => setIsNotificationsDrawerOpen(true)} style={styles.bell}>
      <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // ─── DOCTOR UI ─────────────────────────────────────────
  if (user?.role === 'DOCTOR') {
    const upcomingCount = appointments.filter(a => ['REQUESTED', 'CONFIRMED'].includes(a.status)).length;
    const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

    return (
      <ScreenContainer scrollable>
        <PageHeader
          title={`Welcome Dr. ${user.last_name}!`}
          subtitle="Manage your patients and appointments"
          rightElement={renderBellIcon()}
        />

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>{t("doctor:dashboardTitle")}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{upcomingCount}</Text>
              <Text style={styles.statLabel}>{t("appointment:upcoming")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{cancelledCount}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  // ─── PATIENT UI (Discovery) ─────────────────────────────
  const renderHeader = () => (
    <View style={styles.patientHeaderContainer}>
      <PageHeader
        title={`Hello, ${user?.first_name || 'Patient'}!`}
        subtitle="Find your doctor and book an appointment"
        rightElement={renderBellIcon()}
      />
      <View style={{ paddingHorizontal: theme.spacing.xl, marginTop: -theme.spacing.lg }}>
        <SearchBar initialValue={searchQuery} onSearch={handleSearch} />
        <FilterChips selected={selectedSpecialization} onSelect={handleFilter} />
      </View>

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="search-outline"
        title={t("patient:noDoctorsFound")}
        description={t("patient:noDoctorsDesc")}
      />
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <FlatList
        key={`grid-${numColumns}`}
        data={doctors}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.cardWrapper, { flex: 1, maxWidth: `${100 / numColumns}%` }]}>
            <DoctorCard
              doctor={item}
              onPress={() => setSelectedDoctor(item)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={() => fetchMoreDoctors()}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <DoctorDetailsModal
        visible={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        doctor={selectedDoctor}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    patientHeaderContainer: {
      backgroundColor: theme.colors.background,
    },
    bell: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      position: 'relative',
    },
    unreadBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: theme.colors.error,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    unreadBadgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    greeting: {
      ...theme.typography.h2,
      color: theme.colors.text,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    loader: {
      marginTop: theme.spacing.xl,
      alignItems: 'center',
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 100, // accommodate bottom tab bar
    },
    cardWrapper: {
      paddingHorizontal: theme.spacing.xl,
    },
    // Doctor specific styles
    cardTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statsCard: {
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      ...theme.typography.h3,
      color: theme.colors.primary,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.divider,
    },
    footerLoader: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
    },
  });
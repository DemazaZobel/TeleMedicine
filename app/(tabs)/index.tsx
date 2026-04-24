import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Card, EmptyState, ScreenContainer } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { DoctorCard, FilterChips, SearchBar } from '../../src/features/patient';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/booking.store';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Booking Store
  const { notifications, fetchNotifications, appointments, fetchMyAppointments } = useBookingStore();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Discovery Store (Patient)
  const {
    doctors,
    isLoading,
    searchQuery,
    selectedSpecialization,
    setSearchQuery,
    setSelectedSpecialization,
    fetchDoctors
  } = useDiscoveryStore();

  // Doctor Store
  const { profile, isLoadingProfile, fetchProfile } = useDoctorStore();

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      fetchDoctors();
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
    <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.bell}>
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome Dr. {user.last_name}!</Text>
            <Text style={styles.subtitle}>Manage your patients and appointments</Text>
          </View>
          {renderBellIcon()}
        </View>

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Your Dashboard</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{upcomingCount}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
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
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hello, {user?.first_name || 'Patient'}!</Text>
          <Text style={styles.subtitle}>Find your doctor and book an appointment</Text>
        </View>
        {renderBellIcon()}
      </View>
      <SearchBar initialValue={searchQuery} onSearch={handleSearch} />
      <FilterChips selected={selectedSpecialization} onSelect={handleFilter} />

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
        title="No Doctors Found"
        description="Try adjusting your search or selecting a different specialization."
      />
    );
  };

  const { width } = useWindowDimensions();
  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

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
              onPress={() => router.push(`/doctor/${item.id}` as any)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    patientHeaderContainer: {
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing.lg,
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
  });

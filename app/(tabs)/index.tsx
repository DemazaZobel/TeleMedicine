import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Card, EmptyState, PageHeader, ScreenContainer } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { AdvancedFilterModal, DiscoverySidebar, DoctorCard, FilterChips, SearchBar } from '../../src/features/patient';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/booking.store';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  
  // Discovery Store
  const { 
    doctors, 
    isLoading, 
    searchQuery, 
    selectedSpecialization,
    minFee,
    maxFee,
    minRating,
    location: locationFilter,
    availability,
    hospital,
    setSearchQuery,
    setSelectedSpecialization,
    setAdvancedFilters,
    fetchDoctors,
    fetchMoreDoctors,
    fetchSpecializations,
    isLoadingMore,
  } = useDiscoveryStore();

  // Doctor Store
  const { profile, isLoadingProfile, fetchProfile } = useDoctorStore();
  
  // Booking & Notifications
  const { 
    appointments, 
    notifications, 
    setIsNotificationsDrawerOpen, 
    fetchMyAppointments,
    fetchNotifications
  } = useBookingStore();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isDesktop = width > 992;
  const numColumns = isDesktop ? (isSidebarCollapsed ? 3 : 2) : 1;

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      fetchDoctors();
    } else if (user?.role === 'DOCTOR') {
      fetchProfile();
      fetchMyAppointments();
    }
    fetchNotifications();
    fetchSpecializations();
  }, [user?.role, fetchDoctors, fetchProfile, fetchMyAppointments, fetchNotifications, fetchSpecializations]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, [setSearchQuery]);

  const handleFilter = useCallback((spec: string | null) => {
    setSelectedSpecialization(spec);
  }, [setSelectedSpecialization]);

  const styles = useMemo(() => createStyles(theme, isDesktop), [theme, isDesktop]);

  // Active filter chips logic
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];
    if (selectedSpecialization) {
      chips.push({ 
        key: 'spec', 
        label: selectedSpecialization, 
        onClear: () => setSelectedSpecialization(null) 
      });
    }
    if (minFee !== null || maxFee !== null) {
      const label = minFee === null ? `Under Br ${maxFee}` : maxFee === null ? `Above Br ${minFee}` : `Br ${minFee}-${maxFee}`;
      chips.push({ 
        key: 'price', 
        label, 
        onClear: () => setAdvancedFilters({ minFee: null, maxFee: null }) 
      });
    }
    if (minRating) {
      chips.push({ 
        key: 'rating', 
        label: `${minRating}+ Stars`, 
        onClear: () => setAdvancedFilters({ minRating: null }) 
      });
    }
    if (locationFilter) {
      chips.push({ 
        key: 'location', 
        label: locationFilter, 
        onClear: () => setAdvancedFilters({ location: null }) 
      });
    }
    if (availability !== 'any') {
      chips.push({ 
        key: 'availability', 
        label: availability === 'today' ? 'Today' : 'This Week', 
        onClear: () => setAdvancedFilters({ availability: 'any' }) 
      });
    }
    return chips;
  }, [selectedSpecialization, minFee, maxFee, minRating, location, availability, setSelectedSpecialization, setAdvancedFilters]);

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
      <PageHeader
        title={`Hello, ${user?.first_name || 'Patient'}!`}
        subtitle="Find your doctor and book an appointment"
        rightElement={renderBellIcon()}
      />
      <View style={{ paddingHorizontal: theme.spacing.xl, marginTop: -theme.spacing.lg }}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar initialValue={searchQuery} onSearch={handleSearch} />
          </View>
          {!isDesktop && (
            <TouchableOpacity 
              style={[
                styles.filterBtn, 
                activeFilters.length > 0 && styles.filterBtnActive
              ]} 
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons 
                name="options-outline" 
                size={24} 
                color={activeFilters.length > 0 ? theme.colors.primary : theme.colors.textSecondary} 
              />
              {activeFilters.length > 0 && (
                <View style={styles.filterDot} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {activeFilters.length > 0 && (
          <View style={styles.activeFilterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {activeFilters.map(chip => (
                <TouchableOpacity key={chip.key} style={styles.activeChip} onPress={chip.onClear}>
                  <Text style={styles.activeChipText}>{chip.label}</Text>
                  <Ionicons name="close-circle" size={14} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!isDesktop && <FilterChips selected={selectedSpecialization} onSelect={handleFilter} />}
      </View>

      {!isDesktop && (
        <AdvancedFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          initialFilters={{
            minFee,
            maxFee,
            minRating,
            location: locationFilter,
            hospital,
            availability
          }}
          onApply={(filters) => {
            setAdvancedFilters(filters);
          }}
        />
      )}

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
      {renderHeader()}
      <View style={styles.mainLayout}>
        <View style={{ flex: 1 }}>
          <FlatList
            key={`grid-${numColumns}`}
            data={doctors}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.cardWrapper, { flex: 1, maxWidth: `${100 / numColumns}%` }]}>
                <DoctorCard
                  doctor={item}
                  onPress={() => router.push(`/doctor-profile/${item.id}` as any)}
                />
              </View>
            )}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={() => fetchMoreDoctors()}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
        {isDesktop && (
          <DiscoverySidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme, isDesktop: boolean) =>
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
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    filterBtn: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    filterBtnActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '10',
    },
    filterDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
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
    mainLayout: {
      flex: 1,
      flexDirection: 'row',
    },
    activeFilterRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    activeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
      gap: 6,
    },
    activeChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    footerLoader: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
    },
  });
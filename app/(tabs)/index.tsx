import React, { useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer, Card, Button, EmptyState } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { SearchBar, FilterChips, DoctorCard } from '../../src/features/patient';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import { useTheme } from '../../src/theme';
import type { Theme } from '../../src/theme';

export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      fetchDoctors();
    }
  }, [user?.role, fetchDoctors]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleFilter = useCallback((spec: string | null) => {
    setSelectedSpecialization(spec);
  }, [setSelectedSpecialization]);

  // Guard for unverified doctors
  if (user?.role === 'DOCTOR' && !isVerified) {
    return <PendingApproval />;
  }

  // ─── DOCTOR UI ─────────────────────────────────────────
  if (user?.role === 'DOCTOR') {
    return (
      <ScreenContainer scrollable>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Dr. {user.last_name}!</Text>
          <Text style={styles.subtitle}>Manage your patients and appointments</Text>
        </View>

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Your Dashboard</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
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
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.first_name || 'Patient'}!</Text>
        <Text style={styles.subtitle}>Find your doctor and book an appointment</Text>
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

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <DoctorCard 
              doctor={item} 
              onPress={() => console.log('Navigate to doctor profile', item.id)} 
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
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing.lg,
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

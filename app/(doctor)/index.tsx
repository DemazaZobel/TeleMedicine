import { AddAvailabilityModal } from '@/features/booking/components/AddAvailabilityModal';
import { AppointmentDetail, ProviderAvailabilityRuleDetail } from '@/features/booking/types/bookingTypes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { EmptyState, PageHeader, ScreenContainer } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import type {
  DoctorProfile,
} from '../../src/features/doctor/types/doctor.types';
import { DoctorCard, DoctorDetailsModal, FilterChips, SearchBar } from '../../src/features/patient';
import { useTranslation } from '../../src/i18n'; // adjust path if needed
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/booking.store';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';

// Add this helper near the top of the file, after imports
function StatItem({ value, label, color, theme }: {
  value: number;
  label: string;
  color?: string;
  theme: Theme;
}) {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    }}>
      <Text style={{
        fontSize: 26,
        fontWeight: '700',
        color: color ?? theme.colors.primary,
        marginBottom: 4,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.2,
      }}>
        {label}
      </Text>
    </View>
  );
}

const AVATAR_COLORS = [
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#EEEDFE', text: '#534AB7' },
  { bg: '#FAECE7', text: '#993C1D' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#FBEAF0', text: '#993556' },
];

function getAvatarColor(name: string) {
  const index = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function to12Hour(time: string): string {
  const d = new Date(time);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(first?: string, last?: string): string {
  return `${(first ?? '').charAt(0)}${(last ?? '').charAt(0)}`.toUpperCase();
}


// ─── TodayAppointmentsCard ────────────────────────────────────────────────────

function TodayAppointmentsCard({ appointments, theme }: {
  appointments: AppointmentDetail[];
  theme: Theme;
}) {
  const { t } = useTranslation('homescreenComponents');
  const styles = useMemo(() => createTodayStyles(theme), [theme]);
  const router = useRouter();

  const todayAppts = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return appointments
      .filter(a => {
        const start = new Date(a.scheduled_start);
        return (
          start >= startOfDay &&
          start <= endOfDay &&
          a.status !== 'CANCELLED' &&
          a.status !== 'EXPIRED'
        );
      })
      .sort((a, b) =>
        new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
      );
  }, [appointments]);

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    CONFIRMED: { label: t('todayAppointments.status.confirmed'), bg: '#E1F5EE', text: '#0F6E56' },
    REQUESTED: { label: t('todayAppointments.status.pending'), bg: '#FAEEDA', text: '#854F0B' },
    COMPLETED: { label: t('todayAppointments.status.completed'), bg: '#EAF3DE', text: '#3B6D11' },
    NO_SHOW: { label: t('todayAppointments.status.noShow'), bg: '#FCEBEB', text: '#A32D2D' },
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.title}>{t('todayAppointments.title')}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
      </View>

      {todayAppts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sunny-outline" size={32} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>{t('todayAppointments.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('todayAppointments.emptySubtitle')}</Text>
        </View>
      ) : (
        todayAppts.map((appt, index) => {
          const firstName = appt.patient_first_name ?? '';
          const lastName = appt.patient_last_name ?? '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Patient';
          const initials = getInitials(firstName, lastName);
          const avatarColor = getAvatarColor(fullName);

          const startTime = to12Hour(appt.scheduled_start);
          const endTime = to12Hour(appt.scheduled_end);

          const durationMins = Math.round(
            (new Date(appt.scheduled_end).getTime() - new Date(appt.scheduled_start).getTime()) / 60000
          );
          const durationLabel = durationMins >= 60
            ? `${Math.floor(durationMins / 60)}h${durationMins % 60 ? ` ${durationMins % 60}m` : ''}`
            : `${durationMins}m`;

          const status = statusConfig[appt.status] ?? {
            label: appt.status, bg: '#F1EFE8', text: '#5F5E5A'
          };

          const isNext = index === 0 && appt.status === 'CONFIRMED';

          return (
            <TouchableOpacity
              key={String(appt.id)}
              style={[styles.apptRow, isNext && styles.apptRowHighlighted]}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/appointments`)}
            >
              {isNext && <View style={styles.nextIndicator} />}

              {/* Avatar */}
              <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
                <Text style={[styles.avatarText, { color: avatarColor.text }]}>{initials}</Text>
              </View>

              {/* Info */}
              <View style={styles.apptInfo}>
                <Text style={styles.patientName}>{fullName}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.metaText}>{startTime} – {endTime}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{durationLabel}</Text>
                  <View style={styles.metaDot} />
                  <Ionicons
                    name={appt.mode === 'ONLINE' ? 'videocam-outline' : 'walk-outline'}
                    size={12}
                    color={theme.colors.textTertiary}
                  />
                  <Text style={styles.metaText}>
                    {appt.mode === 'ONLINE'
                      ? t('todayAppointments.mode.online')
                      : t('todayAppointments.mode.inPerson')}
                  </Text>
                </View>
              </View>

              {/* Status badge */}
              <View style={[styles.badge, { backgroundColor: status.bg }]}>
                <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {todayAppts.length > 0 && (
        <TouchableOpacity
          style={styles.viewAll}
          onPress={() => router.push(`/(tabs)/appointments`)}
        >
          <Text style={styles.viewAllText}>{t('todayAppointments.viewAll')}</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── QuickActionsCard ─────────────────────────────────────────────────────────

function QuickActionsCard({ theme }: { theme: Theme }) {
  const { t } = useTranslation('homescreenComponents');
  const router = useRouter();
  const styles = useMemo(() => createQuickStyles(theme), [theme]);
  const [showAddHours, setShowAddHours] = useState(false);
  const { createAvailabilityRule, isLoading } = useBookingStore();

  const actions = [
    {
      icon: 'calendar-outline' as const,
      label: t('quickActions.actions.addHours'),
      color: '#185FA5',
      bg: '#E6F1FB',
      onPress: () => setShowAddHours(true),
    },
    {
      icon: 'people-outline' as const,
      label: t('quickActions.actions.patients'),
      color: '#0F6E56',
      bg: '#E1F5EE',
      onPress: () => router.push('/patients'),
    },
    {
      icon: 'wallet-outline' as const,
      label: t('quickActions.actions.earnings'),
      color: '#854F0B',
      bg: '#FAEEDA',
      onPress: () => router.push('/(doctor)/wallet'),
    },
    {
      icon: 'chatbubble-outline' as const,
      label: t('quickActions.actions.messages'),
      color: '#534AB7',
      bg: '#EEEDFE',
      onPress: () => router.push('/chat'),
    },
    {
      icon: 'time-outline' as const,
      label: t('quickActions.actions.schedule'),
      color: '#993C1D',
      bg: '#FAECE7',
      onPress: () => router.push('/availability'),
    },
    {
      icon: 'person-outline' as const,
      label: t('quickActions.actions.profile'),
      color: '#3B6D11',
      bg: '#EAF3DE',
      onPress: () => router.push('../profile'),
    },
  ];

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="flash-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.title}>{t('quickActions.title')}</Text>
        </View>

        <View style={styles.grid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionBtn}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <AddAvailabilityModal
        visible={showAddHours}
        onClose={() => setShowAddHours(false)}
        onConfirm={createAvailabilityRule}
        isLoading={isLoading}
      />
    </>
  );
}

// ─── ScheduleCoverageCard ─────────────────────────────────────────────────────

function ScheduleCoverageCard({ theme }: { theme: Theme }) {
  const { t } = useTranslation('homescreenComponents');
  const styles = useMemo(() => createScheduleStyles(theme), [theme]);
  const router = useRouter();
  const { availabilityRules, appointments, fetchAvailabilityRules } = useBookingStore();

  useEffect(() => {
    fetchAvailabilityRules();
  }, [fetchAvailabilityRules]);

  // Day keys map to translation keys — order matches Python weekday (Mon=0)
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get start of current week (Monday)
  const weekStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  }, []);

  const coverage = useMemo(() => {
    return DAY_KEYS.map((dayKey, pythonIndex) => {
      const rules = (availabilityRules ?? []).filter(r => r.weekday === pythonIndex);
      const hasAvailability = rules.length > 0;

      const totalAvailableMinutes = rules.reduce((sum, r) => {
        const [sh, sm] = r.start_time.split(':').map(Number);
        const [eh, em] = r.end_time.split(':').map(Number);
        return sum + ((eh * 60 + em) - (sh * 60 + sm));
      }, 0);

      const jsDay = pythonIndex === 6 ? 0 : pythonIndex + 1;
      const dayAppts = (appointments ?? []).filter(a => {
        const d = new Date(a.scheduled_start);
        const apptJsDay = d.getDay();
        const isThisWeek = d >= weekStart && d < new Date(weekStart.getTime() + 7 * 86400000);
        return (
          apptJsDay === jsDay &&
          isThisWeek &&
          ['CONFIRMED', 'COMPLETED', 'REQUESTED'].includes(a.status)
        );
      });

      const bookedMinutes = dayAppts.reduce((sum, a) => {
        const diffMs = new Date(a.scheduled_end).getTime() - new Date(a.scheduled_start).getTime();
        return sum + Math.round(diffMs / 60000);
      }, 0);

      const fillRate = totalAvailableMinutes > 0
        ? Math.min(1, bookedMinutes / totalAvailableMinutes)
        : 0;

      const timeLabel = rules.length > 0
        ? (() => {
          const earliest = rules.reduce((min, r) =>
            r.start_time < min ? r.start_time : min, rules[0].start_time);
          const latest = rules.reduce((max, r) =>
            r.end_time > max ? r.end_time : max, rules[0].end_time);
          const fmt = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
          };
          return `${fmt(earliest)} – ${fmt(latest)}`;
        })()
        : null;

      const todayJsDay = new Date().getDay();
      const isToday = jsDay === todayJsDay;

      return {
        dayKey,
        fullName: DAY_FULL[pythonIndex],
        hasAvailability,
        fillRate,
        bookedSlots: dayAppts.length,
        timeLabel,
        isToday,
      };
    });
  }, [availabilityRules, appointments, weekStart]);

  const coveredDays = coverage.filter(d => d.hasAvailability).length;
  const uncoveredDays = coverage.filter(d => !d.hasAvailability);

  function getFillColor(rate: number): string {
    if (rate >= 0.8) return '#1D9E75';
    if (rate >= 0.4) return '#378ADD';
    return '#3B82F6';
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.title}>{t('scheduleCoverage.title')}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.coveredText}>
            {t('scheduleCoverage.daysSet', { count: coveredDays })}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/availability')}
            style={styles.editBtn}
          >
            <Ionicons name="add" size={14} color={theme.colors.primary} />
            <Text style={styles.editBtnText}>{t('scheduleCoverage.edit')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Day rows */}
      <View style={styles.body}>
        {coverage.map((day) => (
          <View key={day.dayKey} style={[styles.dayRow, day.isToday && styles.dayRowToday]}>
            {day.isToday && <View style={styles.todayAccent} />}

            {/* Day name */}
            <View style={styles.dayLabelWrap}>
              <Text style={[
                styles.dayName,
                day.isToday && styles.dayNameToday,
                !day.hasAvailability && styles.dayNameMuted,
              ]}>
                {t(`scheduleCoverage.days.${day.dayKey}`)}
              </Text>
              {day.isToday && <View style={styles.todayDot} />}
            </View>

            {/* Bar or no-availability state */}
            {day.hasAvailability ? (
              <View style={styles.barSection}>
                <View style={styles.barMeta}>
                  <Text style={styles.timeLabel}>{day.timeLabel}</Text>
                  <Text style={styles.fillLabel}>
                    {t(
                      day.bookedSlots === 1
                        ? 'scheduleCoverage.appointments_one'
                        : 'scheduleCoverage.appointments_other',
                      { count: day.bookedSlots }
                    )}
                    {' · '}
                    {t('scheduleCoverage.fillRate', { percent: Math.round(day.fillRate * 100) })}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[
                    styles.barFill,
                    {
                      width: `${Math.round(day.fillRate * 100)}%` as any,
                      backgroundColor: getFillColor(day.fillRate),
                    },
                  ]} />
                </View>
              </View>
            ) : (
              <View style={styles.noAvailWrap}>
                <Text style={styles.noAvailText}>{t('scheduleCoverage.noHoursSet')}</Text>
                <TouchableOpacity
                  onPress={() => router.push('/availability')}
                  style={styles.addBtn}
                >
                  <Ionicons name="add-circle-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.addBtnText}>{t('scheduleCoverage.add')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Nudge banner */}
      {uncoveredDays.length > 0 && (
        <TouchableOpacity
          style={styles.nudgeBanner}
          onPress={() => router.push('/availability')}
          activeOpacity={0.8}
        >
          <Ionicons name="information-circle-outline" size={16} color="#854F0B" />
          <Text style={styles.nudgeText}>
            {uncoveredDays.length === 1
              ? t('scheduleCoverage.nudge.oneDay', { day: t(`scheduleCoverage.days.${uncoveredDays[0].dayKey}`) })
              : t('scheduleCoverage.nudge.manyDays', { count: uncoveredDays.length })}
          </Text>
          <Ionicons name="arrow-forward" size={14} color="#854F0B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── SuggestionsCard ──────────────────────────────────────────────────────────

interface SuggestionsCardProps {
  appointments: AppointmentDetail[];
  availabilityRules: ProviderAvailabilityRuleDetail[];
  profile: DoctorProfile | null;
  theme: Theme;
}

function SuggestionsCard({ appointments, availabilityRules, profile, theme }: SuggestionsCardProps) {
  const { t } = useTranslation('homescreenComponents');
  const styles = useMemo(() => createSuggestionStyles(theme), [theme]);
  const router = useRouter();
  const [showAddHours, setShowAddHours] = useState(false);
  const { createAvailabilityRule, isLoading } = useBookingStore();

  // Day keys for availability nudge (same order as ScheduleCoverageCard)
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  const suggestions = useMemo(() => {
    const items: {
      id: string;
      icon: keyof typeof Ionicons.glyphMap;
      iconBg: string;
      iconColor: string;
      title: string;
      subtitle: string;
      onPress: () => void;
      priority: number;
    }[] = [];

    // 1. Pending appointments
    const pendingCount = appointments.filter(a => a.status === 'REQUESTED').length;
    if (pendingCount > 0) {
      items.push({
        id: 'pending',
        icon: 'time-outline',
        iconBg: '#FAEEDA',
        iconColor: '#854F0B',
        title: t(
          pendingCount === 1
            ? 'suggestions.pending.title_one'
            : 'suggestions.pending.title_other',
          { count: pendingCount }
        ),
        subtitle: t('suggestions.pending.subtitle'),
        onPress: () => router.push('/(tabs)/appointments'),
        priority: 1,
      });
    }

    // 2. Missing availability days
    const coveredWeekdays = new Set((availabilityRules ?? []).map(r => r.weekday));
    const missingIndices = [0, 1, 2, 3, 4, 5, 6].filter(i => !coveredWeekdays.has(i));

    if (missingIndices.length > 0 && missingIndices.length < 7) {
      items.push({
        id: 'availability',
        icon: 'calendar-outline',
        iconBg: '#E6F1FB',
        iconColor: '#185FA5',
        title: missingIndices.length === 1
          ? t('suggestions.availability.titleOneDay', {
            day: t(`scheduleCoverage.days.${DAY_KEYS[missingIndices[0]]}`)
          })
          : t('suggestions.availability.titleManyDays', { count: missingIndices.length }),
        subtitle: t('suggestions.availability.subtitle'),
        onPress: () => setShowAddHours(true),
        priority: 2,
      });
    }

    // 3. Bio missing
    if (!profile?.biography) {
      items.push({
        id: 'bio',
        icon: 'create-outline',
        iconBg: '#EEEDFE',
        iconColor: '#534AB7',
        title: t('suggestions.bio.title'),
        subtitle: t('suggestions.bio.subtitle'),
        onPress: () => router.push('/(tabs)/profile'),
        priority: 3,
      });
    }

    // 4. Consultation fee not set
    if (!profile?.consultation_fee || Number(profile.consultation_fee) === 0) {
      items.push({
        id: 'fee',
        icon: 'cash-outline',
        iconBg: '#E1F5EE',
        iconColor: '#0F6E56',
        title: t('suggestions.fee.title'),
        subtitle: t('suggestions.fee.subtitle'),
        onPress: () => router.push('/(tabs)/profile'),
        priority: 4,
      });
    }

    // 5. No reviews yet
    const hasCompleted = appointments.some(a => a.status === 'COMPLETED');
    const hasReviews = profile?.average_rating && Number(profile.average_rating) > 0;
    if (hasCompleted && !hasReviews) {
      items.push({
        id: 'reviews',
        icon: 'star-outline',
        iconBg: '#FAEEDA',
        iconColor: '#854F0B',
        title: t('suggestions.reviews.title'),
        subtitle: t('suggestions.reviews.subtitle'),
        onPress: () => router.push('/(tabs)/appointments'),
        priority: 5,
      });
    }

    // 6. All good
    if (items.length === 0) {
      items.push({
        id: 'allgood',
        icon: 'checkmark-circle-outline',
        iconBg: '#E1F5EE',
        iconColor: '#0F6E56',
        title: t('suggestions.allGood.title'),
        subtitle: t('suggestions.allGood.subtitle'),
        onPress: () => { },
        priority: 99,
      });
    }

    return items.sort((a, b) => a.priority - b.priority);
  }, [appointments, availabilityRules, profile, t]);

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.title}>{t('suggestions.title')}</Text>
          {suggestions[0]?.id !== 'allgood' && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{suggestions.length}</Text>
            </View>
          )}
        </View>

        {suggestions.map((s, index) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.row,
              index === suggestions.length - 1 && styles.rowLast,
            ]}
            onPress={s.onPress}
            activeOpacity={s.id === 'allgood' ? 1 : 0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: s.iconBg }]}>
              <Ionicons name={s.icon} size={18} color={s.iconColor} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>{s.title}</Text>
              <Text style={styles.rowSubtitle}>{s.subtitle}</Text>
            </View>
            {s.id !== 'allgood' && (
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <AddAvailabilityModal
        visible={showAddHours}
        onClose={() => setShowAddHours(false)}
        onConfirm={createAvailabilityRule}
        isLoading={isLoading}
      />
    </>
  );
}



export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { t: tDashboard } = useTranslation('dashboard');
  const { t: tPatient } = useTranslation('patient');

  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;

  // Booking Store
  const {
    notifications,
    fetchNotifications,
    appointments,
    fetchMyAppointments,
    availabilityRules,
    setIsNotificationsDrawerOpen,
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
    const isDesktop = width > 900;

    const upcomingCount = appointments.filter(a => a.status === 'CONFIRMED').length;
    const pendingCount = appointments.filter(a => a.status === 'REQUESTED').length;
    const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;
    const noShowCount = appointments.filter(a => a.status === 'NO_SHOW').length;
    const thisWeekCount = appointments.filter(a => {
      if (!['CONFIRMED', 'COMPLETED'].includes(a.status)) return false;
      const start = new Date(a.scheduled_start);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return start >= weekStart && start < weekEnd;
    }).length;

    return (
      <ScreenContainer scrollable>
        <PageHeader
          title={tDashboard('doctor.welcome', { lastName: user.last_name })}
          subtitle={tDashboard('doctor.subtitle')}
          rightElement={renderBellIcon()}
        />

        {/* ── Stats ── */}
        {isDesktop ? (
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <StatItem value={upcomingCount} label={tDashboard('stats.upcoming')} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={pendingCount} label={tDashboard('stats.pendingReview')}
                  color={pendingCount > 0 ? theme.colors.warning : theme.colors.textSecondary} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={thisWeekCount} label={tDashboard('stats.thisWeek')} color={theme.colors.success} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={completedCount} label={tDashboard('stats.completed')} color={theme.colors.success} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={cancelledCount} label={tDashboard('stats.cancelled')}
                  color={cancelledCount > 0 ? theme.colors.error : theme.colors.textSecondary} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={noShowCount} label={tDashboard('stats.noShows')}
                  color={noShowCount > 0 ? theme.colors.error : theme.colors.textSecondary} theme={theme} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <StatItem value={upcomingCount} label={tDashboard('stats.upcoming')} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={pendingCount} label={tDashboard('stats.pendingReview')}
                  color={pendingCount > 0 ? theme.colors.warning : theme.colors.textSecondary} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={thisWeekCount} label={tDashboard('stats.thisWeek')} color={theme.colors.success} theme={theme} />
              </View>
            </View>
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <StatItem value={completedCount} label={tDashboard('stats.completed')} color={theme.colors.success} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={cancelledCount} label={tDashboard('stats.cancelled')}
                  color={cancelledCount > 0 ? theme.colors.error : theme.colors.textSecondary} theme={theme} />
                <View style={styles.statDivider} />
                <StatItem value={noShowCount} label={tDashboard('stats.noShows')}
                  color={noShowCount > 0 ? theme.colors.error : theme.colors.textSecondary} theme={theme} />
              </View>
            </View>
          </View>
        )}

        {/* ── Grid: responsive 1-col mobile / 2-col desktop ── */}
        {isDesktop ? (
          <View style={styles.desktopGridWrapper}>
            <View style={styles.desktopColumn}>
              <TodayAppointmentsCard appointments={appointments} theme={theme} />
              <View style={styles.cardSpacer} />
              <QuickActionsCard theme={theme} />
            </View>
            <View style={styles.desktopColumn}>
              <SuggestionsCard
                appointments={appointments}
                availabilityRules={availabilityRules}
                profile={profile}
                theme={theme}
              />
              <View style={styles.cardSpacer} />
              <ScheduleCoverageCard theme={theme} />
            </View>
          </View>
        ) : (
          <View style={styles.oneCol}>
            <TodayAppointmentsCard appointments={appointments} theme={theme} />
            <QuickActionsCard theme={theme} />
            <ScheduleCoverageCard theme={theme} />
            <SuggestionsCard
              appointments={appointments}
              availabilityRules={availabilityRules}
              profile={profile}
              theme={theme}
            />
          </View>
        )}

      </ScreenContainer>
    );
  }

  // ─── PATIENT UI (Discovery) ─────────────────────────────
  const renderHeader = () => (
    <View style={styles.patientHeaderContainer}>
      <PageHeader
        title={tPatient('home.greeting', { firstName: user?.first_name || tPatient('home.defaultName') })}
        subtitle={tPatient('home.subtitle')}
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
        title={tPatient('home.emptyTitle')}
        description={tPatient('home.emptyDescription')}
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
    // ── Shared ──────────────────────────────────────────
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
    loader: {
      marginTop: theme.spacing.xl,
      alignItems: 'center',
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    cardWrapper: {
      paddingHorizontal: theme.spacing.xl,
    },
    footerLoader: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
    },

    // ── Doctor stats ─────────────────────────────────────
    statsGrid: {
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    statsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      height: 44,
      backgroundColor: theme.colors.border,
    },

    // ── Doctor layout grids ───────────────────────────────
    oneCol: {
      // Mobile: full-width stacked cards with horizontal padding
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.md,
      paddingBottom: theme.spacing['4xl'],
    },
    twoCol: {
      // Desktop: side-by-side columns
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    col: {
      flex: 1,
      minWidth: 0,
    },

    // ── Patient UI ───────────────────────────────────────
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

    // Add or merge these into your createStyles object
    desktopGridWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: theme.spacing.md, // Adjust based on your theme structure
    },
    desktopColumn: {
      flex: 1,
      flexDirection: 'column',
      // Gives an even gap between the left and right columns
      marginHorizontal: theme.spacing.sm,
    },
    cardSpacer: {
      // This replaces your bad gaps with a clean vertical margin between stacked cards
      height: theme.spacing.md,
    },
  });

function createTodayStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,

      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing['2xl'],
      gap: 8,
    },
    emptyTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    emptySubtitle: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
    apptRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '60',
      gap: 12,
    },
    apptRowHighlighted: {
      backgroundColor: theme.colors.primaryLight + '10',
    },
    nextIndicator: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: theme.colors.primary,
      borderRadius: 0,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '700',
    },
    apptInfo: {
      flex: 1,
      minWidth: 0,
    },
    patientName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.colors.textTertiary,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      flexShrink: 0,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    viewAll: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    viewAllText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });
}


function createQuickStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    actionBtn: {
      width: '30%',
      flexGrow: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      gap: 8,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
}


function createScheduleStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    coveredText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    editBtnText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    body: {
      paddingVertical: theme.spacing.sm,
    },
    dayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 10,
      gap: 12,
    },
    dayRowToday: {
      backgroundColor: theme.colors.primaryLight + '08',
    },
    todayAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: theme.colors.primary,
      borderRadius: 0,
    },
    dayLabelWrap: {
      width: 36,
      alignItems: 'center',
      gap: 3,
    },
    dayName: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    dayNameToday: {
      color: theme.colors.primary,
    },
    dayNameMuted: {
      color: theme.colors.textTertiary,
    },
    todayDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    barSection: {
      flex: 1,
      gap: 5,
    },
    barMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    fillLabel: {
      fontSize: 11,
      color: theme.colors.textTertiary,
    },
    barTrack: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 999,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 999,
      minWidth: 4,
    },
    noAvailWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    noAvailText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      fontStyle: 'italic',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primaryLight + '20',
    },
    addBtnText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    nudgeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: '#FAEEDA',
      borderTopWidth: 1,
      borderTopColor: '#FAC775',
    },
    nudgeText: {
      flex: 1,
      fontSize: 12,
      color: '#854F0B',
      lineHeight: 18,
    },
  });
}


function createSuggestionStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    countBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.warning,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#fff',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '60',
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1,
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
    },
    rowTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 3,
    },
    rowSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 17,
    },
  });
}


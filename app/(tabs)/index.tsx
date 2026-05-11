import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Card, EmptyState, PageHeader, ScreenContainer } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { DoctorDetailsModal, FilterChips } from '../../src/features/patient';
import type { ProviderSearchResult } from '../../src/features/doctor/types/doctor.types';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/booking.store';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import { useDoctorStore } from '../../src/store/doctor.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';

const HERO_SLIDES = [
  {
    id: 'hero-1',
    title: 'Find doctors easily',
    subtitle: 'Discover verified specialists near you in Ethiopia.',
    icon: 'search-outline' as const,
  },
  {
    id: 'hero-2',
    title: 'Best healthcare platform in Ethiopia',
    subtitle: 'Trusted providers, smooth booking, and reliable support.',
    icon: 'ribbon-outline' as const,
  },
  {
    id: 'hero-3',
    title: 'Access your doctor remotely',
    subtitle: 'Consult online with secure and convenient care access.',
    icon: 'videocam-outline' as const,
  },
  {
    id: 'hero-4',
    title: 'Book appointments in seconds',
    subtitle: 'Choose time slots instantly and manage visits with ease.',
    icon: 'flash-outline' as const,
  },
  {
    id: 'hero-5',
    title: 'Trusted healthcare network',
    subtitle: 'From general care to specialists, all in one app.',
    icon: 'shield-checkmark-outline' as const,
  },
];

const TESTIMONIALS = [
  {
    id: 'tm-1',
    name: 'Marta T.',
    rating: 5,
    text: 'Booking a specialist took less than five minutes. It feels premium and very easy to use.',
  },
  {
    id: 'tm-2',
    name: 'Abel K.',
    rating: 5,
    text: 'Great doctor quality and clear appointment flow. This is the best digital care experience I have used.',
  },
  {
    id: 'tm-3',
    name: 'Sara M.',
    rating: 4.8,
    text: 'The reminders and follow-up experience are excellent. Works smoothly on both phone and desktop.',
  },
  {
    id: 'tm-4',
    name: 'Nati B.',
    rating: 5,
    text: 'I found a dermatologist quickly and booked instantly. Highly recommended for busy people.',
  },
];

function FadeInSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    notifications,
    fetchNotifications,
    appointments,
    fetchMyAppointments,
    setIsNotificationsDrawerOpen,
  } = useBookingStore();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const {
    doctors,
    isLoading,
    selectedSpecialization,
    setSelectedSpecialization,
    fetchDoctors,
  } = useDiscoveryStore();
  const { profile, isLoadingProfile, fetchProfile } = useDoctorStore();

  const [selectedDoctor, setSelectedDoctor] = useState<ProviderSearchResult | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [visibleDoctorCount, setVisibleDoctorCount] = useState(6);
  const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false);

  const heroRef = useRef<FlatList<(typeof HERO_SLIDES)[number]>>(null);
  const testimonialRef = useRef<FlatList<(typeof TESTIMONIALS)[number]>>(null);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1200;
  const heroSlideWidth = width - theme.spacing.xl * 2;
  const testimonialCardWidth = Math.min(560, width * 0.78);

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

  useEffect(() => {
    if (user?.role !== 'PATIENT') return;
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== 'PATIENT') return;
    const timer = setInterval(() => {
      setActiveTestimonialIndex((prev) => {
        const next = (prev + 1) % TESTIMONIALS.length;
        testimonialRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5200);
    return () => clearInterval(timer);
  }, [user?.role]);

  const handleFilter = useCallback((spec: string | null) => {
    setSelectedSpecialization(spec);
  }, [setSelectedSpecialization]);

  const promptAuth = useCallback((actionLabel: string) => {
    Alert.alert(
      'Login Required',
      `Please log in or sign up to ${actionLabel}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
        { text: 'Sign up', onPress: () => router.push('/(auth)/register') },
      ],
    );
  }, [router]);

  const handleBookDoctor = useCallback((doctor: ProviderSearchResult) => {
    if (!isAuthenticated) {
      promptAuth('book appointments');
      return;
    }
    setSelectedDoctor(doctor);
  }, [isAuthenticated, promptAuth]);

  const handleSaveDoctor = useCallback(() => {
    if (!isAuthenticated) {
      promptAuth('save doctors');
      return;
    }
    Alert.alert('Saved', 'Doctor added to your saved list.');
  }, [isAuthenticated, promptAuth]);

  const mixedAllDoctors = useMemo(() => {
    if (!doctors.length) return [];
    const grouped = new Map<string, ProviderSearchResult[]>();
    doctors.forEach((doctor) => {
      const key = (doctor.specialization || 'General').trim();
      const current = grouped.get(key) || [];
      current.push(doctor);
      grouped.set(key, current);
    });
    const buckets = Array.from(grouped.values()).map((arr) => [...arr]);
    const result: ProviderSearchResult[] = [];
    let cursor = 0;
    while (result.length < doctors.length && buckets.some((bucket) => bucket.length > 0)) {
      const index = cursor % buckets.length;
      const nextDoctor = buckets[index].shift();
      if (nextDoctor) result.push(nextDoctor);
      cursor += 1;
    }
    return result;
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialization) return mixedAllDoctors;
    const selected = selectedSpecialization.toLowerCase();
    return doctors.filter((doctor) =>
      (doctor.specialization || '').toLowerCase().includes(selected),
    );
  }, [doctors, selectedSpecialization, mixedAllDoctors]);

  const doctorsToRender = useMemo(
    () => filteredDoctors.slice(0, visibleDoctorCount),
    [filteredDoctors, visibleDoctorCount],
  );

  const hasMoreDoctors = visibleDoctorCount < filteredDoctors.length;

  useEffect(() => {
    setVisibleDoctorCount(6);
    setIsCategoryTransitioning(true);
    const timer = setTimeout(() => setIsCategoryTransitioning(false), 260);
    return () => clearTimeout(timer);
  }, [selectedSpecialization]);

  if (user?.role === 'DOCTOR') {
    if (isLoadingProfile && !profile) {
      return (
        <ScreenContainer centered>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </ScreenContainer>
      );
    }
    if (profile && !profile.is_verified) return <PendingApproval />;

    const upcomingCount = appointments.filter((a) => ['REQUESTED', 'CONFIRMED'].includes(a.status)).length;
    const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

    return (
      <ScreenContainer scrollable>
        <PageHeader
          title={`Welcome Dr. ${user?.last_name}`}
          subtitle="Manage your patients and appointments"
          rightElement={(
            <TouchableOpacity onPress={() => setIsNotificationsDrawerOpen(true)} style={styles.bell}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        />
        <Card style={styles.doctorStatsCard}>
          <Text style={styles.doctorStatsTitle}>Your Dashboard</Text>
          <View style={styles.doctorStatsRow}>
            <View style={styles.doctorStatItem}>
              <Text style={styles.doctorStatNumber}>{upcomingCount}</Text>
              <Text style={styles.doctorStatLabel}>Upcoming</Text>
            </View>
            <View style={styles.doctorStatsDivider} />
            <View style={styles.doctorStatItem}>
              <Text style={styles.doctorStatNumber}>{completedCount}</Text>
              <Text style={styles.doctorStatLabel}>Completed</Text>
            </View>
            <View style={styles.doctorStatsDivider} />
            <View style={styles.doctorStatItem}>
              <Text style={styles.doctorStatNumber}>{cancelledCount}</Text>
              <Text style={styles.doctorStatLabel}>Cancelled</Text>
            </View>
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  const doctorCardWidth = isMobile ? '100%' : isTablet ? '48.5%' : '32%';

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInSection delay={30}>
          <View style={styles.headerWrap}>
            <PageHeader
              title={`Hello, ${user?.first_name || 'Patient'}!`}
              subtitle="Book care quickly from Ethiopia's modern healthcare network"
              rightElement={(
                <TouchableOpacity onPress={() => setIsNotificationsDrawerOpen(true)} style={styles.bell}>
                  <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </FadeInSection>

        <FadeInSection delay={70}>
          <FlatList
            ref={heroRef}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            data={HERO_SLIDES}
            keyExtractor={(item) => item.id}
            style={styles.heroList}
            onMomentumScrollEnd={(event) => {
              const idx = Math.round(event.nativeEvent.contentOffset.x / heroSlideWidth);
              setActiveHeroIndex(idx);
            }}
            getItemLayout={(_, index) => ({ length: heroSlideWidth, offset: heroSlideWidth * index, index })}
            renderItem={({ item }) => (
              <View style={[styles.heroSlide, { width: heroSlideWidth }]}>
                <View style={styles.heroGlowTop} />
                <View style={styles.heroGlowBottom} />
                <View style={styles.heroBadge}>
                  <Ionicons name={item.icon} size={14} color="#e6fff8" />
                  <Text style={styles.heroBadgeText}>MedLink Prime</Text>
                </View>
                <Text style={styles.heroTitle}>{item.title}</Text>
                <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
              </View>
            )}
          />
          <View style={styles.heroDots}>
            {HERO_SLIDES.map((slide, idx) => (
              <View key={slide.id} style={[styles.dot, idx === activeHeroIndex && styles.dotActive]} />
            ))}
          </View>
        </FadeInSection>

        <FadeInSection delay={110}>
          <Card style={styles.metricCard}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>12,400+</Text>
              <Text style={styles.metricLabel}>Appointments</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>516+</Text>
              <Text style={styles.metricLabel}>Doctors</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>4.9/5</Text>
              <Text style={styles.metricLabel}>Average Rating</Text>
            </View>
          </Card>
        </FadeInSection>

        <FadeInSection delay={140}>
          <View style={styles.filterWrap}>
            <FilterChips selected={selectedSpecialization} onSelect={handleFilter} />
          </View>
        </FadeInSection>

        {!isAuthenticated ? (
          <FadeInSection delay={150}>
            <View style={styles.section}>
              <Card style={styles.authCtaCard}>
                <View style={styles.authCtaGlowTop} />
                <Text style={styles.authCtaTitle}>Sign in to book appointments and access personalized care</Text>
                <Text style={styles.authCtaText}>
                  You can explore doctors freely now. Login only when you are ready to book.
                </Text>
                <View style={styles.authCtaActions}>
                  <Pressable style={({ pressed }) => [styles.authLoginBtn, pressed && styles.viewBtnPressed]} onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.authLoginBtnText}>Login</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.authSignupBtn, pressed && styles.viewBtnPressed]} onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.authSignupBtnText}>Sign up</Text>
                  </Pressable>
                </View>
              </Card>
            </View>
          </FadeInSection>
        ) : (
          <FadeInSection delay={150}>
            <View style={styles.section}>
              <Card style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Welcome back, {user?.first_name || 'there'}</Text>
                <View style={styles.welcomeShortcuts}>
                  <Pressable style={({ pressed }) => [styles.shortcutBtn, pressed && styles.viewBtnPressed]} onPress={() => router.push('/(tabs)/appointments')}>
                    <Text style={styles.shortcutBtnText}>Appointments</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.shortcutBtn, pressed && styles.viewBtnPressed]} onPress={() => router.push('/(tabs)/profile')}>
                    <Text style={styles.shortcutBtnText}>Profile</Text>
                  </Pressable>
                </View>
              </Card>
            </View>
          </FadeInSection>
        )}

        {!isLoading && !doctors.length ? (
          <EmptyState
            icon="search-outline"
            title="No Doctors Found"
            description="Try adjusting your filters to discover more providers."
          />
        ) : (
          <>
            <FadeInSection delay={170}>
              <View style={styles.section}>
                <View style={styles.doctorsHeaderRow}>
                  <Text style={styles.sectionTitle}>Browse Doctors</Text>
                  <Text style={styles.doctorsHeaderMeta}>
                    {filteredDoctors.length} doctors
                  </Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Browse doctors like a marketplace and compare quickly.
                </Text>

                <Animated.View style={isCategoryTransitioning ? styles.transitionFade : undefined}>
                  <View style={styles.grid}>
                    {(isLoading || isCategoryTransitioning)
                      ? Array.from({ length: isMobile ? 2 : isTablet ? 4 : 6 }).map((_, idx) => (
                          <Card key={`skeleton-${idx}`} style={[styles.gridCard, { width: doctorCardWidth }]}>
                            <View style={styles.skeletonAvatar} />
                            <View style={styles.skeletonLineLg} />
                            <View style={styles.skeletonLineSm} />
                            <View style={styles.skeletonLineMd} />
                            <View style={styles.skeletonBtn} />
                          </Card>
                        ))
                      : doctorsToRender.map((doctor) => {
                          const rating = Number(doctor.average_rating || 0);
                          const isTopRated = rating >= 4.7;
                          const isFeatured = isTopRated || doctor.is_verified;

                          return (
                            <Pressable
                              key={doctor.id}
                              onPress={() => setSelectedDoctor(doctor)}
                              style={({ pressed }) => [
                                styles.gridCardShell,
                                { width: doctorCardWidth },
                                pressed && styles.gridCardPressed,
                              ]}
                              accessibilityRole="button"
                              accessibilityLabel={`View profile for Dr. ${doctor.first_name} ${doctor.last_name}`}
                            >
                              <Card style={[styles.gridCard, isFeatured && styles.gridCardFeatured]}>
                                <View style={styles.badgeRow}>
                                  {isTopRated && (
                                    <View style={styles.topRatedBadge}>
                                      <Ionicons name="star" size={10} color="#f59e0b" />
                                      <Text style={styles.topRatedText}>Top Rated</Text>
                                    </View>
                                  )}
                                  <View style={styles.availableBadge}>
                                    <Text style={styles.availableText}>Available today</Text>
                                  </View>
                                </View>

                                <View style={styles.avatarPlaceholder}>
                                  <Ionicons name="person" size={20} color="#ffffff" />
                                </View>
                                <Text style={styles.gridDoctorName} numberOfLines={1}>
                                  Dr. {doctor.first_name} {doctor.last_name}
                                </Text>
                                <Text style={styles.gridDoctorSpec} numberOfLines={1}>
                                  {doctor.specialization || 'General'}
                                </Text>
                                <View style={styles.gridRatingRow}>
                                  <Ionicons name="star" size={12} color="#F59E0B" />
                                  <Text style={styles.gridRatingText}>{Number(doctor.average_rating || 4.7).toFixed(1)}</Text>
                                </View>
                                <Text style={styles.gridSubMeta}>
                                  {doctor.years_of_experience || 5}+ years experience
                                </Text>

                                <View style={styles.actionRow}>
                                  <Pressable
                                    onPress={() => setSelectedDoctor(doctor)}
                                    style={({ pressed }) => [styles.viewBtn, pressed && styles.viewBtnPressed]}
                                  >
                                    <Text style={styles.viewBtnText}>View Profile</Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={handleSaveDoctor}
                                    style={({ pressed }) => [styles.saveBtn, pressed && styles.viewBtnPressed]}
                                  >
                                    <Text style={styles.saveBtnText}>Save</Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={() => handleBookDoctor(doctor)}
                                    style={({ pressed }) => [styles.bookBtn, pressed && styles.viewBtnPressed]}
                                  >
                                    <Text style={styles.bookBtnText}>Book Appointment</Text>
                                  </Pressable>
                                </View>
                              </Card>
                            </Pressable>
                          );
                        })}
                  </View>
                </Animated.View>

                {!isLoading && !isCategoryTransitioning && hasMoreDoctors && (
                  <View style={styles.loadMoreWrap}>
                    <Pressable
                      onPress={() => setVisibleDoctorCount((prev) => prev + 6)}
                      style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.viewBtnPressed]}
                    >
                      <Text style={styles.loadMoreText}>Load more doctors</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </FadeInSection>

            <FadeInSection delay={420}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to Book Appointment</Text>
                <Text style={styles.sectionSubtitle}>Simple steps to connect with your doctor</Text>
                <View style={styles.stepsRow}>
                  {[
                    { icon: 'search-outline', title: 'Search doctor' },
                    { icon: 'time-outline', title: 'Choose time' },
                    { icon: 'checkmark-circle-outline', title: 'Confirm appointment' },
                    { icon: 'videocam-outline', title: 'Meet doctor' },
                  ].map((step, idx) => (
                    <Card key={step.title} style={[styles.stepCard, { width: isMobile ? '100%' : '24%' }]}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Ionicons name={step.icon as any} size={20} color={theme.colors.primary} />
                      <Text style={styles.stepTitle}>{step.title}</Text>
                    </Card>
                  ))}
                </View>
              </View>
            </FadeInSection>

            <FadeInSection delay={460}>
              <View style={[styles.section, styles.testimonialSection]}>
                <Text style={styles.sectionTitleLight}>What Patients Say</Text>
                <Text style={styles.sectionSubtitleLight}>Real experiences from our users</Text>
                <FlatList
                  ref={testimonialRef}
                  horizontal
                  data={TESTIMONIALS}
                  keyExtractor={(item) => item.id}
                  decelerationRate="fast"
                  snapToInterval={testimonialCardWidth + 12}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: (width - testimonialCardWidth) / 2 }}
                  style={styles.testimonialCarousel}
                  onMomentumScrollEnd={(event) => {
                    const idx = Math.round(event.nativeEvent.contentOffset.x / (testimonialCardWidth + 12));
                    setActiveTestimonialIndex(idx);
                  }}
                  renderItem={({ item }) => (
                    <View style={[styles.testimonialCardShell, { width: testimonialCardWidth, marginRight: 12 }]}>
                      <Card style={styles.testimonialCard}>
                        <View style={styles.testimonialTop}>
                          <View style={styles.testimonialAvatar}>
                            <Text style={styles.testimonialAvatarText}>{item.name.charAt(0)}</Text>
                          </View>
                          <View>
                            <Text style={styles.testimonialName}>{item.name}</Text>
                            <View style={styles.ratingRow}>
                              <Ionicons name="star" size={12} color="#F59E0B" />
                              <Text style={styles.testimonialRating}>{item.rating}</Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.testimonialBody}>{item.text}</Text>
                      </Card>
                    </View>
                  )}
                />
                <View style={styles.heroDots}>
                  {TESTIMONIALS.map((item, idx) => (
                    <View key={item.id} style={[styles.dotLight, idx === activeTestimonialIndex && styles.dotLightActive]} />
                  ))}
                </View>
              </View>
            </FadeInSection>

            <FadeInSection delay={500}>
              <View style={styles.section}>
                <Card style={styles.platformPromo}>
                  <View style={[styles.platformLeft, { width: isMobile ? '100%' : '58%' }]}>
                    <Text style={styles.platformTitle}>Get MedLink on all platforms</Text>
                    <Text style={styles.platformSubtitle}>
                      Book, manage, and follow appointments from iOS, Android, Web, and Telegram.
                    </Text>
                    <View style={styles.storeButtons}>
                      <Pressable style={({ pressed }) => [styles.storeBtn, pressed && styles.viewBtnPressed]}>
                        <Ionicons name="logo-apple" size={18} color="#fff" />
                        <Text style={styles.storeBtnText}>App Store</Text>
                      </Pressable>
                      <Pressable style={({ pressed }) => [styles.storeBtnSecondary, pressed && styles.viewBtnPressed]}>
                        <Ionicons name="logo-google-playstore" size={18} color={theme.colors.primary} />
                        <Text style={styles.storeBtnSecondaryText}>Google Play</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={[styles.platformRight, { width: isMobile ? '100%' : '38%' }]}>
                    <View style={styles.phoneMock}>
                      <View style={styles.phoneNotch} />
                      <View style={styles.mockHeader} />
                      <View style={styles.mockLine} />
                      <View style={[styles.mockLine, { width: '70%' }]} />
                      <View style={styles.mockCard} />
                    </View>
                  </View>
                </Card>
              </View>
            </FadeInSection>

            <FadeInSection delay={540}>
              <View style={styles.footer}>
                <View style={[styles.footerCol, { width: isMobile ? '100%' : '32%' }]}>
                  <Text style={styles.footerBrand}>MedLink</Text>
                  <Text style={styles.footerTag}>
                    Ethiopia's modern healthcare platform for fast, trusted digital care.
                  </Text>
                </View>
                <View style={[styles.footerCol, { width: isMobile ? '100%' : '32%' }]}>
                  <Text style={styles.footerColTitle}>Navigation</Text>
                  {['Home', 'Doctors', 'Appointments', 'Contact'].map((item) => (
                    <Text key={item} style={styles.footerLink}>{item}</Text>
                  ))}
                </View>
                <View style={[styles.footerCol, { width: isMobile ? '100%' : '32%' }]}>
                  <Text style={styles.footerColTitle}>Contact</Text>
                  <Text style={styles.footerText}>support@medlink.et</Text>
                  <Text style={styles.footerText}>+251 91 234 5678</Text>
                  <View style={styles.socials}>
                    <Ionicons name="logo-instagram" size={16} color="#d7efe8" />
                    <Ionicons name="logo-linkedin" size={16} color="#d7efe8" />
                    <Ionicons name="logo-facebook" size={16} color="#d7efe8" />
                  </View>
                </View>
                <View style={styles.footerBottom}>
                  <Text style={styles.footerBottomText}>© 2026 MedLink. All rights reserved.</Text>
                </View>
              </View>
            </FadeInSection>
          </>
        )}
      </ScrollView>

      <DoctorDetailsModal visible={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} doctor={selectedDoctor} />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F4FCF7' },
    content: { paddingBottom: 128 },
    headerWrap: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md },

    bell: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      ...theme.shadows.xs,
    },
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

    heroList: { marginTop: theme.spacing.lg },
    heroSlide: {
      marginHorizontal: theme.spacing.xl,
      borderRadius: 24,
      padding: 24,
      overflow: 'hidden',
      backgroundColor: '#0d8b78',
      ...theme.shadows.md,
    },
    heroGlowTop: {
      position: 'absolute',
      top: -80,
      right: -50,
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: '#6ee7d888',
    },
    heroGlowBottom: {
      position: 'absolute',
      bottom: -70,
      left: -45,
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: '#34d39966',
    },
    heroBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#0a6f5f',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 14,
    },
    heroBadgeText: { color: '#e6fff8', fontSize: 12, fontWeight: '700' },
    heroTitle: {
      ...theme.typography.h2,
      color: '#fff',
      fontWeight: '800',
      lineHeight: 36,
      marginBottom: 8,
      letterSpacing: -0.4,
    },
    heroSubtitle: {
      ...theme.typography.body,
      color: '#dcfce7',
      fontSize: 15,
      lineHeight: 24,
    },
    heroDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 14,
      marginBottom: 24,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#b9d6cd' },
    dotActive: { width: 20, backgroundColor: theme.colors.primary },
    dotLight: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9fd7ca' },
    dotLightActive: { width: 20, backgroundColor: '#ffffff' },

    metricCard: {
      marginHorizontal: theme.spacing.xl,
      borderRadius: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...theme.shadows.sm,
    },
    metricItem: { flex: 1, alignItems: 'center' },
    metricValue: { ...theme.typography.h3, fontWeight: '800', color: theme.colors.primary },
    metricLabel: { ...theme.typography.caption, marginTop: 4, color: theme.colors.textSecondary },
    metricDivider: { width: 1, height: 36, backgroundColor: theme.colors.divider },
    filterWrap: { marginTop: 24, marginHorizontal: theme.spacing.xl },
    authCtaCard: {
      borderRadius: 22,
      padding: 18,
      backgroundColor: '#E9FBF2',
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    authCtaGlowTop: {
      position: 'absolute',
      width: 170,
      height: 170,
      borderRadius: 85,
      top: -80,
      right: -40,
      backgroundColor: '#BBF7D055',
    },
    authCtaTitle: {
      ...theme.typography.h4,
      color: '#065f46',
      fontWeight: '800',
      marginBottom: 8,
      maxWidth: 640,
    },
    authCtaText: {
      ...theme.typography.bodySm,
      color: '#0f766e',
      lineHeight: 20,
      marginBottom: 14,
      maxWidth: 640,
    },
    authCtaActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    authLoginBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    authLoginBtnText: {
      ...theme.typography.bodySm,
      color: '#fff',
      fontWeight: '700',
    },
    authSignupBtn: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#99d9c9',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    authSignupBtnText: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    welcomeCard: {
      borderRadius: 20,
      padding: 16,
      ...theme.shadows.xs,
    },
    welcomeTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      fontWeight: '700',
      marginBottom: 10,
    },
    welcomeShortcuts: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },
    shortcutBtn: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: theme.colors.primary + '18',
    },
    shortcutBtnText: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '700',
    },

    section: { marginTop: 32, paddingHorizontal: theme.spacing.xl },
    transitionFade: { opacity: 0.7 },
    doctorsHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    doctorsHeaderMeta: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '700',
      backgroundColor: theme.colors.primary + '14',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      textTransform: 'uppercase',
    },
    sectionTitle: { ...theme.typography.h3, color: theme.colors.text, fontWeight: '800', letterSpacing: -0.2 },
    sectionSubtitle: { ...theme.typography.bodySm, color: theme.colors.textSecondary, marginTop: 6 },
    pickCategoryHint: {
      marginTop: 20,
      marginHorizontal: theme.spacing.xl,
      borderRadius: 18,
      padding: 18,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      gap: 6,
      ...theme.shadows.xs,
    },
    pickCategoryHintTitle: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '700',
      textAlign: 'center',
    },
    pickCategoryHintText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      maxWidth: 480,
    },

    grid: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    gridCardShell: { borderRadius: 18 },
    gridCardPressed: { transform: [{ translateY: -2 }, { scale: 0.99 }] },
    gridCard: {
      borderRadius: 18,
      padding: 14,
      alignItems: 'center',
      minHeight: 230,
      justifyContent: 'space-between',
      ...theme.shadows.sm,
    },
    gridCardFeatured: {
      borderWidth: 1,
      borderColor: theme.colors.primary + '55',
    },
    badgeRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      minHeight: 24,
    },
    topRatedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: '#fff7e5',
    },
    topRatedText: {
      ...theme.typography.caption,
      color: '#a16207',
      fontWeight: '700',
    },
    availableBadge: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: '#e7f9f1',
    },
    availableText: {
      ...theme.typography.caption,
      color: '#047857',
      fontWeight: '700',
    },
    avatarPlaceholder: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    gridDoctorName: { ...theme.typography.bodySm, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
    gridDoctorSpec: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
    gridRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginBottom: 12 },
    gridRatingText: { ...theme.typography.caption, fontWeight: '700', color: theme.colors.text },
    gridSubMeta: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    actionRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 'auto',
      flexWrap: 'wrap',
    },
    viewBtn: {
      minWidth: 92,
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 10,
      alignItems: 'center',
    },
    viewBtnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
    viewBtnText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700' },
    saveBtn: {
      minWidth: 68,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 10,
      alignItems: 'center',
    },
    saveBtnText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '700',
    },
    bookBtn: {
      minWidth: 132,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 10,
      alignItems: 'center',
    },
    bookBtnText: { ...theme.typography.caption, color: '#fff', fontWeight: '700' },
    loadMoreWrap: {
      marginTop: 18,
      alignItems: 'center',
    },
    loadMoreBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.primary + '66',
      backgroundColor: theme.colors.surface,
    },
    loadMoreText: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    skeletonAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: '#e5ece9',
      marginBottom: 12,
    },
    skeletonLineLg: {
      width: '80%',
      height: 12,
      borderRadius: 6,
      backgroundColor: '#e5ece9',
      marginBottom: 8,
    },
    skeletonLineSm: {
      width: '55%',
      height: 10,
      borderRadius: 5,
      backgroundColor: '#e5ece9',
      marginBottom: 10,
    },
    skeletonLineMd: {
      width: '45%',
      height: 10,
      borderRadius: 5,
      backgroundColor: '#e5ece9',
      marginBottom: 12,
    },
    skeletonBtn: {
      width: '100%',
      height: 34,
      borderRadius: 10,
      backgroundColor: '#e5ece9',
      marginTop: 'auto',
    },

    stepsRow: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    stepCard: {
      borderRadius: 18,
      padding: 16,
      minHeight: 120,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      ...theme.shadows.sm,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    stepTitle: { ...theme.typography.bodySm, color: theme.colors.text, fontWeight: '700', textAlign: 'center' },

    testimonialSection: {
      backgroundColor: '#0f8f7c',
      borderRadius: 24,
      marginHorizontal: theme.spacing.xl,
      paddingHorizontal: 0,
      paddingTop: 22,
      paddingBottom: 12,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    sectionTitleLight: {
      ...theme.typography.h3,
      color: '#fff',
      fontWeight: '800',
      textAlign: 'center',
    },
    sectionSubtitleLight: {
      ...theme.typography.bodySm,
      color: '#d1fae5',
      marginTop: 6,
      marginBottom: 14,
      textAlign: 'center',
    },
    testimonialCarousel: { marginBottom: 4 },
    testimonialCardShell: { borderRadius: 18 },
    testimonialCard: { borderRadius: 18, padding: 18, ...theme.shadows.sm },
    testimonialTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    testimonialAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    testimonialAvatarText: { color: theme.colors.primary, fontWeight: '800' },
    testimonialName: { ...theme.typography.bodySm, fontWeight: '700', color: theme.colors.text },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    testimonialRating: { ...theme.typography.caption, color: theme.colors.textSecondary },
    testimonialBody: { ...theme.typography.body, color: theme.colors.textSecondary, lineHeight: 24 },

    platformPromo: {
      borderRadius: 24,
      padding: 20,
      backgroundColor: '#e9fbf4',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 16,
      ...theme.shadows.sm,
    },
    platformLeft: { gap: 10 },
    platformTitle: { ...theme.typography.h2, fontWeight: '800', color: '#065f53', lineHeight: 34 },
    platformSubtitle: { ...theme.typography.body, color: '#0f766e' },
    storeButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
    storeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#065f53',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    storeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    storeBtnSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#fff',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#99d9c9',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    storeBtnSecondaryText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
    platformRight: { alignItems: 'center', justifyContent: 'center' },
    phoneMock: {
      width: 170,
      height: 300,
      borderRadius: 28,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#b7e4d5',
      padding: 14,
      ...theme.shadows.sm,
    },
    phoneNotch: {
      width: 70,
      height: 8,
      borderRadius: 4,
      alignSelf: 'center',
      backgroundColor: '#d7efe8',
      marginBottom: 14,
    },
    mockHeader: { height: 16, borderRadius: 8, backgroundColor: '#c6eee2', marginBottom: 12 },
    mockLine: { height: 10, borderRadius: 5, backgroundColor: '#dff7f0', marginBottom: 8 },
    mockCard: {
      marginTop: 10,
      height: 120,
      borderRadius: 14,
      backgroundColor: '#ebfff8',
      borderWidth: 1,
      borderColor: '#caefe4',
    },

    footer: {
      marginTop: 36,
      marginHorizontal: theme.spacing.xl,
      borderRadius: 24,
      backgroundColor: '#0b5d53',
      padding: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 16,
      ...theme.shadows.sm,
    },
    footerCol: { gap: 8 },
    footerBrand: { ...theme.typography.h3, fontWeight: '800', color: '#ecfdf5' },
    footerTag: { ...theme.typography.bodySm, color: '#d7efe8', lineHeight: 20 },
    footerColTitle: { ...theme.typography.body, color: '#ecfdf5', fontWeight: '700' },
    footerLink: { ...theme.typography.bodySm, color: '#d7efe8' },
    footerText: { ...theme.typography.bodySm, color: '#d7efe8' },
    socials: { flexDirection: 'row', gap: 10, marginTop: 6 },
    footerBottom: {
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: '#1c766b',
      marginTop: 8,
      paddingTop: 12,
    },
    footerBottomText: { ...theme.typography.caption, color: '#b7dfd4', textAlign: 'center' },

    loader: { marginTop: 36, alignItems: 'center' },

    doctorStatsCard: { marginHorizontal: theme.spacing.xl, borderRadius: 20, padding: 18 },
    doctorStatsTitle: { ...theme.typography.h4, color: theme.colors.text, fontWeight: '700', marginBottom: 12 },
    doctorStatsRow: { flexDirection: 'row', alignItems: 'center' },
    doctorStatItem: { flex: 1, alignItems: 'center' },
    doctorStatNumber: { ...theme.typography.h3, color: theme.colors.primary, fontWeight: '800' },
    doctorStatLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
    doctorStatsDivider: { width: 1, height: 36, backgroundColor: theme.colors.divider },
  });

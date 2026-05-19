import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
    ImageBackground,
    Image,
} from 'react-native';
import { Card, ScreenContainer } from '../../src/components/ui';
import type { ProviderSearchResult } from '../../src/features/doctor/types/doctor.types';
import { DoctorDetailsModal } from '../../src/features/patient';
import { useDiscoveryStore } from '../../src/store/discovery.store';
import type { Theme } from '../../src/theme';
import { useTheme } from '../../src/theme';
import femaleDoc from "../../assets/images/femaleDoc.jpeg";
import logo from "../../assets/images/logo.png";

const FEATURES = [
  { icon: 'calendar-outline', title: 'Easy Appointment Scheduling', desc: 'Book appointments quickly and easily.' },
  { icon: 'videocam-outline', title: 'Online Consultation', desc: 'Consult with doctors from your home.' },
  { icon: 'notifications-outline', title: 'Appointment Reminders', desc: 'Never miss an appointment again.' },
  { icon: 'location-outline', title: 'Find Nearby Doctors', desc: 'Locate trusted doctors near you.' },
  { icon: 'document-text-outline', title: 'Medical History Tracking', desc: 'Keep your records organized and secure.' },
  { icon: 'time-outline', title: 'Real-Time Availability', desc: 'See availability and book instantly.' },
];

const TESTIMONIALS = [
  { id: 'tm-1', name: 'Hana T.', rating: 5, text: 'Booking appointments became very easy. I can now consult with my doctor without any hassle. Thank you, Medlink!' },
  { id: 'tm-2', name: 'Dawit M.', rating: 5, text: 'I found a specialist in minutes and got the care I needed. Medlink is a blessing!' },
  { id: 'tm-3', name: 'Selamawit K.', rating: 5, text: 'The reminders help me a lot. Great app for busy people like me.' },
];

const SPECIALTIES = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Gynecologist', 'General'];

const SPECIALTY_COLORS: Record<string, string> = {
  'Cardiologist': '#EF4444',
  'Dermatologist': '#8B5CF6',
  'Pediatrician': '#F59E0B',
  'Gynecologist': '#EC4899',
  'General': '#10B981',
  'General Practitioner': '#10B981',
  'default': '#3B82F6',
};

function StarRating({ rating }: { rating: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name="star" size={11} color={i < Math.floor(rating) ? '#F59E0B' : theme.colors.border} />
      ))}
      <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginLeft: 3 }}>{rating}</Text>
    </View>
  );
}

function HeroSection({ isMobile, theme, isDark, onGetStarted, onLogin }: any) {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeFloat = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -8, duration: 2000, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
      ).start();

    makeFloat(floatAnim1, 0);
    makeFloat(floatAnim2, 600);
    makeFloat(floatAnim3, 1200);
  }, [floatAnim1, floatAnim2, floatAnim3]);

  return (
    <View style={[{ padding: 62, alignItems: 'center' , margin: 4 }, !isMobile && { flexDirection: 'row' }]}>
      <View style={{ width: isMobile ? '100%' : '50%', gap: 16, alignItems: 'center' }}>
      <Image
                source={logo} // adjust path
                style={{
                  width: 1100,
                  height: 100,
                  resizeMode: 'contain',
                  
                
                }}
              />     
        <Text style={{ fontSize: 34, fontWeight: '800', color: theme.colors.primary, lineHeight: 42, letterSpacing: 0.5, textAlign: 'center', padding: 16 }}>
          Quality Healthcare,{'\n'}Closer Than You Think
        </Text>
        <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24, textAlign: 'center' }}>
          Medlink connects you with trusted doctors across Ethiopia <br></br> for appointments, consultations, and better healthcare.{' '}<br></br>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Anytime. Anywhere.</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 32, alignItems: 'center', justifyContent: 'center', padding: 22 }}>
          <Pressable
            onPress={onGetStarted}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 20 }, pressed && { opacity: 0.85 }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Get Started</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
          <Pressable
            onPress={onLogin}
            style={({ pressed }) => [{ paddingHorizontal: 44, paddingVertical: 13, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.primary }, pressed && { opacity: 0.85 }]}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 14 }}>Log In</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {[
            { icon: 'shield-checkmark-outline', label: 'Trusted Doctors' },
            { icon: 'lock-closed-outline', label: 'Secure & Private' },
            { icon: 'location-outline', label: 'Available Across Ethiopia' },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name={item.icon as any} size={14} color={theme.colors.primary} />
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ width: isMobile ? '100%' : '55%', height: '110%', alignItems: 'center' }}>
        <ImageBackground
          source={femaleDoc}
          resizeMode="cover"
          imageStyle={{ borderRadius: 24 }}
          style={{
            width: '100%',
            height: 650,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            borderWidth: 1,
            borderColor: isDark ? theme.colors.border : '#caefe4',
          }}
        >
    
    {/* Everything below stays EXACTLY the same */}

    <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="medical" size={40} color={theme.colors.primary} />
    </View>

    <Animated.View style={{ position: 'absolute', top: 20, left: 16, transform: [{ translateY: floatAnim1 }] }}>
      <View style={{ backgroundColor: theme.colors.background, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="heart" size={14} color="#fff" />
        </View>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '800', color: theme.colors.text }}>516+ Doctors</Text>
          <Text style={{ fontSize: 9, color: theme.colors.textSecondary }}>Verified specialists</Text>
        </View>
      </View>
    </Animated.View>

    <Animated.View style={{ position: 'absolute', top: 20, right: 16, transform: [{ translateY: floatAnim2 }] }}>
      {/* unchanged */}
    </Animated.View>

    <Animated.View style={{ position: 'absolute', bottom: 20, right: 16, transform: [{ translateY: floatAnim3 }] }}>
      {/* unchanged */}
    </Animated.View>

    <View style={{ position: 'absolute', bottom: 20, left: 16 }}>
      {/* unchanged */}
    </View>

  </ImageBackground>
     </View>
    </View>
  );
}

export default function PublicHomeScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const { doctors, isLoading, fetchDoctors } = useDiscoveryStore();
  const [selectedDoctor, setSelectedDoctor] = useState<ProviderSearchResult | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const testimonialRef = useRef<FlatList<(typeof TESTIMONIALS)[number]>>(null);
  const connectorAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  const isMobile = width < 768;
  const testimonialCardWidth = Math.min(460, width * 0.78);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  useEffect(() => {
    Animated.timing(connectorAnim, { toValue: 1, duration: 900, delay: 400, useNativeDriver: false }).start();
  }, [connectorAnim]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonialIndex((prev) => {
        const next = (prev + 1) % TESTIMONIALS.length;
        testimonialRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const toggleMenu = useCallback(() => {
    const toValue = menuOpen ? 0 : 1;
    Animated.timing(menuAnim, { toValue, duration: 220, useNativeDriver: true }).start();
    setMenuOpen((prev) => !prev);
  }, [menuOpen, menuAnim]);

  const promptAuth = useCallback(() => {
    Alert.alert(
      'Login Required',
      'Please log in or sign up to book an appointment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
        { text: 'Sign Up', onPress: () => router.push('/(auth)/register') },
      ],
    );
  }, [router]);

  const filteredDoctors = useMemo(() => {
    if (selectedSpecialty === 'All') return doctors;
    return doctors.filter((d) =>
      (d.specialization || '').toLowerCase().includes(selectedSpecialty.toLowerCase()),
    );
  }, [doctors, selectedSpecialty]);

  const menuTranslateY = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const menuOpacity = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>

        {/* Navbar */}
        <View style={styles.navbar}>
          <View style={styles.navLogo}>
 {/* LOGO */}
            <Image
                source={logo} // adjust path
                style={{
                  width: 130,
                  height: 40,
                
                }}
              />            
              <View>
            </View>
          </View>
          {!isMobile ? (
            <View style={styles.navLinks}>
              {['Home', 'Find Doctors', 'How It Works', 'Services', 'About Us', 'Contact'].map((item) => (
                <Text key={item} style={styles.navLink}>{item}</Text>
              ))}
            </View>
          ) : null}
          <View style={styles.navActions}>
            {isMobile ? (
              <Pressable onPress={toggleMenu} style={styles.hamburger}>
                <Ionicons name={menuOpen ? 'close' : 'menu'} size={22} color={theme.colors.text} />
              </Pressable>
            ) : (
              <>
                <Pressable style={({ pressed }) => [styles.navLoginBtn, pressed && { opacity: 0.8 }]} onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.navLoginText}>Log In</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.navSignupBtn, pressed && { opacity: 0.8 }]} onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.navSignupText}>Sign Up</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Mobile Menu */}
        {menuOpen && (
          <Animated.View style={[styles.mobileMenu, { opacity: menuOpacity, transform: [{ translateY: menuTranslateY }] }]}>
            {['Home', 'Find Doctors', 'How It Works', 'Services', 'Contact'].map((item) => (
              <Text key={item} style={styles.mobileMenuItem}>{item}</Text>
            ))}
            <View style={styles.mobileMenuActions}>
              <Pressable style={styles.mobileLoginBtn} onPress={() => { setMenuOpen(false); router.push('/(auth)/login'); }}>
                <Text style={styles.navLoginText}>Log In</Text>
              </Pressable>
              <Pressable style={styles.mobileSignupBtn} onPress={() => { setMenuOpen(false); router.push('/(auth)/register'); }}>
                <Text style={styles.navSignupText}>Sign Up</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Hero */}
        <HeroSection
          isMobile={isMobile}
          theme={theme}
          isDark={isDark}
          onGetStarted={() => router.push('/(auth)/register')}
          onLogin={() => router.push('/(auth)/login')}
        />

        {/* Search */}
        <View style={styles.searchOuter}>
          <View style={styles.searchCard}>
            <Text style={styles.searchTitle}>Find the Right Doctor</Text>
            <Text style={styles.searchSubtitle}>Search by specialty, location, or availability and book your appointment in minutes.</Text>
            <View style={[styles.searchRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
              <View style={styles.searchInputWrap}>
                <Ionicons name="search-outline" size={16} color={theme.colors.textSecondary} />
                <TextInput placeholder="Search doctors, specialties..." placeholderTextColor={theme.colors.textSecondary} style={styles.searchInput} />
              </View>
              <View style={[styles.filtersRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                {[
                  { label: 'Specialty', value: 'All Specialties' },
                  { label: 'Location', value: 'All Locations' },
                  { label: 'Availability', value: 'Available Today' },
                ].map((f) => (
                  <View key={f.label} style={styles.filterPill}>
                    <Text style={styles.filterLabel}>{f.label}</Text>
                    <Text style={styles.filterValue}>{f.value}</Text>
                  </View>
                ))}
                <Pressable style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.85 }]}>
                  <Text style={styles.searchBtnText}>Search</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Doctors</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>View All Doctors</Text>
              <Ionicons name="arrow-forward" size={13} color={theme.colors.primary} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {SPECIALTIES.map((s) => (
              <Pressable key={s} onPress={() => setSelectedSpecialty(s)} style={[styles.specialtyChip, selectedSpecialty === s && styles.specialtyChipActive]}>
                <Text style={[styles.specialtyChipText, selectedSpecialty === s && { color: '#fff' }]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <FlatList
            horizontal
            data={isLoading ? Array.from({ length: 5 }) : filteredDoctors.slice(0, 10)}
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingVertical: 8 }}
            renderItem={({ item: doctor, index }) => {
              if (isLoading || !doctor) {
                return (
                  <Card style={styles.doctorCard}>
                    <View style={{ height: 4, borderRadius: 4, backgroundColor: theme.colors.border, marginBottom: 10 }} />
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonLine} />
                    <View style={[styles.skeletonLine, { width: 80 }]} />
                    <View style={styles.skeletonBtn} />
                  </Card>
                );
              }
              const d = doctor as ProviderSearchResult;
              const rating = Number(d.average_rating || 4.7);
              const isAvailable = index % 3 !== 2;
              const specKey = Object.keys(SPECIALTY_COLORS).find((k) => (d.specialization || '').toLowerCase().includes(k.toLowerCase())) || 'default';
              const specColor = SPECIALTY_COLORS[specKey];
              return (
                <Pressable onPress={() => setSelectedDoctor(d)}>
                  <Card style={styles.doctorCard}>
                    <View style={[styles.doctorCardTopBar, { backgroundColor: specColor }]} />
                    <View style={[styles.availabilityBadge, { backgroundColor: isAvailable ? '#D1FAE5' : '#FEF3C7' }]}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isAvailable ? '#10B981' : '#F59E0B' }} />
                      <Text style={[styles.availabilityText, { color: isAvailable ? '#065F46' : '#92400E' }]}>
                        {isAvailable ? 'Available Now' : 'Busy'}
                      </Text>
                    </View>
                    <View style={[styles.doctorAvatar, { backgroundColor: specColor }]}>
                      <Ionicons name="person" size={26} color="#fff" />
                    </View>
                    <Text style={styles.doctorName} numberOfLines={1}>Dr. {d.first_name} {d.last_name}</Text>
                    <Text style={[styles.doctorSpec, { color: specColor }]} numberOfLines={1}>{d.specialization || 'General Practitioner'}</Text>
                    <Text style={styles.doctorHospital} numberOfLines={1}>Tikur Anbessa Hospital</Text>
                    <StarRating rating={rating} />
                    <Pressable onPress={promptAuth} style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.85 }]}>
                      <Text style={styles.bookBtnText}>Book Appointment</Text>
                    </Pressable>
                  </Card>
                </Pressable>
              );
            }}
          />
        </View>

        {/* How It Works */}
        <View style={[styles.section, { alignItems: 'center' }]}>
          <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>How Medlink Works</Text>
          <View style={styles.divider} />
          <View style={[styles.stepsRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
            {[
              { num: '1', icon: 'search-outline', title: 'Search', desc: 'Find doctors by specialty, location, and availability.' },
              { num: '2', icon: 'calendar-outline', title: 'Book', desc: 'Choose a date and time that works for you.' },
              { num: '3', icon: 'videocam-outline', title: 'Consult', desc: 'Meet your doctor in person or online and get care.' },
            ].map((step, idx) => (
              <View key={step.num} style={{ alignItems: 'center', width: isMobile ? '100%' : '30%', gap: 10, position: 'relative' }}>
                <View style={styles.stepCircle}>
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>{step.num}</Text>
                  </View>
                  <Ionicons name={step.icon as any} size={30} color={theme.colors.primary} />
                </View>
                {idx < 2 && !isMobile && (
                  <Animated.View style={[styles.stepConnector, { width: connectorAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) }]} />
                )}
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <View style={[styles.featuresGrid, { flexWrap: 'wrap', flexDirection: 'row' }]}>
            {FEATURES.map((f) => (
              <Card key={f.title} style={[styles.featureCard, { width: isMobile ? '48%' : '31%' }]}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon as any} size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={[styles.section, { alignItems: 'center' }]}>
          <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>What Our Patients Say</Text>
          <View style={styles.divider} />
          <FlatList
            ref={testimonialRef}
            horizontal
            data={TESTIMONIALS}
            keyExtractor={(item) => item.id}
            decelerationRate="fast"
            snapToInterval={testimonialCardWidth + 16}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: (width - testimonialCardWidth) / 2 - 20 }}
            onMomentumScrollEnd={(e) => {
              setActiveTestimonialIndex(Math.round(e.nativeEvent.contentOffset.x / (testimonialCardWidth + 16)));
            }}
            renderItem={({ item }) => (
              <Card style={[styles.testimonialCard, { width: testimonialCardWidth, marginRight: 16 }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary + '55'} />
                <Text style={styles.testimonialText}>{item.text}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialAvatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.testimonialName}>{item.name}</Text>
                    <StarRating rating={item.rating} />
                  </View>
                </View>
              </Card>
            )}
          />
          <View style={styles.dots}>
            {TESTIMONIALS.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === activeTestimonialIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* CTA Banner */}
        <View style={[styles.ctaBanner, { flexDirection: isMobile ? 'column' : 'row' }]}>
          <Ionicons name="heart" size={120} color="#ffffff11" style={{ position: 'absolute', top: -20, right: 60 }} />
          <Ionicons name="medical" size={80} color="#ffffff0d" style={{ position: 'absolute', bottom: -10, left: 20 }} />
          <Ionicons name="add-circle" size={60} color="#ffffff0d" style={{ position: 'absolute', top: 10, left: 160 }} />
          <View style={{ flex: 1, gap: 8, minWidth: 200 }}>
            <Text style={styles.ctaTitle}>Your Health Journey{'\n'}Starts Here</Text>
            <Text style={styles.ctaSubtitle}>Join thousands of patients across Ethiopia who trust Medlink for their healthcare needs.</Text>
          </View>
          <View style={{ gap: 10, minWidth: 160 }}>
            <Pressable style={({ pressed }) => [styles.ctaSignup, pressed && { opacity: 0.85 }]} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.ctaSignupText}>Sign Up</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.ctaLogin, pressed && { opacity: 0.85 }]} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.ctaLoginText}>Log In</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[{ padding: 24, gap: 24 }, !isMobile && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            <View style={{ width: isMobile ? '100%' : '26%', gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="heart" size={16} color={theme.colors.primary} />
                <Text style={styles.footerBrand}>Medlink</Text>
              </View>
              <Text style={{ fontSize: 10, color: theme.colors.textSecondary, fontStyle: 'italic' }}>Your Health. Our Link.</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 }}>Medlink connects you with trusted doctors and makes healthcare simple, accessible, and reliable.</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                {(['logo-facebook', 'logo-twitter', 'logo-instagram', 'logo-linkedin'] as const).map((icon) => (
                  <View key={icon} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
                    <Ionicons name={icon} size={13} color={theme.colors.textSecondary} />
                  </View>
                ))}
              </View>
            </View>
            {[
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
              { title: 'Services', links: ['Find Doctors', 'Book Appointment', 'Online Consultation', 'Health Packages'] },
              { title: 'Support', links: ['Help Center', 'FAQ', 'Privacy Policy', 'Terms of Service'] },
            ].map((col) => (
              <View key={col.title} style={{ width: isMobile ? '45%' : '15%', gap: 8 }}>
                <Text style={styles.footerColTitle}>{col.title}</Text>
                {col.links.map((link) => (
                  <Text key={link} style={{ fontSize: 12, color: theme.colors.textSecondary }}>{link}</Text>
                ))}
              </View>
            ))}
            <View style={{ width: isMobile ? '100%' : '20%', gap: 8 }}>
              <Text style={styles.footerColTitle}>Contact Us</Text>
              {[
                { icon: 'call-outline', text: '+251 911 234 567' },
                { icon: 'mail-outline', text: 'support@medlink.et' },
                { icon: 'location-outline', text: 'Addis Ababa, Ethiopia' },
              ].map((c) => (
                <View key={c.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={c.icon as any} size={13} color={theme.colors.textSecondary} />
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{c.text}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.footerBottom}>
            <Text style={styles.footerBottomText}>© 2026 MedLink. All rights reserved.</Text>
          </View>
        </View>

      </ScrollView>
      <DoctorDetailsModal visible={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} doctor={selectedDoctor} />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
    margin: 12
  },
  navbar: { 
    flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', paddingHorizontal: 20, 
    paddingVertical: 14, borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border, 
    backgroundColor: theme.colors.background },
  navLogo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 },
  navBrand: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: theme.colors.text 
  },
  navTagline: {
     fontSize: 9, 
     color: theme.colors.textSecondary,
     
  },
  navLinks: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 18 },
  navLink: { 
    fontSize: 13, color: theme.colors.text, 
    fontWeight: '500' },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navLoginBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.primary },
  navLoginText: { fontSize: 13, color: theme.colors.primary, fontWeight: '700' },
  navSignupBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.colors.primary },
  navSignupText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  hamburger: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  mobileMenu: { backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  mobileMenuItem: { fontSize: 15, fontWeight: '600', color: theme.colors.text, paddingVertical: 4 },
  mobileMenuActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  mobileLoginBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center' },
  mobileSignupBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: theme.colors.primary, alignItems: 'center' },

  searchOuter: { paddingHorizontal: 20, marginTop: 8 },
  searchCard: { backgroundColor: theme.colors.surface, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: theme.colors.border, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  searchTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
  searchSubtitle: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  searchRow: { gap: 10 },
  searchInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.colors.background, flex: 1 },
  searchInput: { flex: 1, fontSize: 13, color: theme.colors.text },
  filtersRow: { gap: 8, flex: 1, alignItems: 'center', flexWrap: 'wrap' },
  filterPill: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.background },
  filterLabel: { fontSize: 9, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterValue: { fontSize: 12, color: theme.colors.text, fontWeight: '600' },
  searchBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  section: { marginTop: 36, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  divider: { width: 44, height: 3, borderRadius: 2, backgroundColor: theme.colors.primary, marginTop: 10, marginBottom: 24, alignSelf: 'center' },
  specialtyChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8, backgroundColor: theme.colors.background },
  specialtyChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  specialtyChipText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  doctorCard: { width: 168, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, overflow: 'hidden' },
  doctorCardTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  availabilityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  availabilityText: { fontSize: 10, fontWeight: '700' },
  doctorAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  doctorName: { fontSize: 13, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  doctorSpec: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  doctorHospital: { fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },
  bookBtn: { width: '100%', backgroundColor: theme.colors.primary, borderRadius: 8, paddingVertical: 9, alignItems: 'center', marginTop: 4 },
  bookBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  skeletonAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.border, marginBottom: 6 },
  skeletonLine: { height: 10, width: 120, borderRadius: 5, backgroundColor: theme.colors.border, marginBottom: 4 },
  skeletonBtn: { width: '100%', height: 32, borderRadius: 8, backgroundColor: theme.colors.border, marginTop: 4 },

  stepsRow: { width: '100%', justifyContent: 'space-between', gap: 28 },
  stepCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: isDark ? theme.colors.surface : '#e9fbf4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, position: 'relative' },
  stepNumBadge: { position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepNumText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stepConnector: { position: 'absolute', right: -78, top: 38, height: 2, backgroundColor: theme.colors.primary + '55' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  stepDesc: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 200 },

  featuresGrid: { gap: 12, justifyContent: 'space-between' },
  featureCard: { borderRadius: 14, padding: 16, gap: 8, marginBottom: 4 },
  featureIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: isDark ? theme.colors.surface : '#e9fbf4', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  featureDesc: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },

  testimonialCard: { borderRadius: 16, padding: 20, gap: 8 },
  testimonialText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  testimonialAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  testimonialAvatarText: { fontSize: 14, fontWeight: '800', color: theme.colors.primary },
  testimonialName: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.border },
  dotActive: { width: 20, backgroundColor: theme.colors.primary },

  ctaBanner: { margin: 20, borderRadius: 20, backgroundColor: theme.colors.primary, padding: 28, alignItems: 'center', justifyContent: 'space-between', gap: 20, overflow: 'hidden', position: 'relative' },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 30 },
  ctaSubtitle: { fontSize: 13, color: '#dcfce7', lineHeight: 20 },
  ctaSignup: { backgroundColor: '#fff', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  ctaSignupText: { color: theme.colors.primary, fontWeight: '800', fontSize: 14 },
  ctaLogin: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#ffffff88', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  ctaLoginText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  footer: { backgroundColor: isDark ? theme.colors.surface : '#f8faf9', borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 16 },
  footerBrand: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  footerColTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  footerBottom: { borderTopWidth: 1, borderTopColor: theme.colors.border, padding: 16, alignItems: 'center' },
  footerBottomText: { fontSize: 12, color: theme.colors.textSecondary },
});
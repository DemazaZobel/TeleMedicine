import { Button, Card, ScreenContainer, StarRating } from "@/components/ui";
import { useBookingStore } from "@/store/booking.store";
import { formatDisplayValue } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { BookingModal } from "../../../src/features/booking/components/BookingModal";
import { doctorApi } from "../../../src/features/doctor/services/doctor.api";
import type { ProviderSearchResult } from "../../../src/features/doctor/types/doctor.types";
import { useTranslation } from '../../../src/i18n';
import { useDiscoveryStore } from "../../../src/store/discovery.store";
import { Theme, useTheme } from "../../../src/theme";

export default function DoctorProfilePage() {
  const { t } = useTranslation('doctor');
  const { t: tCommon } = useTranslation('common');
  const { id } = useLocalSearchParams();
  const doctorId = typeof id === "string" ? id : id?.[0];
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(theme, isDark, width),
    [theme, isDark, width],
  );

  const { doctors } = useDiscoveryStore();
  const [doctor, setDoctor] = useState<ProviderSearchResult | undefined>(
    doctors.find((d) => d.id === doctorId),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [bookingVisible, setBookingVisible] = useState(false);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0);

  const {
    fetchDoctorAvailability,
    doctorAvailabilityRules,
    isLoading: isAvailabilityLoading,
  } = useBookingStore();

  React.useEffect(() => {
    const fetchDetail = async () => {
      if (!doctorId) return;
      setIsLoading(true);
      try {
        const detail = await doctorApi.getProviderDetail(doctorId);
        setDoctor(detail);
        fetchDoctorAvailability(doctorId);
      } catch (error) {
        console.error("[DoctorProfilePage] Failed to fetch detail:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [doctorId]);

  const availableSlots = useMemo(() => {
    if (!doctorAvailabilityRules || doctorAvailabilityRules.length === 0)
      return [];

    const generatedSlots = [];
    const today = new Date();

    for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);
      const weekday = currentDay.getDay();

      const rulesForDay = doctorAvailabilityRules.filter(
        (r) => r.weekday === weekday && r.is_active,
      );

      for (const rule of rulesForDay) {
        const [h, m] = rule.start_time.split(":").map(Number);
        const start = new Date(currentDay);
        start.setHours(h, m, 0, 0);
        if (dayOffset === 0 && start.getTime() < today.getTime()) continue;
        generatedSlots.push(start);
      }
    }

    return generatedSlots.sort((a, b) => a.getTime() - b.getTime()).slice(0, 3);
  }, [doctorAvailabilityRules]);

  if (isLoading && !doctor) {
    return (
      <ScreenContainer centered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    );
  }

  if (!doctor && !isLoading) {
    return (
      <ScreenContainer centered>
        <Text style={{ color: theme.colors.text }}>
          {t('profileUnavailable')}
        </Text>
        <Button
          title={tCommon('goBack')}
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        />
      </ScreenContainer>
    );
  }

  if (!doctor) return null;

  const isDesktop = width > 992;

  const mainContent = (
    <View style={styles.mainColumn}>
      {/* ── PROFILE HEADER CARD ── */}
      <Card style={styles.headerCard}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtnInline}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {doctor.profile_image ? (
                <Image
                  source={{ uri: doctor.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {doctor.first_name?.[0] || "D"}
                    {doctor.last_name?.[0] || "R"}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
            {doctor.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
            )}
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.nameSection}>
                <Text style={styles.name}>
                  {t('doctorPrefix')} {doctor.first_name} {doctor.last_name}
                </Text>
                <Text style={styles.tagline}>
                  {doctor.specialization} {t('specialist')}
                </Text>

                {doctor.location && (
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.subtext}>{doctor.location}</Text>
                  </View>
                )}

                <View style={styles.ratingBrief}>
                  <StarRating rating={Number(doctor.average_rating) || 0} size={16} />
                  <Text style={styles.ratingText}>
                    ({t('reviews', { count: doctor.review_count })})
                  </Text>
                </View>
              </View>

              <View style={styles.quickStatsGrid}>
                <View style={styles.quickStatBox}>
                  <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                  <View>
                    <Text style={styles.quickStatVal}>
                      {t('yearsExp', { count: doctor.years_of_experience })}
                    </Text>
                    <Text style={styles.quickStatLabel}>{t('experience')}</Text>
                  </View>
                </View>
                <View style={styles.quickStatBox}>
                  <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
                  <View>
                    <Text style={styles.quickStatVal}>Br {doctor.consultation_fee}</Text>
                    <Text style={styles.quickStatLabel}>{t('consultation')}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Button
                title={t('bookAppointment')}
                onPress={() => {
                  setSelectedSlotIdx(0);
                  setBookingVisible(true);
                }}
                style={styles.primaryActionBtn}
              />
              <Button
                title={t('patient:message')}
                variant="outline"
                onPress={() => { }}
                style={styles.secondaryActionBtn}
              />
            </View>
          </View>
        </View>
      </Card>

      {/* ── ABOUT SECTION ── */}
      {doctor.biography || (doctor as any).bio ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('professionalSummary')}</Text>
          <Text style={styles.bioText}>
            {doctor.biography || (doctor as any).bio}
          </Text>
        </Card>
      ) : null}

      {/* ── EXPERIENCE SECTION ── */}
      {(() => {
        const exp = doctor.experience || (doctor as any).experience_details;
        const formattedExp = formatDisplayValue(exp);
        if (!formattedExp) return null;

        return (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('clinicalExperience')}</Text>
            <View style={styles.listContainer}>
              <View style={styles.experienceItem}>
                <View style={styles.experienceIcon}>
                  <Ionicons
                    name="medkit-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.experienceDetails}>
                  <Text style={styles.bioText}>{formattedExp}</Text>
                </View>
              </View>
            </View>
          </Card>
        );
      })()}

      {!isDesktop && (
        <>
          {doctor.education && formatDisplayValue(doctor.education) ? (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {t('educationCertifications')}
              </Text>
              <Text style={styles.bioText}>
                {formatDisplayValue(doctor.education)}
              </Text>
            </Card>
          ) : null}
        </>
      )}
    </View>
  );

  const sidebarContent = (
    <View style={styles.sidebarColumn}>
      {/* ── AVAILABILITY CARD ── */}
      <Card style={styles.miniCard}>
        <View style={styles.miniCardHeader}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.miniCardTitle}>{t('quickAvailability')}</Text>
        </View>

        {isAvailabilityLoading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginVertical: 20 }}
          />
        ) : availableSlots.length > 0 ? (
          <View style={styles.availabilityList}>
            {availableSlots.map((date, idx) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const timeStr = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              const dayStr = isToday
                ? t('todayLabel')
                : date.toLocaleDateString(undefined, { weekday: "short" });

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.timeSlot}
                  onPress={() => {
                    setSelectedSlotIdx(idx);
                    setBookingVisible(true);
                  }}
                >
                  <Text style={styles.timeSlotText}>
                    {dayStr}, {timeStr}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyAvailabilityText}>
            {t('noUpcomingSlots')}
          </Text>
        )}

        <Button
          title={t('seeFullSchedule')}
          variant="outline"
          size="sm"
          onPress={() => {
            setSelectedSlotIdx(0);
            setBookingVisible(true);
          }}
          style={{ marginTop: 12 }}
        />
      </Card>

      {/* ── EDUCATION SIDEBAR CARD (Desktop Only) ── */}
      {isDesktop && doctor.education && formatDisplayValue(doctor.education) && (
        <Card style={styles.miniCard}>
          <View style={styles.miniCardHeader}>
            <Ionicons
              name="school-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.miniCardTitle}>{t('education')}</Text>
          </View>
          <Text style={styles.miniCardText}>
            {formatDisplayValue(doctor.education)}
          </Text>
          {doctor.current_working_hospital && (
            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <View style={styles.miniCardHeader}>
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={[styles.miniCardTitle, { fontSize: 14 }]}>
                  {t('currentFacility')}
                </Text>
              </View>
              <Text style={styles.miniCardText}>
                {doctor.current_working_hospital}
              </Text>
            </View>
          )}
        </Card>
      )}

      <Card style={styles.miniCard}>
        <View style={styles.miniCardHeader}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.miniCardTitle}>{t('verifiedProvider')}</Text>
        </View>
        <Text style={styles.miniCardText}>
          {t('verifiedProviderDesc')}
        </Text>
      </Card>
    </View>
  );

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.layout}>
          {mainContent}
          {isDesktop && sidebarContent}
        </View>
      </ScrollView>

      <BookingModal
        visible={bookingVisible}
        doctorId={doctor.id}
        initialSlotIndex={selectedSlotIdx}
        onClose={() => setBookingVisible(false)}
        onSuccess={() => {
          setBookingVisible(false);
          router.replace("/(tabs)/appointments");
        }}
      />
    </ScreenContainer>
  );
}
const createStyles = (theme: Theme, isDark: boolean, width: number) => {
  const isDesktop = width > 992;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1b1e" : "#f4f2ee",
    },
    contentContainer: {
      paddingVertical: isDesktop ? 24 : 0,
      paddingHorizontal: isDesktop ? 40 : 0,
      alignItems: "center",
    },
    layout: {
      flexDirection: "row",
      gap: 24,
      width: "100%",
      maxWidth: 1128,
    },
    mainColumn: {
      flex: isDesktop ? 2.5 : 1,
      gap: 12,
    },
    sidebarColumn: {
      flex: 1,
      gap: 12,
    },
    headerCard: {
      borderRadius: isDesktop ? 12 : 0,
      padding: 0,
      overflow: "hidden",
    },
    headerTop: {
      padding: 16,
      backgroundColor: "transparent",
    },
    backBtnInline: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadows.sm,
    },
    headerInfo: {
      flexDirection: isDesktop ? "row" : "column",
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 24,
    },
    avatarWrapper: {
      position: "relative",
      width: 140,
      height: 140,
    },
    avatarContainer: {
      width: "100%",
      height: "100%",
      borderRadius: 70,
      backgroundColor: theme.colors.background,
      borderWidth: 4,
      borderColor: theme.colors.surface,
      overflow: "hidden",
      ...theme.shadows.md,
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      flex: 1,
      backgroundColor: "#cbd5e1",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 48,
      fontWeight: "bold",
      color: "#FFF",
    },
    editAvatarBtn: {
      position: "absolute",
      top: 5,
      right: 5,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      borderWidth: 3,
      borderColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      ...theme.shadows.sm,
    },
    verifiedBadge: {
      position: "absolute",
      bottom: 5,
      right: 5,
      backgroundColor: "#FFF",
      borderRadius: 12,
      padding: 0,
      ...theme.shadows.sm,
      zIndex: 11,
    },
    headerContent: {
      flex: 1,
      justifyContent: "center",
    },
    headerTopRow: {
      flexDirection: isDesktop ? "row" : "column",
      justifyContent: "space-between",
      alignItems: isDesktop ? "center" : "flex-start",
      gap: 20,
    },
    nameSection: {
      flex: 1,
    },
    name: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: "600",
      marginTop: 2,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
    },
    subtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    ratingBrief: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 10,
    },
    starRow: {
      flexDirection: "row",
      gap: 2,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    quickStatsGrid: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap",
    },
    quickStatBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
      padding: 12,
      borderRadius: 16,
      gap: 10,
      minWidth: 140,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickStatVal: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.colors.text,
    },
    quickStatLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    actionRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
      flexWrap: "wrap",
    },
    primaryActionBtn: {
      borderRadius: 24,
      paddingHorizontal: 28,
      height: 48,
      minWidth: 160,
    },
    secondaryActionBtn: {
      borderRadius: 24,
      paddingHorizontal: 28,
      height: 48,
      minWidth: 120,
    },
    sectionCard: {
      borderRadius: isDesktop ? 12 : 0,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      letterSpacing: -0.3,
    },
    bioText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 24,
    },
    listContainer: {
      gap: 16,
    },
    experienceItem: {
      flexDirection: "row",
      gap: 12,
    },
    experienceIcon: {
      width: 48,
      height: 48,
      backgroundColor: theme.colors.primary + "10",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    experienceDetails: {
      flex: 1,
    },
    miniCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    miniCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    miniCardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    miniCardText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    availabilityList: {
      gap: 8,
    },
    emptyAvailabilityText: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      textAlign: "center",
      marginVertical: 12,
      fontStyle: "italic",
    },
    timeSlot: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + "08",
      borderWidth: 1,
      borderColor: theme.colors.primary + "15",
    },
    timeSlotText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },
  });
};

import { Card, ScreenContainer } from "@/components/ui";
import { getFullMediaUrl } from "@/lib/utils";
import { useDoctorStore } from "@/store/doctor.store";
import { useTheme, type Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTranslation } from "../../../i18n";
import { formatDisplayValue } from "../../../utils";
import { DoctorProfileEditModal } from "./DoctorProfileEditModal";

// ─── Small reusable pieces ────────────────────────────────────────────────────

function StatCard({ label, value, color, icon, theme }: {
    label: string; value: string | number;
    color: string; icon: string; theme: any;
}) {
    return (
        <View style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
            <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: color + "15",
                alignItems: "center", justifyContent: "center", marginBottom: 6,
            }}>
                <Ionicons name={icon as any} size={18} color={color} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color }}>{value}</Text>
            <Text style={{ fontSize: 11, color: theme.colors.textSecondary, fontWeight: "500", marginTop: 2 }}>
                {label}
            </Text>
        </View>
    );
}

function InfoRow({ icon, label, value, color, theme }: {
    icon: string; label: string; value: string; color?: string; theme: any;
}) {
    return (
        <View style={{
            flexDirection: "row", alignItems: "flex-start",
            paddingVertical: 12, borderBottomWidth: 1,
            borderBottomColor: theme.colors.border + "60", gap: 12,
        }}>
            <View style={{
                width: 34, height: 34, borderRadius: 9,
                backgroundColor: (color || theme.colors.primary) + "12",
                alignItems: "center", justifyContent: "center",
            }}>
                <Ionicons name={icon as any} size={16} color={color || theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: theme.colors.textSecondary, marginBottom: 2 }}>
                    {label.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "500", color: theme.colors.text, lineHeight: 20 }}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function SectionLabel({ title, theme }: { title: string; theme: any }) {
    return (
        <Text style={{
            fontSize: 13, fontWeight: "800", color: theme.colors.textSecondary,
            textTransform: "uppercase", letterSpacing: 0.8,
            marginBottom: 4, marginTop: 8,
        }}>
            {title}
        </Text>
    );
}

// ─── Tappable avatar in hero ──────────────────────────────────────────────────

function HeroAvatar({
    imageUri,
    onPress,
    theme,
    editPhotoLabel,
}: {
    imageUri: string | null | undefined;
    onPress: () => void;
    theme: any;
    editPhotoLabel: string;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={{ marginBottom: 14 }}
            accessibilityRole="button"
            accessibilityLabel={editPhotoLabel}
        >
            {/* Avatar ring */}
            <View style={{
                width: 110, height: 110, borderRadius: 55,
                borderWidth: 3, borderColor: theme.colors.primary + "40",
                overflow: "hidden",
                backgroundColor: theme.colors.surface,
                alignItems: "center", justifyContent: "center",
            }}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} />
                ) : (
                    <Ionicons name="person" size={48} color={theme.colors.textTertiary} />
                )}
            </View>

            {/* Camera badge */}
            <View style={{
                position: "absolute", bottom: 2, right: 2,
                width: 30, height: 30, borderRadius: 15,
                backgroundColor: theme.colors.primary,
                alignItems: "center", justifyContent: "center",
                borderWidth: 2.5, borderColor: theme.colors.surface,
            }}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
        </TouchableOpacity>
    );
}

// ─── Main exported component ─────────────────────────────────────────────────

export function DoctorProfileView() {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t } = useTranslation('doctorProfile');

    const { profile, isLoadingProfile, fetchProfile, profileImageVersion } = useDoctorStore();
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const openLink = useCallback((url: string) => {
        if (!url) return;
        const full = url.startsWith("http") ? url : `https://${url}`;
        Linking.openURL(full).catch(() => { });
    }, []);

    if (isLoadingProfile && !profile) {
        return (
            <ScreenContainer>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </ScreenContainer>
        );
    }

    const fee = profile?.consultation_fee
        ? `ETB ${parseFloat(profile.consultation_fee).toLocaleString()}`
        : "—";

    const rating = profile?.average_rating
        ? parseFloat(String(profile.average_rating)).toFixed(1)
        : "—";

    const avatarUri = profile?.profile_image
        ? `${getFullMediaUrl(profile.profile_image)}?v=${profileImageVersion}`
        : null;

    return (
        <>
            <ScreenContainer scrollable padded={false} constrained>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    {/* ── Hero ── */}
                    <View style={styles.hero}>
                        {/* Edit text button (top-right) */}
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setShowEditModal(true)}
                            accessibilityRole="button"
                            accessibilityLabel={t('profile.accessibility.editProfile')}
                        >
                            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.editBtnText}>{t('profile.editBtn')}</Text>
                        </TouchableOpacity>

                        {/* Tapping the avatar also opens the modal */}
                        <HeroAvatar
                            imageUri={avatarUri}
                            onPress={() => setShowEditModal(true)}
                            theme={theme}
                            editPhotoLabel={t('profile.accessibility.editPhoto')}
                        />

                        <Text style={styles.heroName}>{t('profile.heroName')}</Text>

                        <View style={[styles.verifiedBadge, {
                            backgroundColor: profile?.is_verified
                                ? theme.colors.successLight
                                : theme.colors.primaryLight,
                        }]}>
                            <Ionicons
                                name={profile?.is_verified ? "shield-checkmark" : "time-outline"}
                                size={13}
                                color={profile?.is_verified ? theme.colors.success : theme.colors.primary}
                            />
                            <Text style={[styles.verifiedText, {
                                color: profile?.is_verified ? theme.colors.success : theme.colors.primary,
                            }]}>
                                {profile?.is_verified
                                    ? t('profile.verified')
                                    : t('profile.pendingReview')}
                            </Text>
                        </View>

                        {profile?.specialization ? (
                            <Text style={styles.heroSpecialization}>{profile.specialization}</Text>
                        ) : null}
                    </View>

                    <View style={styles.content}>

                        {/* ── Stats ── */}
                        <Card style={styles.card}>
                            <View style={styles.statsRow}>
                                <StatCard
                                    label={t('profile.stats.rating')}
                                    value={rating}
                                    color={theme.colors.warning}
                                    icon="star"
                                    theme={theme}
                                />
                                <View style={styles.statDivider} />
                                <StatCard
                                    label={t('profile.stats.reviews')}
                                    value={profile?.review_count ?? 0}
                                    color={theme.colors.primary}
                                    icon="chatbubbles-outline"
                                    theme={theme}
                                />
                                <View style={styles.statDivider} />
                                <StatCard
                                    label={t('profile.stats.experience')}
                                    value={profile?.years_of_experience ? `${profile.years_of_experience}y` : "—"}
                                    color={theme.colors.success}
                                    icon="briefcase-outline"
                                    theme={theme}
                                />
                                <View style={styles.statDivider} />
                                <StatCard
                                    label={t('profile.stats.fee')}
                                    value={fee}
                                    color="#8B5CF6"
                                    icon="cash-outline"
                                    theme={theme}
                                />
                            </View>
                        </Card>

                        {/* ── Professional Info ── */}
                        <Card style={styles.card}>
                            <SectionLabel title={t('profile.sections.professionalInfo')} theme={theme} />
                            {profile?.specialization && (
                                <InfoRow
                                    icon="medical-outline"
                                    label={t('profile.infoRows.specialization')}
                                    value={profile.specialization}
                                    theme={theme}
                                />
                            )}
                            {profile?.current_working_hospital && (
                                <InfoRow
                                    icon="business-outline"
                                    label={t('profile.infoRows.currentHospital')}
                                    value={profile.current_working_hospital}
                                    theme={theme}
                                />
                            )}
                            {profile?.location && (
                                <InfoRow
                                    icon="location-outline"
                                    label={t('profile.infoRows.location')}
                                    value={profile.location}
                                    theme={theme}
                                />
                            )}
                            {profile?.years_of_experience != null && (
                                <InfoRow
                                    icon="briefcase-outline"
                                    label={t('profile.infoRows.experience')}
                                    value={t('profile.infoRows.experienceYears', { years: profile.years_of_experience })}
                                    theme={theme}
                                />
                            )}
                            {profile?.consultation_fee && (
                                <InfoRow
                                    icon="cash-outline"
                                    label={t('profile.infoRows.consultationFee')}
                                    value={fee}
                                    color="#8B5CF6"
                                    theme={theme}
                                />
                            )}
                            {!profile?.specialization && !profile?.current_working_hospital &&
                                !profile?.location && profile?.years_of_experience == null && (
                                    <View style={styles.emptySection}>
                                        <Ionicons name="information-circle-outline" size={24} color={theme.colors.textTertiary} />
                                        <Text style={styles.emptySectionText}>
                                            {t('profile.empty.noProfessionalInfo')}
                                        </Text>
                                    </View>
                                )}
                        </Card>

                        {/* ── Biography ── */}
                        {profile?.biography ? (
                            <Card style={styles.card}>
                                <SectionLabel title={t('profile.sections.about')} theme={theme} />
                                <Text style={styles.biographyText}>{profile.biography}</Text>
                            </Card>
                        ) : null}

                        {/* ── Background ── */}
                        {(profile?.education || profile?.experience) ? (
                            <Card style={styles.card}>
                                <SectionLabel title={t('profile.sections.background')} theme={theme} />
                                {profile?.education && (
                                    <InfoRow
                                        icon="school-outline"
                                        label={t('profile.infoRows.education')}
                                        value={formatDisplayValue(profile.education)}
                                        color={theme.colors.primary}
                                        theme={theme}
                                    />
                                )}
                                {profile?.experience && (
                                    <InfoRow
                                        icon="ribbon-outline"
                                        label={t('profile.infoRows.experience')}
                                        value={formatDisplayValue(profile.experience)}
                                        color={theme.colors.success}
                                        theme={theme}
                                    />
                                )}
                            </Card>
                        ) : null}

                        {/* ── Social Links ── */}
                        {(profile?.youtube_link || profile?.linkedin_link) ? (
                            <Card style={styles.card}>
                                <SectionLabel title={t('profile.sections.socialLinks')} theme={theme} />
                                {profile?.youtube_link && (
                                    <TouchableOpacity
                                        style={styles.socialRow}
                                        onPress={() => openLink(profile.youtube_link!)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.socialIcon, { backgroundColor: "#FF000015" }]}>
                                            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.socialLabel}>{t('profile.social.youtube')}</Text>
                                            <Text style={styles.socialUrl} numberOfLines={1}>{profile.youtube_link}</Text>
                                        </View>
                                        <Ionicons name="open-outline" size={16} color={theme.colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                                {profile?.linkedin_link && (
                                    <TouchableOpacity
                                        style={styles.socialRow}
                                        onPress={() => openLink(profile.linkedin_link!)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.socialIcon, { backgroundColor: "#0A66C215" }]}>
                                            <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.socialLabel}>{t('profile.social.linkedin')}</Text>
                                            <Text style={styles.socialUrl} numberOfLines={1}>{profile.linkedin_link}</Text>
                                        </View>
                                        <Ionicons name="open-outline" size={16} color={theme.colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                            </Card>
                        ) : null}

                        {/* ── Empty state ── */}
                        {!profile && !isLoadingProfile && (
                            <View style={styles.fullEmpty}>
                                <Ionicons name="person-circle-outline" size={64} color={theme.colors.textTertiary} />
                                <Text style={styles.fullEmptyTitle}>{t('profile.empty.notSetUpTitle')}</Text>
                                <Text style={styles.fullEmptyDesc}>{t('profile.empty.notSetUpDesc')}</Text>
                                <TouchableOpacity style={styles.setupBtn} onPress={() => setShowEditModal(true)}>
                                    <Ionicons name="create-outline" size={16} color="#fff" />
                                    <Text style={styles.setupBtnText}>{t('profile.empty.setupBtn')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </ScreenContainer>

            <DoctorProfileEditModal
                visible={showEditModal}
                onClose={async () => {
                    setShowEditModal(false);
                    await fetchProfile();
                }}
            />
        </>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
    hero: {
        alignItems: "center", paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    editBtn: {
        position: "absolute", top: 20, right: 20,
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary + "12",
        borderWidth: 1, borderColor: theme.colors.primary + "30",
    },
    editBtnText: { fontSize: 13, fontWeight: "600", color: theme.colors.primary },
    heroName: { fontSize: 22, fontWeight: "800", color: theme.colors.text, marginBottom: 8 },
    verifiedBadge: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: theme.radius.full, marginBottom: 8,
    },
    verifiedText: { fontSize: 12, fontWeight: "700" },
    heroSpecialization: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: "500", marginTop: 2 },
    content: { paddingHorizontal: 20, paddingTop: 20 },
    card: { marginBottom: 16 },
    statsRow: { flexDirection: "row" },
    statDivider: { width: 1, backgroundColor: theme.colors.border, marginVertical: 10 },
    biographyText: { fontSize: 14, color: theme.colors.text, lineHeight: 22, marginTop: 8 },
    socialRow: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingVertical: 12, borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + "60",
    },
    socialIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    socialLabel: { fontSize: 12, fontWeight: "600", color: theme.colors.textSecondary },
    socialUrl: { fontSize: 13, color: theme.colors.primary, fontWeight: "500" },
    emptySection: { alignItems: "center", paddingVertical: 20, gap: 8 },
    emptySectionText: { fontSize: 13, color: theme.colors.textTertiary },
    fullEmpty: { alignItems: "center", paddingVertical: 40, gap: 10 },
    fullEmptyTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
    fullEmptyDesc: { fontSize: 13, color: theme.colors.textSecondary, textAlign: "center", paddingHorizontal: 20 },
    setupBtn: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: theme.radius.md, marginTop: 8,
    },
    setupBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
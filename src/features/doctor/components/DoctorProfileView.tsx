import { Card, ScreenContainer } from "@/components/ui";
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
import { DoctorProfileEditModal } from "./DoctorProfileEditModal";
import { formatDisplayValue } from "../../../utils";

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

// ─── Main exported component ─────────────────────────────────────────────────

export function DoctorProfileView() {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const { profile, isLoadingProfile, fetchProfile } = useDoctorStore();
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

    return (
        <>
            <ScreenContainer scrollable padded={false} constrained>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    {/* ── Hero ── */}
                    <View style={styles.hero}>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setShowEditModal(true)}
                        >
                            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <View style={styles.avatarRing}>
                            {profile?.profile_image ? (
                                <Image source={{ uri: profile.profile_image }} style={styles.avatar} />
                            ) : (
                                <Image
                                    source={require("../../../../assets/images/doctor-avatar.png")}
                                    style={styles.avatar}
                                />
                            )}
                        </View>

                        <Text style={styles.heroName}>Doctor Profile</Text>

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
                                {profile?.is_verified ? "Verified Practitioner" : "Pending Institutional Review"}
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
                                <StatCard label="Rating" value={rating} color={theme.colors.warning} icon="star" theme={theme} />
                                <View style={styles.statDivider} />
                                <StatCard label="Reviews" value={profile?.review_count ?? 0} color={theme.colors.primary} icon="chatbubbles-outline" theme={theme} />
                                <View style={styles.statDivider} />
                                <StatCard label="Experience" value={profile?.years_of_experience ? `${profile.years_of_experience}y` : "—"} color={theme.colors.success} icon="briefcase-outline" theme={theme} />
                                <View style={styles.statDivider} />
                                <StatCard label="Fee" value={fee} color="#8B5CF6" icon="cash-outline" theme={theme} />
                            </View>
                        </Card>

                        {/* ── Professional Info ── */}
                        <Card style={styles.card}>
                            <SectionLabel title="Professional Info" theme={theme} />
                            {profile?.specialization && (
                                <InfoRow icon="medical-outline" label="Specialization" value={profile.specialization} theme={theme} />
                            )}
                            {profile?.current_working_hospital && (
                                <InfoRow icon="business-outline" label="Current Hospital" value={profile.current_working_hospital} theme={theme} />
                            )}
                            {profile?.location && (
                                <InfoRow icon="location-outline" label="Location" value={profile.location} theme={theme} />
                            )}
                            {profile?.years_of_experience != null && (
                                <InfoRow icon="briefcase-outline" label="Experience" value={`${profile.years_of_experience} years`} theme={theme} />
                            )}
                            {profile?.consultation_fee && (
                                <InfoRow icon="cash-outline" label="Consultation Fee" value={fee} color="#8B5CF6" theme={theme} />
                            )}
                            {!profile?.specialization && !profile?.current_working_hospital &&
                                !profile?.location && profile?.years_of_experience == null && (
                                    <View style={styles.emptySection}>
                                        <Ionicons name="information-circle-outline" size={24} color={theme.colors.textTertiary} />
                                        <Text style={styles.emptySectionText}>No professional info added yet.</Text>
                                    </View>
                                )}
                        </Card>

                        {/* ── Biography ── */}
                        {profile?.biography ? (
                            <Card style={styles.card}>
                                <SectionLabel title="About" theme={theme} />
                                <Text style={styles.biographyText}>{profile.biography}</Text>
                            </Card>
                        ) : null}

                        {/* ── Background ── */}
                        {(profile?.education || profile?.experience) ? (
                            <Card style={styles.card}>
                                <SectionLabel title="Background" theme={theme} />
                                {profile?.education && (
                                    <InfoRow icon="school-outline" label="Education" value={formatDisplayValue(profile.education)} color={theme.colors.primary} theme={theme} />
                                )}
                                {profile?.experience && (
                                    <InfoRow icon="ribbon-outline" label="Experience" value={formatDisplayValue(profile.experience)} color={theme.colors.success} theme={theme} />
                                )}
                            </Card>
                        ) : null}

                        {/* ── Social Links ── */}
                        {(profile?.youtube_link || profile?.linkedin_link) ? (
                            <Card style={styles.card}>
                                <SectionLabel title="Social Links" theme={theme} />
                                {profile?.youtube_link && (
                                    <TouchableOpacity style={styles.socialRow} onPress={() => openLink(profile.youtube_link!)} activeOpacity={0.7}>
                                        <View style={[styles.socialIcon, { backgroundColor: "#FF000015" }]}>
                                            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.socialLabel}>YouTube Channel</Text>
                                            <Text style={styles.socialUrl} numberOfLines={1}>{profile.youtube_link}</Text>
                                        </View>
                                        <Ionicons name="open-outline" size={16} color={theme.colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                                {profile?.linkedin_link && (
                                    <TouchableOpacity style={styles.socialRow} onPress={() => openLink(profile.linkedin_link!)} activeOpacity={0.7}>
                                        <View style={[styles.socialIcon, { backgroundColor: "#0A66C215" }]}>
                                            <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.socialLabel}>LinkedIn Profile</Text>
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
                                <Text style={styles.fullEmptyTitle}>Profile Not Set Up</Text>
                                <Text style={styles.fullEmptyDesc}>
                                    Tap "Edit" to add your professional information.
                                </Text>
                                <TouchableOpacity style={styles.setupBtn} onPress={() => setShowEditModal(true)}>
                                    <Ionicons name="create-outline" size={16} color="#fff" />
                                    <Text style={styles.setupBtnText}>Set Up Profile</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </ScreenContainer>

            <DoctorProfileEditModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
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
    avatarRing: {
        width: 110, height: 110, borderRadius: 55,
        borderWidth: 3, borderColor: theme.colors.primary + "40",
        overflow: "hidden", marginBottom: 14,
    },
    avatar: { width: "100%", height: "100%" },
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
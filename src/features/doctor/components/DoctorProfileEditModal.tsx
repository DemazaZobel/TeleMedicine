import { Button, Input } from "@/components/ui";
import { ModalBase } from "@/components/ui/ModalBase";
import { useDoctorStore } from "@/store/doctor.store";
import { useTheme, type Theme } from "@/theme";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { DoctorProfileUpdate } from "../types/doctor.types";


interface Props {
    visible: boolean;
    onClose: () => void;
}

function SectionLabel({ title }: { title: string }) {
    const { theme } = useTheme();
    return (
        <Text style={{
            fontSize: 11, fontWeight: "800", color: theme.colors.textTertiary,
            textTransform: "uppercase", letterSpacing: 0.8,
            marginTop: 20, marginBottom: 4,
        }}>
            {title}
        </Text>
    );
}

export function DoctorProfileEditModal({ visible, onClose }: Props) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const { profile, isUpdatingProfile, isLoadingProfile, error, updateProfile, clearError } = useDoctorStore();

    const [specialization, setSpecialization] = useState("");
    const [yearsOfExp, setYearsOfExp] = useState("");
    const [fee, setFee] = useState("");
    const [location, setLocation] = useState("");
    const [hospital, setHospital] = useState("");
    const [biography, setBiography] = useState("");
    const [experience, setExperience] = useState("");
    const [education, setEducation] = useState("");
    const [youtube, setYoutube] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (visible && profile) {
            const str = (v: any) => (v != null ? String(v) : "");
            
            const formatForEdit = (v: any): string => {
                if (!v) return "";
                if (typeof v === "string") {
                    const trimmed = v.trim();
                    if (trimmed === "[object Object]") return "";
                    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            return formatForEdit(parsed);
                        } catch {
                            return trimmed;
                        }
                    }
                    return trimmed;
                }
                if (Array.isArray(v)) {
                    return v.map(item => {
                        if (!item) return "";
                        if (typeof item === "string") {
                            return item.trim() === "[object Object]" ? "" : item;
                        }
                        if (typeof item === "object") {
                            const title = item.role || item.degree || item.title || "";
                            const subtitle = item.hospital || item.institution || item.school || item.company || "";
                            if (title && subtitle) return `${title} at ${subtitle}`;
                            if (title) return title;
                            if (subtitle) return subtitle;
                            return Object.values(item).join(", ");
                        }
                        return String(item);
                    }).filter(Boolean).join("\n");
                }
                return String(v);
            };

            setSpecialization(str(profile.specialization));
            setYearsOfExp(profile.years_of_experience ? String(profile.years_of_experience) : "");
            setFee(profile.consultation_fee ? String(parseFloat(profile.consultation_fee)) : "");
            setLocation(str(profile.location));
            setHospital(str(profile.current_working_hospital));
            setBiography(str(profile.biography));
            setExperience(formatForEdit(profile.experience));
            setEducation(formatForEdit(profile.education));
            setYoutube(str(profile.youtube_link));
            setLinkedin(str(profile.linkedin_link));
            setSaved(false);
            clearError();
        }
    }, [visible, profile]);

    const c = (setter: (v: string) => void) => (t: string) => {
        setter(t); clearError(); setSaved(false);
    };

    const handleSave = useCallback(async () => {
        setSaved(false);

        // Safety: ensure all values are strings before calling .trim()
        const s = (v: any) => (typeof v === "string" ? v : String(v ?? ""));

        const toArray = (strVal: string) => {
            return strVal
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
        };

        const payload: DoctorProfileUpdate = {
            specialization: s(specialization).trim() || undefined,
            years_of_experience: yearsOfExp ? Number(yearsOfExp) : undefined,
            consultation_fee: fee ? Number(fee) : undefined,
            location: s(location).trim() || undefined,
            current_working_hospital: s(hospital).trim() || undefined,
            biography: s(biography).trim() || undefined,
            experience: toArray(experience),
            education: toArray(education),
            youtube_link: s(youtube).trim() || undefined,
            linkedin_link: s(linkedin).trim() || undefined,
        };

        try {
            await updateProfile(payload);
            setSaved(true);
            setTimeout(onClose, 700);
        } catch { /* error in store */ }
    }, [specialization, yearsOfExp, fee, location, hospital, biography,
        experience, education, youtube, linkedin, updateProfile, onClose]);
    return (
        <ModalBase visible={visible} onClose={onClose}
            title="Edit Profile" subtitle="Update your professional information"
            maxWidth={560}
        >
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                <View style={styles.body}>

                    {error ? (
                        <View style={[styles.banner, { backgroundColor: theme.colors.errorLight }]}>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: theme.colors.error }}>{error}</Text>
                        </View>
                    ) : null}
                    {saved ? (
                        <View style={[styles.banner, { backgroundColor: theme.colors.successLight }]}>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: theme.colors.success }}>
                                Profile updated!
                            </Text>
                        </View>
                    ) : null}

                    <SectionLabel title="Professional Info" />
                    <Input label="Specialization" placeholder="e.g. Cardiology"
                        value={specialization} onChangeText={c(setSpecialization)} />
                    <Input label="Current Hospital / Clinic" placeholder="e.g. Black Lion Hospital"
                        value={hospital} onChangeText={c(setHospital)} />
                    <Input label="Location" placeholder="e.g. Addis Ababa"
                        value={location} onChangeText={c(setLocation)} />
                    <View style={styles.row}>
                        <Input label="Experience (years)" placeholder="0"
                            value={yearsOfExp} onChangeText={c(setYearsOfExp)}
                            keyboardType="numeric" containerStyle={styles.half} />
                        <Input label="Consultation Fee (ETB)" placeholder="0.00"
                            value={fee} onChangeText={c(setFee)}
                            keyboardType="decimal-pad" containerStyle={styles.half} />
                    </View>

                    <SectionLabel title="Background" />
                    <Input label="Education" placeholder="Medical degree, university…"
                        value={education} onChangeText={c(setEducation)} multiline numberOfLines={3} />
                    <Input label="Experience Details" placeholder="Career highlights…"
                        value={experience} onChangeText={c(setExperience)} multiline numberOfLines={3} />
                    <Input label="Biography" placeholder="Tell patients about yourself…"
                        value={biography} onChangeText={c(setBiography)} multiline numberOfLines={4} />

                    <SectionLabel title="Social Links" />
                    <Input label="YouTube Channel" placeholder="https://youtube.com/…"
                        value={youtube} onChangeText={c(setYoutube)}
                        autoCapitalize="none" keyboardType="url" />
                    <Input label="LinkedIn Profile" placeholder="https://linkedin.com/in/…"
                        value={linkedin} onChangeText={c(setLinkedin)}
                        autoCapitalize="none" keyboardType="url" />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Cancel" variant="outline" onPress={onClose}
                    disabled={isUpdatingProfile} style={styles.footerBtn} />
                <Button title="Save Changes" onPress={handleSave}
                    loading={isUpdatingProfile || isLoadingProfile} style={styles.footerBtn} />
            </View>
        </ModalBase>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
    body: { paddingHorizontal: 2, paddingBottom: 8 },
    banner: { borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md },
    row: { flexDirection: "row", gap: theme.spacing.md },
    half: { flex: 1 },
    footer: { flexDirection: "row", gap: theme.spacing.md, paddingTop: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: theme.spacing.sm },
    footerBtn: { flex: 1 },
});
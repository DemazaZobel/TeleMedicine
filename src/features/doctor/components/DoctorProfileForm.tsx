import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from '../../../i18n';
import { Image, Text, useWindowDimensions, View } from "react-native";
import {
  Button,
  Card,
  Input,
  ScreenContainer,
  StarRating,
} from "../../../components/ui";
import { useDoctorStore } from "../../../store/doctor.store";
import { useTheme } from "../../../theme";
import { createDoctorProfileStyles } from "../styles/doctorProfile.styles";
import type { DoctorProfileUpdate } from "../types/doctor.types";

export function DoctorProfileForm() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createDoctorProfileStyles(theme), [theme]);
  const { width } = useWindowDimensions();

  const isDesktop = width > 768;

  const {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  } = useDoctorStore();

  // Core & Newly discovered fields from backend queries
  const [specialization, setSpecialization] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [currentWorkingHospital, setCurrentWorkingHospital] = useState("");
  const [location, setLocation] = useState("");
  const [biography, setBiography] = useState("");

  // Social
  const [youtubeLink, setYoutubeLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setSpecialization(profile.specialization ?? "");
      setYearsOfExperience(
        profile.years_of_experience ? String(profile.years_of_experience) : "",
      );
      setConsultationFee(
        profile.consultation_fee ? String(profile.consultation_fee) : "",
      );
      // Populate backend properties safely with fallback empty strings
      setCurrentWorkingHospital(profile.current_working_hospital ?? "");
      setLocation(profile.location ?? "");
      setBiography(profile.biography ?? "");

      setYoutubeLink(profile.youtube_link ?? "");
      setLinkedinLink(profile.linkedin_link ?? "");
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    setSaved(false);
    const payload: DoctorProfileUpdate & {
      current_working_hospital?: string;
      location?: string;
      biography?: string;
    } = {
      specialization: specialization.trim(),
      years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      consultation_fee: consultationFee ? Number(consultationFee) : undefined,
      current_working_hospital: currentWorkingHospital.trim() || undefined,
      location: location.trim() || undefined,
      biography: biography.trim() || undefined,
      youtube_link: youtubeLink.trim() || undefined,
      linkedin_link: linkedinLink.trim() || undefined,
    };
    try {
      await updateProfile(payload);
      setSaved(true);
    } catch {
      // Handled by state store instance
    }
  }, [
    specialization,
    yearsOfExperience,
    consultationFee,
    currentWorkingHospital,
    location,
    biography,
    youtubeLink,
    linkedinLink,
    updateProfile,
  ]);

  return (
    <ScreenContainer scrollable>
      <View style={{ width: "100%", maxWidth: 1100, alignSelf: "center", padding: theme.spacing.md }}>

        {/* Header Block */}
        <View style={{ alignItems: "center", marginBottom: theme.spacing["2xl"] }}>
          <Image
            source={require("../../../../assets/images/doctor-avatar.png")}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              marginBottom: theme.spacing.sm,
            }}
          />
          <Text style={{ ...theme.typography.h3, color: theme.colors.text, fontWeight: "700" }}>
            Doctor Profile
          </Text>
          <View
            style={{
              backgroundColor: profile?.is_verified ? theme.colors.successLight : theme.colors.primaryLight,
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: theme.radius.full,
              marginTop: 6,
            }}
          >
            <Text
              style={{
                color: profile?.is_verified ? theme.colors.success : theme.colors.primary,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {profile?.is_verified ? "Verified Practitioner" : "Pending Institutional Review"}
            </Text>
          </View>
        </View>

        {/* Global Notifications */}
        {error && (
          <View style={{ backgroundColor: theme.colors.errorLight, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <Text style={{ color: theme.colors.error, fontWeight: "500" }}>{error}</Text>
          </View>
        )}

        {saved && (
          <View style={{ backgroundColor: theme.colors.successLight, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <Text style={{ color: theme.colors.success, fontWeight: "500" }}>Profile updated successfully!</Text>
          </View>
        )}

        {/* Workspace Layout Split */}
        <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 24, alignItems: "flex-start" }}>

          {/* Left Column: Stats */}
          {profile && (
            <Card style={{ flex: isDesktop ? 1 : undefined, width: "100%", padding: 20 }}>
              <Text style={{ ...theme.typography.h4, color: theme.colors.text, marginBottom: 16, fontWeight: "600" }}>
                Platform Stats
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
                <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Average Rating</Text>
                <StarRating rating={Number(profile.average_rating) || 0} size={16} />
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Total Consultations Reviews</Text>
                <Text style={{ ...theme.typography.body, fontWeight: "bold" }}>{profile.review_count}</Text>
              </View>
            </Card>
          )}

        <Card style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>{t("doctor:professionalInfo")}</Text>

          <Input
            label="Specialization"
            placeholder={t("doctor:egCardiology")}
            value={specialization}
            onChangeText={(t) => {
              setSpecialization(t);
              clearError();
              setSaved(false);
            }}
          />

          <View style={styles.row}>
            <Input
              label="Experience (years)"
              placeholder="0"
              value={yearsOfExperience}
              onChangeText={(t) => {
                setYearsOfExperience(t);
                clearError();
                setSaved(false);
              }}
              keyboardType="numeric"
              containerStyle={styles.halfField}
            />
            <Input
              label={t("doctor:consultationFeeLabel")}
              placeholder="0.00"
              value={consultationFee}
              onChangeText={(t) => {
                setConsultationFee(t);
                clearError();
                setSaved(false);
              }}
              keyboardType="decimal-pad"
              containerStyle={styles.halfField}
            />
          </View>

              <Text style={{ ...theme.typography.h4, color: theme.colors.text, marginTop: 28, marginBottom: 16, fontWeight: "600" }}>
                Social Links
              </Text>

          <Input
            label={t("patient:youtubeChannel")}
            placeholder={t("patient:youtubePlaceholder")}
            value={youtubeLink}
            onChangeText={(t) => {
              setYoutubeLink(t);
              clearError();
              setSaved(false);
            }}
            autoCapitalize="none"
            keyboardType="url"
          />

          <Input
            label={t("patient:linkedinProfile")}
            placeholder={t("patient:linkedinPlaceholder")}
            value={linkedinLink}
            onChangeText={(t) => {
              setLinkedinLink(t);
              clearError();
              setSaved(false);
            }}
            autoCapitalize="none"
            keyboardType="url"
          />
        </Card>
        </View>

        <Button
          title={t("patient:saveProfile")}
          onPress={handleSave}
          loading={isUpdatingProfile || isLoadingProfile}
          fullWidth
          style={styles.submitButton}
        />
      </View>
    </ScreenContainer>
  );
}
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Banner, Button, Input } from "../../../components/ui";
import { ModalBase } from "../../../components/ui/ModalBase";
import { useAuthStore } from "../../../store/authStore";
import { useDiscoveryStore } from "../../../store/discovery.store";
import { useDoctorStore } from "../../../store/doctor.store";
import { Theme, useTheme } from "../../../theme";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { user, isLoading: authLoading, error, fetchProfile, updateProfile, clearError } =
    useAuthStore();
  const { 
    profile: doctorProfile, 
    isLoadingProfile: doctorLoading, 
    updateProfile: updateDoctorProfile, 
    fetchProfile: fetchDoctorProfile 
  } = useDoctorStore();

  const isLoading = authLoading || doctorLoading;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [biography, setBiography] = useState("");
  const [location, setLocation] = useState("");
  const [hospital, setHospital] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [saved, setSaved] = useState(false);

  const [original, setOriginal] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    biography: "",
    location: "",
    hospital: "",
    education: "",
    experience: "",
  });

  useEffect(() => {
    if (visible) {
      fetchProfile();
      if (user?.role === 'DOCTOR') {
        fetchDoctorProfile();
      }
      setSaved(false);
      clearError();
    }
  }, [visible, fetchProfile, fetchDoctorProfile, clearError, user?.role]);

  useEffect(() => {
    if (user && visible) {
      const fn = user.first_name ?? "";
      const ln = user.last_name ?? "";
      const pn = user.phone_number ?? "";
      
      // Clinical fields come from doctorProfile if available
      const bio = (user.role === 'DOCTOR' ? doctorProfile?.biography : user.biography) ?? "";
      const loc = (user.role === 'DOCTOR' ? doctorProfile?.location : user.location) ?? "";
      const hosp = (user.role === 'DOCTOR' ? doctorProfile?.current_working_hospital : user.current_working_hospital) ?? "";
      const edu = (user.role === 'DOCTOR' ? doctorProfile?.education : user.education) ?? "";
      const exp = (user.role === 'DOCTOR' ? doctorProfile?.experience : user.experience) ?? "";

      setFirstName(fn);
      setLastName(ln);
      setPhoneNumber(pn);
      setBiography(bio);
      setLocation(loc);
      setHospital(hosp);
      setEducation(edu);
      setExperience(exp);

      setOriginal({
        firstName: fn,
        lastName: ln,
        phoneNumber: pn,
        biography: bio,
        location: loc,
        hospital: hosp,
        education: edu,
        experience: exp,
      });
    }
  }, [user, doctorProfile, visible]);

  const hasChanges =
    firstName !== original.firstName ||
    lastName !== original.lastName ||
    phoneNumber !== original.phoneNumber ||
    biography !== original.biography ||
    location !== original.location ||
    hospital !== original.hospital ||
    education !== original.education ||
    experience !== original.experience;

  const { fetchDoctors } = useDiscoveryStore();

  const handleSave = useCallback(async () => {
    setSaved(false);
    clearError();
    try {
      // 1. Update User Profile (Auth Store)
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim() || undefined,
      });

      // 2. Update Doctor Profile (Doctor Store) if role is DOCTOR
      if (user?.role === 'DOCTOR') {
        await updateDoctorProfile({
          biography: biography.trim() || undefined,
          location: location.trim() || undefined,
          current_working_hospital: hospital.trim() || undefined,
          education: education.trim() || undefined,
          experience: experience.trim() || undefined,
        });
        
        // Refresh public lists and local doctor profile
        fetchDoctors();
        fetchDoctorProfile();
      }

      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [
    firstName,
    lastName,
    phoneNumber,
    biography,
    location,
    hospital,
    education,
    experience,
    updateProfile,
    updateDoctorProfile,
    fetchDoctors,
    fetchDoctorProfile,
    user?.role,
    clearError,
    onClose,
  ]);

  const initials = `${user?.first_name?.[0] ?? "U"}${user?.last_name?.[0] ?? ""}`;

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your personal information"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar with Camera Badge ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Banners ── */}
        {error && <Banner variant="error" message={error} />}
        {saved && (
          <Banner variant="success" message="Profile updated successfully." />
        )}

        {/* ── Side-by-side Name Fields ── */}
        <View style={styles.nameRow}>
          <Input
            label="First name"
            placeholder="First name"
            value={firstName}
            onChangeText={(t) => {
              setFirstName(t);
              clearError();
              setSaved(false);
            }}
            containerStyle={{ flex: 1 }}
          />
          <Input
            label="Last name"
            placeholder="Last name"
            value={lastName}
            onChangeText={(t) => {
              setLastName(t);
              clearError();
              setSaved(false);
            }}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* ── Phone Number ── */}
        <Input
          label="Phone"
          placeholder="+251 9XX XXX XXX"
          value={phoneNumber}
          onChangeText={(t) => {
            setPhoneNumber(t);
            clearError();
            setSaved(false);
          }}
          keyboardType="phone-pad"
        />

        {/* ── Biography (Doctor Only) ── */}
        {user?.role === "DOCTOR" && (
          <Input
            label="Biography"
            placeholder="Tell us about yourself..."
            value={biography}
            onChangeText={(t) => {
              setBiography(t);
              clearError();
              setSaved(false);
            }}
            multiline
            numberOfLines={4}
            inputStyle={{ height: 100 }}
          />
        )}

        {/* ── Location (Both) ── */}
        <Input
          label="Location"
          placeholder="Addis Ababa, Ethiopia"
          value={location}
          onChangeText={(t) => {
            setLocation(t);
            clearError();
            setSaved(false);
          }}
        />

        {/* ── Professional Info (Doctor Only) ── */}
        {user?.role === "DOCTOR" && (
          <>
            <Input
              label="Current Hospital"
              placeholder="Black Lion Hospital"
              value={hospital}
              onChangeText={(t) => {
                setHospital(t);
                clearError();
                setSaved(false);
              }}
            />

            <Input
              label="Education"
              placeholder="E.g. MD from Addis Ababa University"
              value={education}
              onChangeText={(t) => {
                setEducation(t);
                clearError();
                setSaved(false);
              }}
              multiline
            />

            <Input
              label="Experience"
              placeholder="E.g. 5 years at St. Paul Hospital"
              value={experience}
              onChangeText={(t) => {
                setExperience(t);
                clearError();
                setSaved(false);
              }}
              multiline
            />
          </>
        )}

        {/* ── Save Button ── */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          disabled={!hasChanges}
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: theme.spacing.xl,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: theme.spacing["2xl"],
    },
    avatarOuter: {
      position: "relative",
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primaryLight + "40",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitials: {
      fontSize: 36,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    cameraBadge: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: theme.colors.background,
    },
    nameRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    saveButton: {
      marginTop: theme.spacing["2xl"],
    },
  });

import { useRouter } from "expo-router";
import { useTranslation } from '../../src/i18n';
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SPACING } from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/authStore";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [loading, setLoading] = useState(false);

  const handleFirstNameChange = (val: string) => { setFirstName(val); clearError(); };
  const handleLastNameChange = (val: string) => { setLastName(val); clearError(); };
  const handleEmailChange = (val: string) => { setEmail(val); clearError(); };
  const handlePasswordChange = (val: string) => { setPassword(val); clearError(); };
  const handleRoleChange = (val: "PATIENT" | "DOCTOR") => { setRole(val); clearError(); };

  const submit = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", t("errors:fillAllFieldsWarning"));
      return;
    }
    
    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
      });

      router.push({
        pathname: "/auth/verify-otp",
        params: { email },
      } as any);
    } catch (e: any) {
       // Error is caught and set by authStore, no need for alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 40 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth:createAccount")}</Text>
          <Text style={styles.subtitle}>{t("auth:joinMedLinkTitle")}</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("auth:iAmA")}</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleCard, role === "PATIENT" && styles.roleCardActive]}
                onPress={() => handleRoleChange("PATIENT")}
              >
                <Text style={[styles.roleText, role === "PATIENT" && styles.roleTextActive]}>{t("common:patient")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.roleCard, role === "DOCTOR" && styles.roleCardActive]}
                onPress={() => handleRoleChange("DOCTOR")}
              >
                <Text style={[styles.roleText, role === "DOCTOR" && styles.roleTextActive]}>{t("common:doctor")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor={COLORS.textMuted}
                value={firstName}
                onChangeText={handleFirstNameChange}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor={COLORS.textMuted}
                value={lastName}
                onChangeText={handleLastNameChange}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder={t("auth:enterYourEmail")}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder={t("auth:createPasswordPlaceholder")}
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t("auth:registerAccount")}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("auth:alreadyHaveAccount")}</Text>
          <TouchableOpacity onPress={() => router.replace("/auth/login" as any)}>
            <Text style={styles.footerLink}>{t("auth:loginHere")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    justifyContent: "space-between",
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  form: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: COLORS.error + "15",
    padding: SPACING.m,
    borderRadius: RADII.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "500",
  },
  nameRow: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  inputGroup: {
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    padding: SPACING.m,
    fontSize: 16,
    color: COLORS.text,
  },
  roleRow: {
    flexDirection: "row",
    gap: SPACING.s,
  },
  roleCard: {
    flex: 1,
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    alignItems: "center",
  },
  roleCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  roleTextActive: {
    color: "#fff",
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: RADII.m,
    alignItems: "center",
    marginTop: SPACING.l,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.m,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
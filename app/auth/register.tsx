import { useRouter } from "expo-router";
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
import { register } from "../../src/services/authService";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    try {
      await register({
        email,
        password,
        role,
      });

      router.push({
        pathname: "/auth/verify-otp",
        params: { email },
      } as any);
    } catch (e: any) {
       Alert.alert("Registration Failed", e?.response?.data?.detail || "An error occurred.");
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join MedLink for better healthcare</Text>
        </View>

        <View style={styles.form}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleCard, role === "PATIENT" && styles.roleCardActive]}
                onPress={() => setRole("PATIENT")}
              >
                <Text style={[styles.roleText, role === "PATIENT" && styles.roleTextActive]}>Patient</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.roleCard, role === "DOCTOR" && styles.roleCardActive]}
                onPress={() => setRole("DOCTOR")}
              >
                <Text style={[styles.roleText, role === "DOCTOR" && styles.roleTextActive]}>Doctor</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
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
              <Text style={styles.btnText}>Register Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/auth/login" as any)}>
            <Text style={styles.footerLink}>Login Here</Text>
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
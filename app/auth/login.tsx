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
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear global error when typing
  const handleEmailChange = (val: string) => { setEmail(val); clearError(); };
  const handlePasswordChange = (val: string) => { setPassword(val); clearError(); };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      // Let root layout redirect based on user role auto magically
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
          <Text style={styles.title}>Welcome to MedLink</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
            />
          </View>
          
          <TouchableOpacity
            style={styles.forgotPassBtn}
            onPress={() => router.push("/auth/forgot-password" as any)}
          >
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/register" as any)}>
            <Text style={styles.footerLink}>Register Here</Text>
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
  forgotPassBtn: {
    alignSelf: "flex-end",
    marginBottom: SPACING.xl,
  },
  forgotPassText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: RADII.m,
    alignItems: "center",
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
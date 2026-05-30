import { useLocalSearchParams, useRouter } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADII, SPACING } from "../../src/constants/theme";
import { resendOTP, verifyOTP } from "../../src/services/authService";

export default function VerifyOTPScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async () => {
    if (!code) return;

    setLoading(true);
    try {
      await verifyOTP(email as string, code);
      Alert.alert("Success", t("auth:verificationSuccess"));
      router.replace("/auth/login" as any);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP(email as string);
      Alert.alert(t("auth:codeSent"), t("auth:codeResentSuccess"));
    } catch (e: any) {
      Alert.alert("Error", t("errors:resendFailed"));
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{t("auth:verifyEmailTitle")}</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to{"\n"}{email}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={6}
              textAlign="center"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, (!code || loading) && styles.btnDisabled]}
            onPress={submit}
            disabled={!code || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t("auth:verifyAccount")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.footerText}>{t("auth:didntReceiveCode")} </Text>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.resendLink}>{t("common:resend")}</Text>
              )}
            </TouchableOpacity>
          </View>
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
  },
  backBtn: {
    marginBottom: SPACING.l,
    width: 40,
    height: 40,
    justifyContent: "center",
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
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.l,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.m,
    padding: SPACING.l,
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "bold",
    color: COLORS.text,
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
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
  resendLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
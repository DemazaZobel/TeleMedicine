import { Stack, useRouter, useSegments } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import { COLORS } from "../src/constants/theme"
import { useAuthStore } from "../src/store/authStore"

export default function RootLayout() {

  const { user, loading, bootstrap } = useAuthStore()

  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    bootstrap()
  }, [])

  useEffect(() => {

    if (loading) return

    const inAuth = segments[0] === "auth"

    if (!user && !inAuth) {
      router.replace("/auth/login" as any)
      return
    }

    if (user) {

      if (!user.is_verified) {
        router.replace("/auth/verify-otp" as any)
        return
      }

      if (user.role === "DOCTOR" && !user.is_doctor_approved) {
        router.replace("/doctor/pending" as any)
        return
      }

      if (user.role === "PATIENT") {
        router.replace("/(tabs)" as any)
        return
      }

      if (user.role === "DOCTOR" && user.is_doctor_approved) {
        router.replace("/doctor/home" as any)
        return
      }

    }

  }, [user, loading])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
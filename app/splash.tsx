import { useRouter } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import { getAccess } from "../src/services/tokenStorage"

export default function Splash() {

  const router = useRouter()

  useEffect(() => {

    const check = async () => {
      const token = await getAccess()

      if (token) {
        router.replace("/(tabs)")
      } else {
        router.replace("/auth/login")
      }
    }

    check()

  }, [])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  )
}
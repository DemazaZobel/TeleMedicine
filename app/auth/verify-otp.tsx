import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { Button, TextInput, View } from "react-native"
import { resendOTP, verifyOTP } from "../../src/services/authService"

export default function VerifyOTP() {

  const { email } = useLocalSearchParams()
  const router = useRouter()

  const [code, setCode] = useState("")

  const submit = async () => {

    await verifyOTP(email as string, code)

    router.replace("/auth/login")

  }

  return (
    <View>

      <TextInput
        placeholder="Enter 6 digit code"
        keyboardType="number-pad"
        onChangeText={setCode}
      />

      <Button title="Verify" onPress={submit} />
      <Button title="Resend" onPress={() => resendOTP(email as string)} />

    </View>
  )
}
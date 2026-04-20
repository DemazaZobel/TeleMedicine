import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { Button, TextInput, View } from "react-native"
import { resetPassword } from "../../src/services/authService"

export default function Reset() {

  const { email } = useLocalSearchParams()
  const router = useRouter()

  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")

  const submit = async () => {

    await resetPassword(email as string, code, password)

    router.replace("/auth/login")

  }

  return (
    <View>

      <TextInput placeholder="Code" onChangeText={setCode} />
      <TextInput placeholder="New Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Reset Password" onPress={submit} />

    </View>
  )
}
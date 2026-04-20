import { useRouter } from "expo-router"
import { useState } from "react"
import { Button, TextInput, View } from "react-native"
import { forgotPassword } from "../../src/services/authService"

export default function Forgot() {

  const router = useRouter()

  const [email, setEmail] = useState("")

  const submit = async () => {

    await forgotPassword(email)

    router.push({
      pathname: "/auth/reset-password",
      params: { email }
    })

  }

  return (
    <View>

      <TextInput placeholder="Email" onChangeText={setEmail} />

      <Button title="Send Code" onPress={submit} />

    </View>
  )
}
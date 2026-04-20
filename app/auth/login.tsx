import { useState } from "react"
import { Button, TextInput, View } from "react-native"
import { useAuthStore } from "../../src/store/authStore"

export default function LoginScreen() {

  const login = useAuthStore(s => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <View>

      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button
        title="Login"
        onPress={() => login(email, password)}
      />

    </View>
  )
}
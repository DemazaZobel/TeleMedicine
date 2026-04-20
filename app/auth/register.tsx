import { useRouter } from "expo-router"
import { useState } from "react"
import { Button, TextInput, View } from "react-native"
import { register } from "../../src/services/authService"

export default function Register() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("PATIENT")

  const submit = async () => {

    await register({
      email,
      password,
      role
    })

    router.push({
      pathname: "/auth/verify-otp",
      params: { email }
    })

  }

  return (
    <View>

      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Register Patient" onPress={() => setRole("PATIENT")} />
      <Button title="Register Doctor" onPress={() => setRole("DOCTOR")} />

      <Button title="Continue" onPress={submit} />

    </View>
  )
}
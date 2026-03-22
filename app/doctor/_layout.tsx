import { Stack } from 'expo-router';
import { useTheme } from '../../src/theme';

export default function DoctorLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen 
        name="profile" 
        options={{ title: 'Provider Profile' }} 
      />
      <Stack.Screen 
        name="documents" 
        options={{ title: 'Secure Documents' }} 
      />
      {/* Pending approval is usually rendered within tabs, but if accessed randomly we map it here */}
      <Stack.Screen 
        name="pending-approval" 
        options={{ title: 'Verification', headerShown: true }} 
      />
    </Stack>
  );
}

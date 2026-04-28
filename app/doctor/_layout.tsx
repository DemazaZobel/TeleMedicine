import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

export default function DoctorLayout() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingHorizontal: theme.spacing.md }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ),
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
      <Stack.Screen 
        name="pending-approval" 
        options={{ title: 'Verification', headerShown: true }} 
      />
    </Stack>
  );
}

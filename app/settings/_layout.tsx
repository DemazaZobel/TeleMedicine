import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

export default function SettingsLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  return (
    <Stack
      screenOptions={{
        headerShown: !isWeb,
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
        name="edit-profile"
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="change-password"
        options={{ title: 'Change Password' }}
      />
    </Stack>
  );
}

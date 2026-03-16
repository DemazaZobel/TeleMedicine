import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // 1. Create a hard state to track if navigation is truly ready
  const [isNavReady, setIsNavReady] = useState(false);

  // 2. Wait for Expo Router's internal state to get a valid key
  useEffect(() => {
    if (navigationState?.key) {
      setIsNavReady(true);
    }
  }, [navigationState?.key]);

  // 3. Handle the actual redirection
  useEffect(() => {
    // If navigation isn't fully ready, absolutely do not route.
    if (!isNavReady) return;

    const inAuthGroup = segments[0] === 'auth';

    // 4. Wrap the redirect in a setTimeout of 0 or 1ms. 
    // This pushes the action to the very end of the Javascript event loop, 
    // GUARANTEEING that the <Stack> is mounted in the UI before it navigates.
    setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/auth/register' as any);
      } else if (user && inAuthGroup) {
        if (user.role === 'DOCTOR' && !user.is_doctor_approved) {
          // router.replace('/doctor/pending' as any); 
        } else {
          // Replace with tabs once we build the tabs folder
          router.replace('/(tabs)' as any);
        }
      }
    }, 1);

  }, [user, segments, isNavReady]);

  // If the navigation isn't ready, you can return null to avoid flashing screens
  if (!isNavReady) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ title: 'Register', headerShown: false }} />
      <Stack.Screen name="auth/otp" options={{ title: 'Verify Email' }} />
      <Stack.Screen name="auth/login" options={{ title: 'Login', headerShown: false }} />
    </Stack>
  );
}
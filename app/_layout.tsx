import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../src/theme';
import { useAuthStore } from '../src/store/authStore';
import { Loader } from '../src/components/ui';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isBootstrapping } = useAuthStore();

  useEffect(() => {
    if (isBootstrapping) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if user is not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if user is authenticated but in auth group
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isBootstrapping, segments]);

  if (isBootstrapping) {
    return <Loader message="Starting MedLink..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthGate>
        <Slot />
      </AuthGate>
    </ThemeProvider>
  );
}

import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';
import React, { useEffect } from 'react';
import { Loader } from '../src/components/ui';
import { useAuthStore } from '../src/store/authStore';
import { ThemeProvider, useTheme } from '../src/theme';

// Prevent the splash screen from auto-hiding (no-op on web)
SplashScreen.preventAutoHideAsync().catch(() => { });

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

import { Platform, StyleSheet, View } from 'react-native';

function WebLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={[styles.webRoot, { backgroundColor: theme.colors.background }]}>
      <View style={[
        styles.webContainer,
        { backgroundColor: theme.colors.background }
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
});

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
      <WebLayoutWrapper>
        <AuthGate>
          <Slot />
        </AuthGate>
      </WebLayoutWrapper>
    </ThemeProvider>
  );
}

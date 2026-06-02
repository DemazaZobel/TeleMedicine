import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import '../global.css';
import { Loader } from '../src/components/ui';
import "../src/i18n";
import { useTranslation } from '../src/i18n';
import { getItemAsync } from '../src/services/storage';
import { useAuthStore } from '../src/store/authStore';
import { ThemeProvider, useTheme } from '../src/theme';

// Prevent the splash screen from auto-hiding (no-op on web)
SplashScreen.preventAutoHideAsync().catch(() => { });

function AuthGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isBootstrapping, user } = useAuthStore();

  useEffect(() => {
    if (isBootstrapping) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inDoctorGroup = segments[0] === '(doctor)';

    if (!isAuthenticated) {
      if (!inPublicGroup && !inAuthGroup) {
        router.replace('/(public)');
      }
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      if (user?.role === 'DOCTOR') {
        router.replace('/(doctor)');
      } else {
        router.replace('/(tabs)');
      }
      return;
    }

    if (isAuthenticated && user?.role === 'DOCTOR' && inTabsGroup) {
      router.replace('/(doctor)');
      return;
    }

    if (isAuthenticated && user?.role === 'PATIENT' && inDoctorGroup) {
      router.replace('/(tabs)');
      return;
    }

  }, [isAuthenticated, isBootstrapping, segments, router, user?.role]);

  if (isBootstrapping) {
    return <Loader message={t("common:startingMedLink")} />;
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
  const { t } = useTranslation();
  const bootstrap = useAuthStore((state) => state.bootstrap);

  const [fontsLoaded, fontError] = useFonts({
    // Add custom fonts here if needed
  });
  const [langLoaded, setLangLoaded] = useState(false);

  useEffect(() => {
    async function initLanguage() {
      try {
        const savedLang = await getItemAsync('preferred_language');
        if (savedLang) {
          const i18nInstance = require('../src/i18n').default;
          await i18nInstance.changeLanguage(savedLang);
        }
      } catch (err) {
        console.warn('Failed to load persisted language:', err);
      } finally {
        setLangLoaded(true);
      }
    }
    
    initLanguage();
    bootstrap();
  }, []);

  useEffect(() => {
    if (fontsLoaded && langLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, langLoaded]);

  if (fontError) {
    console.error('Error loading fonts:', fontError);
  }

  return (
    <ThemeProvider>
      {(!fontsLoaded || !langLoaded) ? (
        <Loader />
      ) : (
        <WebLayoutWrapper>
          <AuthGate>
            <Slot />
          </AuthGate>
        </WebLayoutWrapper>
      )}
    </ThemeProvider>
  );
}

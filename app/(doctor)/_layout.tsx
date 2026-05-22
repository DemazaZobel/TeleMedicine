import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { useTheme } from '../../src/theme';

import {
  MobileWebNav,
  NotificationsDrawer,
  Sidebar,
} from '../../src/components/ui';

import { useBookingStore } from '@/store/booking.store';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';

export default function DoctorLayout() {
  const { theme } = useTheme();
  const router = useRouter();

  const { width } = useWindowDimensions();

  const user = useAuthStore((s) => s.user);

  const verificationStage = useDoctorStore((s) =>
    s.verificationStage()
  );

  const {
    isNotificationsDrawerOpen,
    setIsNotificationsDrawerOpen,
  } = useBookingStore();

  const isWeb = Platform.OS === 'web';
  const isDesktop = width > 768;

  const isPendingDoctor =
    user?.role === 'DOCTOR' &&
    verificationStage !== 'APPROVED';

  const stackElement = (
    <Stack
      screenOptions={{
        headerShown: !isWeb,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleAlign: 'center',

        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: theme.spacing.md,
            }}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="appointments"
        options={{ title: 'Appointments' }}
      />

      <Stack.Screen
        name="availability"
        options={{ title: 'Availability' }}
      />

      <Stack.Screen
        name="notifications"
        options={{ title: 'Notifications' }}
      />

      <Stack.Screen
        name="chat"
        options={{ title: 'Messages' }}
      />

      <Stack.Screen
        name="wallet"
        options={{ title: 'Wallet' }}
      />

      <Stack.Screen
        name="documents"
        options={{ title: 'Secure Documents' }}
      />

      <Stack.Screen
        name="pending-approval"
        options={{
          title: 'Verification',
          headerShown: !isWeb,
        }}
      />
    </Stack>
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        {isWeb ? (
          isDesktop ? (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
              }}
            >
              {user && !isPendingDoctor && (
                <Sidebar
                  onNotificationsPress={() =>
                    setIsNotificationsDrawerOpen(true)
                  }
                />
              )}

              <View style={{ flex: 1 }}>
                {stackElement}
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {!isPendingDoctor && (
                <MobileWebNav
                  onNotificationsPress={() =>
                    setIsNotificationsDrawerOpen(true)
                  }
                />
              )}

              <View style={{ flex: 1 }}>
                {stackElement}
              </View>
            </View>
          )
        ) : (
          stackElement
        )}
      </View>

      <NotificationsDrawer
        visible={isNotificationsDrawerOpen}
        onClose={() =>
          setIsNotificationsDrawerOpen(false)
        }
      />
    </>
  );
}
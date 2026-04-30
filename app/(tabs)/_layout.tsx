import { useBookingStore } from '@/store/booking.store';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { MobileWebNav, NotificationsDrawer, Sidebar } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';
import { useTheme } from '../../src/theme';
import { TAB_CONFIGS } from '../../src/types/navigation';

export default function TabsLayout() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role ?? 'PATIENT';
  const verificationStage = useDoctorStore((s) => s.verificationStage());
  const { isNotificationsDrawerOpen, setIsNotificationsDrawerOpen } = useBookingStore();

  const isDesktop = width > 768;
  const isWeb = Platform.OS === 'web';
  const hideTabBar = isDesktop || isWeb;

  const tabsElement = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: hideTabBar ? { display: 'none' } : {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          borderTopWidth: 1,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontWeight: '600',
        },
      }}
    >
      {TAB_CONFIGS.map((tab) => {
        let isTabVisible = tab.roles.includes(userRole);

        if (userRole === 'DOCTOR' && verificationStage !== 'APPROVED' && tab.name === 'wallet') {
          isTabVisible = false;
        }

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name={tab.icon as keyof typeof Ionicons.glyphMap}
                  size={size}
                  color={color}
                />
              ),
              href: isTabVisible ? undefined : null,
            }}
          />
        );
      })}
    </Tabs>
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        {isWeb ? (
          isDesktop ? (
            <View style={{ flex: 1, flexDirection: 'row' }}>
              {(isDesktop && (userRole !== 'DOCTOR' || verificationStage === 'APPROVED')) && (
                <Sidebar onNotificationsPress={() => setIsNotificationsDrawerOpen(true)} />
              )}
              <View style={{ flex: 1 }}>
                {tabsElement}
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <MobileWebNav onNotificationsPress={() => setIsNotificationsDrawerOpen(true)} />
              <View style={{ flex: 1 }}>
                {tabsElement}
              </View>
            </View>
          )
        ) : (
          tabsElement
        )}
      </View>
      <NotificationsDrawer
        visible={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
      />
    </>
  );
}

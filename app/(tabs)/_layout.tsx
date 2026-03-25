import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';
import { TAB_CONFIGS } from '../../src/types/navigation';

export default function TabsLayout() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role ?? 'PATIENT';
  const verificationStage = useDoctorStore((s) => s.verificationStage());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
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
        // If it's a doctor and they aren't approved yet, we still show the tab but intercept the UI inside the screen
        // unless it's a sensitive tab like wallet that should be completely hidden
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
}

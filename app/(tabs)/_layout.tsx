import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { TAB_CONFIGS } from '../../src/types/navigation';

export default function TabsLayout() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role ?? 'PATIENT';

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
      {TAB_CONFIGS.map((tab) => (
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
            // Hide tabs that the user's role doesn't have access to
            href: tab.roles.includes(userRole) ? undefined : null,
          }}
        />
      ))}
    </Tabs>
  );
}

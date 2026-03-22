import React, { useMemo } from 'react';
import { View, ScrollView, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { createScreenContainerStyles } from './ScreenContainer.styles';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  centered?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  safeArea?: boolean;
}

export const ScreenContainer = React.memo(function ScreenContainer({
  children,
  scrollable = false,
  centered = false,
  padded = true,
  style,
  safeArea = true,
}: ScreenContainerProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createScreenContainerStyles(theme), [theme]);

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        centered && styles.centered,
        !padded && { paddingHorizontal: 0 },
        style,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.container,
        padded && styles.padded,
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {safeArea ? (
        <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>
      ) : (
        content
      )}
    </>
  );
});

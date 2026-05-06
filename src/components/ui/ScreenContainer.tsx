import React, { useMemo } from 'react';
import { View, ScrollView, ViewStyle, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      {safeArea ? (
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1, width: '100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {content}
          </KeyboardAvoidingView>
        </SafeAreaView>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {content}
        </KeyboardAvoidingView>
      )}
    </>
  );
});

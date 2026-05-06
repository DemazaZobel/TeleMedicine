import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import type { Theme } from '../../theme';

interface AuthContainerProps {
  children: React.ReactNode;
  illustration?: any; // kept for backward compat but no longer rendered
  darkIllustration?: any;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const AuthContainer = React.memo(function AuthContainer({
  children,
  showBackButton = false,
  onBack,
}: AuthContainerProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);
  const insets = useSafeAreaInsets();

  const isDesktop = width > 768;

  // Background pattern using decorative corner nodes
  const renderDecorativeNodes = () => {
    if (Platform.OS !== 'web') return null;
    const nodeColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const lineColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Corner decorative rectangles */}
        <View style={[styles.cornerNode, { top: 60, left: 100, backgroundColor: nodeColor, borderColor: lineColor }]} />
        <View style={[styles.cornerNode, { top: 60, right: 100, backgroundColor: nodeColor, borderColor: lineColor }]} />
        <View style={[styles.cornerNode, { bottom: 60, left: 100, backgroundColor: nodeColor, borderColor: lineColor }]} />
        <View style={[styles.cornerNode, { bottom: 60, right: 100, backgroundColor: nodeColor, borderColor: lineColor }]} />
        {/* Subtle grid lines */}
        <View style={[styles.gridLine, { top: '20%', left: 0, right: 0, height: 1, backgroundColor: lineColor }]} />
        <View style={[styles.gridLine, { top: '80%', left: 0, right: 0, height: 1, backgroundColor: lineColor }]} />
        <View style={[styles.gridLine, { left: '20%', top: 0, bottom: 0, width: 1, backgroundColor: lineColor }]} />
        <View style={[styles.gridLine, { right: '20%', top: 0, bottom: 0, width: 1, backgroundColor: lineColor }]} />
      </View>
    );
  };

  const themeToggle = (
    <TouchableOpacity
      style={[
        styles.themeToggle,
        { top: isDesktop ? 24 : insets.top + 12 },
      ]}
      onPress={toggleTheme}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  const backButton = showBackButton ? (
    <TouchableOpacity
      style={[
        styles.backBtn,
        { top: isDesktop ? 24 : insets.top + 12 },
      ]}
      onPress={onBack}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="arrow-back" size={22} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  ) : null;

  if (isDesktop) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent />
        <View style={styles.outerContainer}>
          {renderDecorativeNodes()}
          {themeToggle}
          {backButton}
          <View style={styles.desktopCard}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </>
    );
  }

  // Mobile layout
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent />
      <View style={styles.outerContainer}>
        {themeToggle}
        {backButton}
        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.mobileScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            <View style={styles.mobileCard}>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
});

const createStyles = (theme: Theme, windowWidth: number, windowHeight: number) => {
  const isDesktop = windowWidth > 768;
  const bgColor = theme.dark ? '#0D1117' : '#F0F2F5';

  return StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor: bgColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Desktop card
    desktopCard: {
      width: '100%',
      maxWidth: 460,
      maxHeight: windowHeight - 80,
      backgroundColor: theme.dark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.97)',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      overflow: 'hidden',
      ...Platform.select({
        web: {
          boxShadow: theme.dark
            ? '0 24px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.05)'
            : '0 24px 80px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)',
        },
        default: {
          elevation: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3,
          shadowRadius: 24,
        },
      }),
    },
    scrollContent: {
      paddingHorizontal: 40,
      paddingVertical: 44,
    },
    // Mobile
    mobileScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 60,
    },
    mobileCard: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      backgroundColor: theme.dark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.97)',
      borderRadius: 24,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      ...Platform.select({
        web: {
          boxShadow: theme.dark
            ? '0 16px 48px rgba(0,0,0,0.4)'
            : '0 16px 48px rgba(0,0,0,0.08)',
        },
        default: {
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
      }),
    },
    // Theme toggle
    themeToggle: {
      position: 'absolute',
      right: isDesktop ? 32 : 20,
      zIndex: 100,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Back button
    backBtn: {
      position: 'absolute',
      left: isDesktop ? 32 : 20,
      zIndex: 100,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Decorative elements
    cornerNode: {
      position: 'absolute',
      width: 80,
      height: 32,
      borderRadius: 6,
      borderWidth: 1,
    },
    gridLine: {
      position: 'absolute',
    },
  });
};

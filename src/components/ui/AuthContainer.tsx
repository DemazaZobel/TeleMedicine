import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Theme } from '../../theme';
import { useTheme } from '../../theme';

interface AuthContainerProps {
  children: React.ReactNode;
  illustration?: any;
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

  const renderDecorativeNodes = () => {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.glowBlob, styles.glowBlobTopRight]} />
        <View style={[styles.glowBlob, styles.glowBlobBottomLeft]} />

        {Platform.OS === 'web' && (
          <>
            <View style={[styles.gridLine, { top: '20%', left: 0, right: 0, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]} />
            <View style={[styles.gridLine, { top: '80%', left: 0, right: 0, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]} />
            <View style={[styles.gridLine, { left: '20%', top: 0, bottom: 0, width: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]} />
            <View style={[styles.gridLine, { right: '20%', top: 0, bottom: 0, width: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]} />
          </>
        )}
      </View>
    );
  };

  const themeToggle = (
    <TouchableOpacity
      style={[styles.themeToggle, { top: isDesktop ? 24 : insets.top + 12 }]}
      onPress={toggleTheme}
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
      style={[styles.backBtn, { top: isDesktop ? 24 : insets.top + 12 }]}
      onPress={onBack}
    >
      <Ionicons name="arrow-back" size={22} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  ) : null;

  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
    <ImageBackground
      source={require('../../../assets/images/auth-bg.jpeg')} 
      style={styles.outerContainer}
      resizeMode="cover"
    >
      {/* overlay for readability */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: isDark
            ? 'rgba(0,0,0,0.55)'
            : 'rgba(255,255,255,0.35)',
        }}
      />
      {children}
    </ImageBackground>
  );

  if (isDesktop) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} translucent />
        <BackgroundWrapper>
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
        </BackgroundWrapper>
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      <BackgroundWrapper>
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
          >
            <View style={styles.mobileCard}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BackgroundWrapper>
    </>
  );
});

const createStyles = (theme: Theme, windowWidth: number, windowHeight: number) => {
  const isDesktop = windowWidth > 768;
  const bgColor = theme.dark ? '#0a0d14' : '#F4FCF7';

  return StyleSheet.create({
    outerContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: bgColor,
      justifyContent: 'center',
      alignItems: 'center',
    },

    desktopCard: {
      width: '100%',
      maxWidth: 680,           // ← wider (was 460)
      maxHeight: windowHeight - 80,
      backgroundColor: theme.dark
        ? 'rgba(20, 24, 32, 0.9)'
        : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 32,
      borderWidth: 1,
      borderColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      overflow: 'hidden',
      transform: [{ translateX: 300 }],   // ← moves card left
      ...Platform.select({
        web: {
          boxShadow: theme.dark
            ? '0 32px 80px rgba(0,0,0,0.6)'
            : '0 32px 80px rgba(0,100,80,0.08)',
          backdropFilter: 'blur(30px)',
        },
        default: {
          elevation: 24,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: theme.dark ? 0.2 : 0.08,
          shadowRadius: 32,
        },
      }),
    },

    scrollContent: {
      paddingHorizontal: 40,
      paddingVertical: 44,
    },

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
      backgroundColor: theme.dark
        ? 'rgba(20, 24, 32, 0.9)'
        : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 32,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      ...Platform.select({
        web: {
          boxShadow: theme.dark
            ? '0 16px 48px rgba(0,0,0,0.4)'
            : '0 16px 48px rgba(0,100,80,0.06)',
          backdropFilter: 'blur(20px)',
        },
        default: {
          elevation: 12,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: theme.dark ? 0.2 : 0.08,
          shadowRadius: 24,
        },
      }),
    },

    themeToggle: {
      position: 'absolute',
      right: isDesktop ? 32 : 20,
      zIndex: 100,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.dark
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.04)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    backBtn: {
      position: 'absolute',
      left: isDesktop ? 32 : 20,
      zIndex: 100,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.dark
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.04)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    glowBlob: {
      position: 'absolute',
      width: windowWidth * 0.8,
      height: windowWidth * 0.8,
      borderRadius: windowWidth * 0.4,
      opacity: theme.dark ? 0.15 : 0.08,
      filter: 'blur(80px)' as any,
    },

    glowBlobTopRight: {
      top: -windowHeight * 0.2,
      right: -windowWidth * 0.2,
      backgroundColor: theme.colors.primary,
    },

    glowBlobBottomLeft: {
      bottom: -windowHeight * 0.2,
      left: -windowWidth * 0.2,
      backgroundColor: theme.colors.secondary || '#34d399',
    },

    gridLine: {
      position: 'absolute',
    },
  });
};
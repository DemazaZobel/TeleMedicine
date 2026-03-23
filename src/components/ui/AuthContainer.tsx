import React, { useMemo } from 'react';
import { View, ScrollView, Image, KeyboardAvoidingView, Platform, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { createAuthContainerStyles } from './AuthContainer.styles';

interface AuthContainerProps {
  children: React.ReactNode;
  illustration: ImageSourcePropType;
  darkIllustration?: ImageSourcePropType;
  showBackButton?: boolean;
}

export const AuthContainer = React.memo(function AuthContainer({
  children,
  illustration,
  darkIllustration,
  showBackButton = false,
}: AuthContainerProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createAuthContainerStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // In dark mode the illustration area uses a muted dark tone instead of white
  const illustrationBg = isDark ? '#1A2332' : '#EFF4F8';
  const statusBarStyle = isDark ? 'light' : 'dark';
  const backIconColor = isDark ? '#FFFFFF' : '#000000';
  const backRingBg = isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)';
  
  const currentIllustration = isDark && darkIllustration ? darkIllustration : illustration;

  return (
    <>
      <StatusBar style={statusBarStyle} backgroundColor="transparent" translucent />
      <View style={[styles.container, { backgroundColor: illustrationBg }]}>
        
        {/* Top Illustration Area */}
        <View style={[styles.illustrationContainer, { backgroundColor: illustrationBg }]}>
          <Image 
            source={currentIllustration} 
            style={styles.illustration} 
            resizeMode="contain"
          />
        </View>

        {showBackButton && (
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + theme.spacing.md }]} 
            onPress={() => router.canGoBack() && router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View style={[styles.backButtonRing, { backgroundColor: backRingBg }]}>
              <Ionicons name="arrow-back" size={24} color={backIconColor} />
            </View>
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            {/* Spacer pushes the card down over the illustration */}
            <View style={styles.spacer} /> 
            
            <View style={styles.card}>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
});

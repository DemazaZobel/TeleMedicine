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
  showBackButton?: boolean;
}

export const AuthContainer = React.memo(function AuthContainer({
  children,
  illustration,
  showBackButton = false,
}: AuthContainerProps) {
  const { theme, isDark } = useTheme();
  // Using light explicitly for the status bar if the top is white, otherwise match theme
  const styles = useMemo(() => createAuthContainerStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      {/* 
        We force a white background on the root container so the generated white-background 
        illustrations blend perfectly, regardless of dark/light mode for the top half.
      */}
      <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        
        {/* Top Illustration Area */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={illustration} 
            style={styles.illustration} 
            resizeMode="cover" 
          />
        </View>

        {showBackButton && (
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + theme.spacing.md }]} 
            onPress={() => router.canGoBack() && router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View style={styles.backButtonRing}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </View>
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Invisible spacer to push the card down over the illustration */}
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

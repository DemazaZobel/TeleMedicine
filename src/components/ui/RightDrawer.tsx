import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface RightDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function RightDrawer({ visible, onClose, title, subtitle, children }: RightDrawerProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const isWeb = Platform.OS === 'web';
  const isDesktop = width > 768;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          {/* Backdrop */}
          <Pressable style={styles.backdrop} onPress={onClose} />
          
          {/* Drawer Content */}
          <View 
            style={[
              styles.contentContainer, 
              { backgroundColor: theme.colors.background },
              isDesktop ? styles.contentDesktop : styles.contentMobile,
              !isDesktop && { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) },
              { paddingTop: Math.max(insets.top, theme.spacing.lg) }
            ]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                {subtitle && (
                  <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    {subtitle}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.body}>
              {children}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  contentDesktop: {
    width: 400,
  },
  contentMobile: {
    width: '100%', // Full screen on mobile
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
});

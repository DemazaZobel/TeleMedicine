import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface ModalBaseProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: number;
  children: ReactNode;
}

export function ModalBase({ visible, onClose, title, subtitle, maxWidth, children }: ModalBaseProps) {
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
          
          {/* Modal Content */}
          <View 
            style={[
              styles.contentContainer, 
              { backgroundColor: theme.colors.background },
              isDesktop && styles.contentContainerDesktop,
              isDesktop && maxWidth ? { width: maxWidth } : undefined,
              !isDesktop && { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }
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
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
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
    justifyContent: 'flex-end', // Bottom sheet on mobile
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  contentContainerDesktop: {
    width: 500,
    maxHeight: '85%',
    alignSelf: 'center',
    marginBottom: 'auto', // Center vertically
    marginTop: 'auto',
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 24,
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
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    padding: 24,
  },
});

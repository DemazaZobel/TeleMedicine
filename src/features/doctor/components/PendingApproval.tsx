import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui';
import { useDoctorStore } from '../../../store/doctor.store';
import { useAuthStore } from '../../../store/authStore';
import { useTheme, Theme } from '../../../theme';
import { DoctorProfileModal } from './DoctorProfileModal';
import { DoctorDocumentsModal } from './DoctorDocumentsModal';

export function PendingApproval() {
  const { theme } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { verificationStage, fetchProfile, fetchDocuments } = useDoctorStore();
  const stage = verificationStage();

  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isDocsModalVisible, setDocsModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, [fetchProfile, fetchDocuments]);

  const content = useMemo(() => {
    switch (stage) {
      case 'NEW_DOCTOR':
        return {
          icon: 'person-circle-outline' as const,
          iconColor: theme.colors.primary,
          title: 'Provider Onboarding',
          subtitle: 'Welcome to MedLink. Please configure your professional profile to begin accepting patient appointments.',
          actionComponent: (
            <Button
              title="Configure Profile"
              onPress={() => setProfileModalVisible(true)}
              fullWidth
              style={styles.primaryActionBtn}
            />
          ),
        };
      case 'PROFILE_FILLED':
        return {
          icon: 'shield-checkmark-outline' as const,
          iconColor: '#13C2C2',
          title: 'Identity Verification',
          subtitle: 'Your profile details are securely saved. For regulatory compliance, please upload your medical credentials.',
          actionComponent: (
            <View style={{ gap: 12 }}>
              <Button
                title="Upload Secure Documents"
                onPress={() => setDocsModalVisible(true)}
                fullWidth
                style={styles.primaryActionBtn}
              />
              <Button
                title="Review Profile"
                variant="outline"
                onPress={() => setProfileModalVisible(true)}
                fullWidth
              />
            </View>
          ),
        };
      case 'DOCUMENT_UPLOADED':
      case 'PENDING_REVIEW':
      default:
        return {
          icon: 'hourglass-outline' as const,
          iconColor: '#FAAD14',
          title: 'Verification Pending',
          subtitle: 'Your credentials have been safely transmitted and are currently undergoing review. We will notify you once your account is active.',
          actionComponent: (
            <View style={{ gap: 12 }}>
              <Button
                title="Manage Documents"
                variant="outline"
                onPress={() => setDocsModalVisible(true)}
                fullWidth
              />
              <Button
                title="Review Profile"
                variant="ghost"
                onPress={() => setProfileModalVisible(true)}
                fullWidth
              />
            </View>
          ),
        };
    }
  }, [stage]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.logoContainer}>
        <Ionicons name="medical" size={32} color={theme.colors.primary} />
        <Text style={styles.logoText}>MedLink</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconWrapper, { backgroundColor: content.iconColor + '15' }]}>
          <Ionicons name={content.icon} size={48} color={content.iconColor} />
        </View>
        
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
        
        <View style={styles.divider} />

        <View style={styles.actions}>
          {content.actionComponent}
        </View>

        <Button
          title="Log Out Securely"
          variant="ghost"
          onPress={logout}
          style={styles.logoutBtn}
          textStyle={{ color: theme.colors.textTertiary, fontWeight: '500' }}
        />
      </View>

      <DoctorProfileModal 
        visible={isProfileModalVisible} 
        onClose={() => setProfileModalVisible(false)} 
      />
      <DoctorDocumentsModal 
        visible={isDocsModalVisible} 
        onClose={() => setDocsModalVisible(false)} 
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      gap: 8,
    },
    logoText: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    card: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border + '50',
      ...Platform.select({
        web: {
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        },
        default: {
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.06,
          shadowRadius: 24,
        }
      })
    },
    iconWrapper: {
      width: 88,
      height: 88,
      borderRadius: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 22,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.5,
      marginBottom: 24,
    },
    actions: {
      width: '100%',
      marginBottom: 16,
    },
    primaryActionBtn: {
      paddingVertical: 12,
      borderRadius: 12,
    },
    logoutBtn: {
      marginTop: 8,
    }
  });

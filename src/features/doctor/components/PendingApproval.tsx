import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
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
          title: 'Provider Onboarding',
          subtitle: 'Welcome to MedLink. Please complete your professional profile before accepting patient appointments.',
          actionComponent: (
            <Button
              title="Configure Profile"
              onPress={() => setProfileModalVisible(true)}
              fullWidth
            />
          ),
        };
      case 'PROFILE_FILLED':
        return {
          title: 'Identity Verification',
          subtitle: 'Your profile details are saved. For regulatory compliance, please upload your medical credentials.',
          actionComponent: (
            <View style={{ gap: 12 }}>
              <Button
                title="Upload Secure Documents"
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
      case 'DOCUMENT_UPLOADED':
      case 'PENDING_REVIEW':
      default:
        return {
          title: 'Verification Pending',
          subtitle: 'Your credentials have been transmitted and are undergoing review. We will notify you once active.',
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
      <View style={styles.card}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
        
        <View style={styles.actions}>
          {content.actionComponent}
        </View>

        <Button
          title="Log Out"
          variant="ghost"
          onPress={logout}
          style={styles.logoutBtn}
          textStyle={{ color: theme.colors.textTertiary }}
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
    card: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: theme.spacing['2xl'],
      alignItems: 'center',
      // Subtle shadow for premium feel
      ...Platform.select({
        web: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
        default: {
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        }
      })
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      fontWeight: '800',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.spacing['2xl'],
    },
    actions: {
      width: '100%',
      marginBottom: theme.spacing.xl,
    },
    logoutBtn: {
      marginTop: theme.spacing.md,
    }
  });

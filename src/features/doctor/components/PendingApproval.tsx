import React, { useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { createPendingApprovalStyles } from '../styles/pendingApproval.styles';
import { useAuthStore } from '../../../store/authStore';
import { useDoctorStore } from '../../../store/doctor.store';

export function PendingApproval() {
  const { theme } = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();
  const styles = useMemo(() => createPendingApprovalStyles(theme), [theme]);
  
  // Read stage and ensure profile is fetched
  const { verificationStage, fetchProfile, fetchDocuments } = useDoctorStore();
  const stage = verificationStage();

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, [fetchProfile, fetchDocuments]);

  // Dynamic Content Mappings
  const content = useMemo(() => {
    switch (stage) {
      case 'NEW_DOCTOR':
        return {
          icon: '👋',
          title: 'Welcome to MedLink',
          subtitle: 'Please complete your professional profile to begin accepting patients.',
          steps: '1. Complete your profile details\n2. Upload all required credentials\n3. Await admin verification email',
          actions: (
            <Button
              title="Complete Profile"
              variant="primary"
              onPress={() => router.push('/doctor/profile')}
              fullWidth
            />
          ),
        };
      case 'PROFILE_FILLED':
        return {
          icon: '📄',
          title: 'Profile Saved',
          subtitle: 'Now, please upload your medical credentials (license, certifications) for verification.',
          steps: '1. ✅ Complete your profile details\n2. Upload all required credentials\n3. Await admin verification email',
          actions: (
            <View style={{ width: '100%', gap: 12 }}>
              <Button
                title="Upload Documents"
                variant="primary"
                onPress={() => router.push('/doctor/documents')}
                fullWidth
              />
              <Button
                title="Edit Profile"
                variant="outline"
                onPress={() => router.push('/doctor/profile')}
                fullWidth
              />
            </View>
          ),
        };
      case 'DOCUMENT_UPLOADED':
      case 'PENDING_REVIEW':
      default:
        return {
          icon: '⏳',
          title: 'Account Under Review',
          subtitle: 'Your doctor profile and documents are currently being reviewed by our admin team.',
          steps: '1. ✅ Complete your profile details\n2. ✅ Upload all required credentials\n3. ⏳ Await admin verification email',
          actions: (
            <View style={{ width: '100%', gap: 12 }}>
              <Button
                title="Manage Documents"
                variant="primary"
                onPress={() => router.push('/doctor/documents')}
                fullWidth
              />
              <Button
                title="Edit Profile"
                variant="outline"
                onPress={() => router.push('/doctor/profile')}
                fullWidth
              />
            </View>
          ),
        };
    }
  }, [stage, router]);

  return (
    <ScreenContainer scrollable centered>
      <View style={styles.container}>
        <Text style={styles.icon}>{content.icon}</Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Verification Status</Text>
          <Text style={styles.statusText}>{content.steps}</Text>
        </View>

        <View style={[styles.actionRow, { flexDirection: 'column', width: '100%' }]}>
          {content.actions}
        </View>

        <Button
          title="Sign Out"
          variant="ghost"
          onPress={logout}
          style={{ marginTop: theme.spacing['4xl'] }}
        />
      </View>
    </ScreenContainer>
  );
}

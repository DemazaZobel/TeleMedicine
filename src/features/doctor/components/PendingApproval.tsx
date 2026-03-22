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

  // Dynamic Content Mappings using premium verbiage
  const content = useMemo(() => {
    switch (stage) {
      case 'NEW_DOCTOR':
        return {
          title: 'Provider Onboarding',
          subtitle: 'Welcome to MedLink. To ensure the highest quality of healthcare, all providers must complete a verified professional profile before accepting patient appointments.',
          actionComponent: (
            <Button
              title="Configure Profile"
              variant="primary"
              onPress={() => router.push('/doctor/profile')}
              fullWidth
            />
          ),
        };
      case 'PROFILE_FILLED':
        return {
          title: 'Identity Verification',
          subtitle: 'Your profile details have been securely saved. For regulatory compliance, please upload your official medical credentials for admin review.',
          actionComponent: (
            <>
              <Button
                title="Upload Secure Documents"
                variant="primary"
                onPress={() => router.push('/doctor/documents')}
                fullWidth
              />
              <Button
                title="Review Profile"
                variant="ghost"
                onPress={() => router.push('/doctor/profile')}
                fullWidth
              />
            </>
          ),
        };
      case 'DOCUMENT_UPLOADED':
      case 'PENDING_REVIEW':
      default:
        return {
          title: 'Verification Pending',
          subtitle: 'Your credentials have been securely transmitted and are currently undergoing administrative review. We will notify you once your provider account is fully active.',
          actionComponent: (
            <>
              <Button
                title="Manage Documents"
                variant="outline"
                onPress={() => router.push('/doctor/documents')}
                fullWidth
              />
              <Button
                title="Review Profile"
                variant="ghost"
                onPress={() => router.push('/doctor/profile')}
                fullWidth
              />
            </>
          ),
        };
    }
  }, [stage, router]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          <View style={styles.actionContainer}>
            {content.actionComponent}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

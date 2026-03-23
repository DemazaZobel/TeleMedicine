import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Button, AuthContainer } from '../../../components/ui';
import { useDoctorStore } from '../../../store/doctor.store';
import { useTheme } from '../../../theme';
import { createPendingApprovalStyles } from '../styles/pendingApproval.styles';

export function PendingApproval() {
  const { theme } = useTheme();
  const router = useRouter();
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
    <AuthContainer
      illustration={require('../../../../assets/images/verification-illustration.png')}
      showBackButton={false}
    >
      <View style={styles.container}>
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text, marginBottom: 8 }}>
            {content.title}
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, lineHeight: 24 }}>
            {content.subtitle}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {content.actionComponent}
        </View>
      </View>
    </AuthContainer>
  );
}

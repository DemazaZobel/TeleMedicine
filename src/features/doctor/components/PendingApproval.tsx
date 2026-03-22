import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { createPendingApprovalStyles } from '../styles/pendingApproval.styles';
import { useAuthStore } from '../../../store/authStore';

export function PendingApproval() {
  const { theme } = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();
  const styles = useMemo(() => createPendingApprovalStyles(theme), [theme]);

  return (
    <ScreenContainer scrollable centered>
      <View style={styles.container}>
        <Text style={styles.icon}>⏳</Text>
        <Text style={styles.title}>Account Under Review</Text>
        <Text style={styles.subtitle}>
          Your doctor profile is currently being reviewed by our admin team.
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Next Steps</Text>
          <Text style={styles.statusText}>
            1. Complete your profile details{'\n'}
            2. Upload all required credentials{'\n'}
            3. Await admin verification email
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Button
            title="Upload Docs"
            variant="primary"
            onPress={() => router.push('/doctor/documents')}
            style={styles.button}
          />
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => router.push('/doctor/profile')}
            style={styles.button}
          />
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

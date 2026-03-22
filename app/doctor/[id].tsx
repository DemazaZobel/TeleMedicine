import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Card, Button } from '../../src/components/ui';
import { useTheme, Theme } from '../../src/theme';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScreenContainer scrollable>
      <Button
        title="← Back"
        variant="ghost"
        size="sm"
        onPress={() => router.back()}
        style={styles.backButton}
      />

      <Card style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>👨‍⚕️</Text>
        </View>
        <Text style={styles.name}>Doctor Profile</Text>
        <Text style={styles.id}>ID: {id}</Text>
      </Card>

      <Button
        title="Book Appointment"
        onPress={() => {}}
        fullWidth
        style={styles.bookButton}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backButton: {
      alignSelf: 'flex-start',
      marginTop: theme.spacing.lg,
    },
    profileCard: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    avatarText: {
      fontSize: 40,
    },
    name: {
      ...theme.typography.h3,
      color: theme.colors.text,
    },
    id: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    bookButton: {
      marginTop: theme.spacing['2xl'],
    },
  });

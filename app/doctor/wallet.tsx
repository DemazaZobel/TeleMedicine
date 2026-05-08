import React, { useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { ScreenContainer, Card, EmptyState } from '../../src/components/ui';
import { useBookingStore } from '../../src/store/booking.store';
import { useTheme, Theme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { wallet, fetchWallet, isLoading } = useBookingStore();

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = () => {
    fetchWallet();
  };

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {wallet?.total_earned ? `${wallet.total_earned} ETB` : '0.00 ETB'}
          </Text>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
            <Text style={styles.badgeText}>Ready for withdrawal</Text>
          </View>
        </Card>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <EmptyState 
            icon="receipt-outline" 
            title="No recent transactions" 
            description="Completed appointment payments will appear here." 
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  header: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  balanceLabel: {
    ...theme.typography.body,
    color: '#E0E7FF',
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    ...theme.typography.h1,
    color: '#FFF',
    marginBottom: theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgeText: {
    ...theme.typography.caption,
    color: '#FFF',
    fontWeight: '600',
  },
  infoSection: {
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, EmptyState } from '../src/components/ui';
import { useBookingStore } from '../src/store/booking.store';
import { useTheme, Theme } from '../src/theme';
import { formatRelativeTime } from '../src/utils';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { notifications, isLoading, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useBookingStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePress = async (notification: any) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
    // Logic to navigate based on notification type could be added here
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsRead();
  };

  const sections = useMemo(() => {
    const unread = notifications.filter(n => !n.is_read);
    const read = notifications.filter(n => n.is_read);
    
    const result = [];
    if (unread.length > 0) {
      result.push({ title: 'New', data: unread });
    }
    if (read.length > 0) {
      result.push({ title: 'Earlier', data: read });
    }
    return result;
  }, [notifications]);

  const hasUnread = notifications.some(n => !n.is_read);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]} 
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer, 
        item.type === 'APPOINTMENT' ? styles.iconAppt : styles.iconSystem
      ]}>
        <Ionicons 
          name={item.type === 'APPOINTMENT' ? 'calendar' : 'notifications'} 
          size={22} 
          color={item.type === 'APPOINTMENT' ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.time}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
        <Text style={styles.body}>{item.body}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer padded={false}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnread ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      <View style={styles.pageWrapper}>
        {isLoading && notifications.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <EmptyState 
                  icon="notifications-off-outline" 
                  title="No Notifications" 
                  description="You're all caught up! New alerts will appear here." 
                />
              </View>
            }
            contentContainerStyle={styles.listContent}
            refreshing={isLoading}
            onRefresh={fetchNotifications}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.text,
  },
  pageWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  emptyContainer: {
    marginTop: theme.spacing['4xl'],
  },
  sectionHeader: {
    ...theme.typography.h4,
    fontWeight: '700',
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadCard: {
    backgroundColor: theme.colors.primaryLight + '15',
    borderColor: theme.colors.primaryLight + '30',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconAppt: {
    backgroundColor: theme.colors.primaryLight + '30',
  },
  iconSystem: {
    backgroundColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
  },
  body: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    alignSelf: 'center',
  },
});

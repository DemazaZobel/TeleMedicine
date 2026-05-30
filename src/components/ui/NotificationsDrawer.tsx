import React, { useEffect, useMemo } from 'react';
import { useTranslation } from '../../i18n';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from './EmptyState';
import { RightDrawer } from './RightDrawer';
import { useBookingStore } from '../../store/booking.store';
import { Theme, useTheme } from '../../theme';
import { formatRelativeTime, humanizeNotificationBody } from '../../utils';

interface NotificationsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ visible, onClose }: NotificationsDrawerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { notifications, isLoading, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useBookingStore();

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const handlePress = async (notification: any) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
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
        item.type === 'APPOINTMENT' ? styles.iconAppt :
        item.type === 'PAYMENT' ? styles.iconPayment :
        styles.iconSystem
      ]}>
        <Ionicons
          name={
            item.type === 'APPOINTMENT' ? 'calendar' :
            item.type === 'PAYMENT' ? 'card' :
            'notifications'
          }
          size={22}
          color={
            item.type === 'APPOINTMENT' ? theme.colors.primary :
            item.type === 'PAYMENT' ? theme.colors.success :
            theme.colors.textSecondary
          }
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.time}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
        <Text style={styles.body}>{humanizeNotificationBody(item.body)}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <RightDrawer
      visible={visible}
      onClose={onClose}
      title="Notifications"
    >
      <View style={styles.pageWrapper}>
        <View style={styles.actionsRow}>
           {hasUnread && (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
              <Ionicons name="checkmark-done" size={20} color={theme.colors.primary} />
              <Text style={[styles.markAllText, { color: theme.colors.primary }]}>{t("common:markAllAsRead")}</Text>
            </TouchableOpacity>
          )}
        </View>

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
                  title={t("common:noNotifications")}
                  description={t("common:allCaughtUp")}
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
    </RightDrawer>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  pageWrapper: {
    flex: 1,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  markAllText: {
    ...theme.typography.buttonSm,
    marginLeft: 6,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
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
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  iconPayment: {
    backgroundColor: theme.colors.success + '25',
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
    fontSize: 15,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    alignSelf: 'center',
  },
});

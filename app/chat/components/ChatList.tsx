import { formatTime } from '@/utils/index';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ListRenderItemInfo } from 'react-native';
import type { ChatRoom } from '../../types/chat';
import { useTheme } from '../../theme/useTheme';

interface Props {
  rooms: ChatRoom[];
  onRoomPress: (room: ChatRoom) => void;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=10B981&color=fff&size=100&name=';

const ChatList: React.FC<Props> = ({ rooms, onRoomPress }) => {
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const renderItem = ({ item }: ListRenderItemInfo<ChatRoom>) => (
    <TouchableOpacity
      style={[styles.room, { backgroundColor: theme.colors.background }]}
      onPress={() => onRoomPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: item.participantAvatar
            ? item.participantAvatar
            : `${DEFAULT_AVATAR}${encodeURIComponent(item.participantName)}`,
        }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{item.participantName}</Text>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
    />
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme'], isDark: boolean) => StyleSheet.create({
  list: { paddingVertical: 8 },
  room: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, backgroundColor: theme.colors.border },
  info: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', flex: 1, marginRight: 8 },
  time: { fontSize: 13, color: '#8E8E93' },
  lastMessage: { fontSize: 14, color: '#8E8E93', flex: 1, marginRight: 8 },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: 80 },
});

export default ChatList;
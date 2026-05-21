import { formatTime } from '@/utils/index';
import React from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ChatRoom } from '../../types/chat';

interface Props {
  rooms: ChatRoom[];
  onRoomPress: (room: ChatRoom) => void;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=007AFF&color=fff&size=100&name=';

const ChatList: React.FC<Props> = ({ rooms, onRoomPress }) => {
  const renderItem = ({ item }: ListRenderItemInfo<ChatRoom>) => (
    <TouchableOpacity
      style={styles.room}
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
          <Text style={styles.name} numberOfLines={1}>{item.participantName}</Text>
          <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
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
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  room: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, backgroundColor: '#E5E5EA' },
  info: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', flex: 1, marginRight: 8 },
  time: { fontSize: 13, color: '#8E8E93' },
  lastMessage: { fontSize: 14, color: '#8E8E93', flex: 1, marginRight: 8 },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#F2F2F7', marginLeft: 80 },
});

export default ChatList;
// src/components/chat/ChatList.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { ChatRoom } from '../../types/chat';

interface Props {
  rooms: ChatRoom[];
  onRoomPress: (room: ChatRoom) => void;
}

const ChatList: React.FC<Props> = ({ rooms, onRoomPress }) => {
  const renderItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity style={styles.room} onPress={() => onRoomPress(item)}>
      <Image source={{ uri: item.participantAvatar }} style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.participantName}</Text>
          <Text style={styles.time}>{item.lastMessageTime}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 16 },
  room: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  info: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  time: { fontSize: 13, color: '#8E8E93' },
  lastMessage: { fontSize: 15, color: '#3C3C43', marginTop: 2 },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
});

export default ChatList;
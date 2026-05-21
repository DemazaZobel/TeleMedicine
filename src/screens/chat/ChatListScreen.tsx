import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, SafeAreaView, ActivityIndicator,
  StyleSheet, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import ChatList from '../../components/chat/ChatList';
import { getChatRooms } from '../../services/chatService';
import type { ChatRoom } from '../../types/chat';

const ChatListScreen: React.FC = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setError(null);
      const data = await getChatRooms();
      setRooms(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load conversations');
      console.error('ChatListScreen error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  // ✅ Updated: matches the /chat/[id].tsx route
  const handleRoomPress = (room: ChatRoom) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: room.id, roomName: room.participantName },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorHint}>Pull down to retry</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Messages</Text>
        {rooms.length > 0 && (
          <Text style={styles.subtitle}>{rooms.length} conversations</Text>
        )}
      </View>
      {rooms.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.empty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptyHint}>Your chats with doctors will appear here</Text>
        </ScrollView>
      ) : (
        <ChatList
          rooms={rooms}
          onRoomPress={handleRoomPress}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1C1C1E' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  errorText: { fontSize: 16, color: '#FF3B30', textAlign: 'center', marginBottom: 8 },
  errorHint: { fontSize: 14, color: '#8E8E93' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  emptyHint: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },
});

export default ChatListScreen;
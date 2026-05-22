import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ActivityIndicator,
  StyleSheet, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, PageHeader, EmptyState } from '../../components/ui';
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
      <ScreenContainer centered>
        <ActivityIndicator size="large" color="#007AFF" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer scrollable>
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorHint}>Pull down to retry</Text>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} constrained>
      <PageHeader 
        title="Messages" 
        subtitle={rooms.length > 0 ? `${rooms.length} conversations` : undefined} 
      />
      {rooms.length === 0 ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No conversations yet"
            description="Your chats with doctors will appear here"
          />
        </ScrollView>
      ) : (
        <ChatList
          rooms={rooms}
          onRoomPress={handleRoomPress}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#FF3B30', textAlign: 'center', marginBottom: 8 },
  errorHint: { fontSize: 14, color: '#8E8E93' },
});

export default ChatListScreen;
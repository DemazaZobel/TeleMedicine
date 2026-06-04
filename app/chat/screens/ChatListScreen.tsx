import ChatList from '../components/ChatList';
import { EmptyState, PageHeader, ScreenContainer } from '@/components/ui';
import { getChatRooms } from '../services/chatService';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme';
import type { ChatRoom } from '@/types/chat';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

const ChatListScreen: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isDoctor = user?.role === 'DOCTOR';
  const { isAuthenticated, isBootstrapping } = useAuthStore();
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
      if (e?.response?.status === 401 || e?.status === 401 || e?.message?.includes('401')) {
        // The global API interceptor handles 401s (logging out and redirecting), 
        // so we don't need to show a red error box for it here.
        return;
      }
      setError(e.message ?? 'Failed to load conversations');
      console.error('ChatListScreen error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      loadRooms();
    } else if (!isBootstrapping && !isAuthenticated) {
      setLoading(false);
    }
  }, [isBootstrapping, isAuthenticated, loadRooms]);

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

  if (isBootstrapping || loading) {
    return (
      <ScreenContainer centered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
            description={isDoctor ? 'Your chats with patients will appear here' : 'Your chats with doctors will appear here'}
            actionLabel={isDoctor ? 'Chat with my patients' : 'Find a Doctor'}
            onAction={() => router.push(isDoctor ? '/patients' : '/')}
          />

          {/* Temporary debug button so user can test UI without actual patients */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'demo_room', roomName: 'Demo Patient (Test)' } })}
            style={{ marginTop: 24, alignSelf: 'center', backgroundColor: theme.colors.primaryLight, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>🛠️ Open Test Chat UI</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ChatList rooms={rooms} onRoomPress={handleRoomPress} />
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
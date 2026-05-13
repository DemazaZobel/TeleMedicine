// src/screens/chat/ChatListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChatList from '../../components/chat/ChatList';
import { getChatRooms } from '../../services/chatService';
import type { ChatRoom } from '../../types/chat';

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getChatRooms();
        setRooms(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  const handleRoomPress = (room: ChatRoom) => {
    navigation.navigate('ChatScreen', { roomId: room.id, roomName: room.participantName });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <ChatList rooms={rooms} onRoomPress={handleRoomPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  title: { fontSize: 28, fontWeight: '700', padding: 20, color: '#1C1C1E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ChatListScreen;
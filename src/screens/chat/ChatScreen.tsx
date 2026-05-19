// src/screens/chat/ChatScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import { getMessages, sendMessage } from '../../services/chatService';
import type { Message } from '../../types/chat';

const ChatScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: roomName });
    const loadMessages = async () => {
      const data = await getMessages(roomId);
      setMessages(data);
      flatListRef.current?.scrollToEnd({ animated: true });
    };
    loadMessages();

    // Simulate real-time polling every 5s (replace with WebSocket later)
    const interval = setInterval(async () => {
      const latest = await getMessages(roomId);
      setMessages(latest);
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  const handleSend = async (text: string) => {
    const newMsg = await sendMessage(roomId, text);
    setMessages((prev) => [...prev, newMsg]);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessage
              message={item}
              isOwn={item.senderRole === 'patient'}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <ChatInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  flex: { flex: 1 },
  list: { padding: 16 },
});

export default ChatScreen;
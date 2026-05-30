import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from '../../i18n';
import {
  View, FlatList, KeyboardAvoidingView,
  Platform, SafeAreaView, StyleSheet,
  ActivityIndicator, Text, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import { getMessages, sendMessage } from '../../services/chatService';
import type { Message } from '../../types/chat';

const CURRENT_USER_ROLE: 'doctor' | 'patient' = 'doctor'; // change to your auth store value

const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  // ✅ Updated: reads 'id' and 'roomName' from params
  const { id: roomId, roomName } = useLocalSearchParams<{ id: string; roomName: string }>();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: roomName ?? 'Chat' });
  }, [roomName, navigation]);

  const loadMessages = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      const data = await getMessages(roomId);
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load messages');
      console.error('ChatScreen loadMessages error:', e);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadMessages(true);

    pollingRef.current = setInterval(() => {
      loadMessages(false);
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadMessages]);

  const handleSend = async (text: string) => {
    // Optimistic update — show immediately before server confirms
    const optimistic: Message = {
      id: `temp_${Date.now()}`,
      roomId: roomId,
      senderId: 'me',
      senderName: 'Me',
      senderRole: CURRENT_USER_ROLE,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    const saved = await sendMessage(roomId, text);
    setMessages((prev) =>
      prev.map((m) => (m.id === optimistic.id ? saved : m))
    );
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
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity onPress={() => loadMessages(true)} style={styles.retryButton}>
          <Text style={styles.retryText}>{t("common:retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
              isOwn={item.senderRole === CURRENT_USER_ROLE}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t("patient:noMessagesYet")}</Text>
              <Text style={styles.emptyHint}>{t("patient:startConversationInstructions")}</Text>
            </View>
          }
        />
        <ChatInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  list: { padding: 16, paddingBottom: 8 },
  errorText: { fontSize: 16, color: '#FF3B30', textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#3C3C43', marginBottom: 8 },
  emptyHint: { fontSize: 15, color: '#8E8E93' },
});

export default ChatScreen;
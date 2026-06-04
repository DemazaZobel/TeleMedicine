import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, FlatList, KeyboardAvoidingView,
  Platform, SafeAreaView, StyleSheet,
  ActivityIndicator, Text, TouchableOpacity,
  Alert, Modal, TextInput
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import { getMessages, sendMessage, shareVideoLink, uploadChatFile, editMessage, deleteMessage } from '../../services/chatService';
import { useAuthStore } from '../../store/authStore';
import { useTheme, type Theme } from '../../theme';
import type { Message } from '../../types/chat';

const isSameDay = (d1: Date, d2: Date) => 
  d1.getFullYear() === d2.getFullYear() && 
  d1.getMonth() === d2.getMonth() && 
  d1.getDate() === d2.getDate();

const processMessages = (msgs: Message[]) => {
  const processed: any[] = [];
  let lastDate: Date | null = null;
  msgs.forEach((m) => {
    const d = new Date(m.timestamp);
    if (!lastDate || !isSameDay(lastDate, d)) {
      processed.push({ id: `date_${m.timestamp}`, isDateHeader: true, date: d });
      lastDate = d;
    }
    processed.push(m);
  });
  return processed;
};

const QUICK_REPLIES = [
  "How are you feeling today?",
  "Please send your latest lab results.",
  "I have updated your prescription.",
];

const ChatScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const user = useAuthStore((s) => s.user);
  const currentUserRole: 'doctor' | 'patient' = user?.role === 'DOCTOR' ? 'doctor' : 'patient';

  const { id: roomId, roomName } = useLocalSearchParams<{ id: string; roomName: string }>();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [sendingLink, setSendingLink] = useState(false);

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    navigation.setOptions({ 
      title: roomName ?? 'Chat',
      headerTitle: () => (
        <TouchableOpacity style={styles.headerTitleContainer} onPress={() => Alert.alert("Patient Profile", "View full medical profile (Coming soon)")}>
          <Text style={styles.headerTitleText}>{roomName ?? 'Chat'}</Text>
          {currentUserRole === 'doctor' && (
            <Text style={styles.headerSubtitleText}>Tap for context</Text>
          )}
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => { setIsSearchActive(!isSearchActive); setSearchQuery(''); }} style={{ marginRight: 16 }}>
            <Ionicons name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )
    });
  }, [roomName, navigation, currentUserRole, isDark, toggleTheme, theme, isSearchActive]);

  const loadMessages = useCallback(async (showLoader = false) => {
    if (roomId === 'demo_room') {
      setMessages([
        { id: '1', roomId: 'demo_room', senderId: 'p1', senderName: 'Demo Patient', senderRole: 'patient', text: 'Hello Doctor! I have a question about my prescription.', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true },
        { id: '2', roomId: 'demo_room', senderId: 'me', senderName: 'Me', senderRole: currentUserRole, text: 'Hi there! I can help you with that. Would you like to jump on a quick video call?', timestamp: new Date(Date.now() - 300000).toISOString(), isRead: true }
      ]);
      setLoading(false);
      return;
    }

    try {
      if (showLoader) setLoading(true);
      setError(null);
      const data = await getMessages(roomId);
      data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.status === 401 || e?.message?.includes('401')) {
        // Handled by global interceptor
        return;
      }
      setError(e.message ?? 'Failed to load messages');
      console.error('ChatScreen loadMessages error:', e);
    } finally {
      setLoading(false);
    }
  }, [roomId, currentUserRole]);

  useEffect(() => {
    loadMessages(true);

    pollingRef.current = setInterval(() => {
      loadMessages(false);
    }, 1000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadMessages]);

  const handleSend = async (text: string) => {
    const optimistic: Message = {
      id: `temp_${Date.now()}`,
      roomId: roomId,
      senderId: 'me',
      senderName: 'Me',
      senderRole: currentUserRole,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    if (roomId === 'demo_room') return;

    try {
      const saved = await sendMessage(roomId, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m))
      );
    } catch (err: any) {
      Alert.alert('Send Error', err.message ?? 'Failed to send message.');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  const handleEditSubmit = async (messageId: string, newText: string) => {
    if (!editingMessage) return;
    try {
      const updated = await editMessage(roomId, messageId, newText);
      setMessages(prev => prev.map(m => m.id === messageId ? updated : m));
      setEditingMessage(null);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to edit message.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(roomId, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      Alert.alert('Error', 'Failed to delete message.');
    }
  };

  const handleSendVideoLink = async () => {
    if (!meetingLink.trim() || sendingLink) return;
    const link = meetingLink.trim();
    setSendingLink(true);

    const optimistic: Message = {
      id: `temp_video_${Date.now()}`,
      roomId: roomId,
      senderId: 'me',
      senderName: 'Me',
      senderRole: currentUserRole,
      text: link,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    if (roomId === 'demo_room') {
      setIsVideoModalVisible(false);
      setMeetingLink('');
      setSendingLink(false);
      return;
    }

    try {
      const saved = await shareVideoLink(roomId, link);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m))
      );
      setIsVideoModalVisible(false);
      setMeetingLink('');
    } catch (err: any) {
      Alert.alert('Send Error', err.message ?? 'Failed to share video link.');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSendingLink(false);
    }
  };

  const handleFileUpload = async (file: { uri: string; name: string; type: string; mimeType: string }) => {
    const optimistic: Message = {
      id: `temp_file_${Date.now()}`,
      roomId: roomId,
      senderId: 'me',
      senderName: 'Me',
      senderRole: currentUserRole,
      text: '',
      timestamp: new Date().toISOString(),
      isRead: false,
      fileUrl: file.uri,
      fileType: file.type,
      fileName: file.name,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    if (roomId === 'demo_room') return;

    try {
      await uploadChatFile(roomId, file);
      loadMessages(false);
    } catch (err: any) {
      console.error("Upload failed", err.response?.data || err.message);
      const backendError = err.response?.data ? JSON.stringify(err.response.data) : (err.message ?? 'Failed to upload file.');
      Alert.alert('Upload Error', backendError);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity onPress={() => loadMessages(true)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentUserRole === 'doctor' && (
        <View style={styles.doctorBanner}>
          <View style={styles.doctorBannerContent}>
            <Ionicons name="videocam" size={24} color={theme.colors.primary} />
            <View style={styles.doctorBannerTextContainer}>
              <Text style={styles.doctorBannerTitle}>Video Consultation</Text>
              <Text style={styles.doctorBannerSubtitle}>Start a face-to-face call</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.doctorBannerBtn} 
            onPress={() => setIsVideoModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.doctorBannerBtnText}>Create Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSearchActive && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={processMessages(messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()) || m.fileName?.toLowerCase().includes(searchQuery.toLowerCase())))}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.isDateHeader) {
              return (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>
                    {item.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              );
            }
            return (
              <ChatMessage
                message={item as Message}
                isOwn={item.senderRole === currentUserRole}
                onEdit={(msg) => setEditingMessage(msg)}
                onDelete={handleDeleteMessage}
              />
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No messages yet.</Text>
              <Text style={styles.emptyHint}>Send a message to start the conversation.</Text>
            </View>
          }
        />
        {currentUserRole === 'doctor' && (
          <View style={styles.quickReplyContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={QUICK_REPLIES}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.quickReplyChip} onPress={() => handleSend(item)}>
                  <Text style={styles.quickReplyText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.quickReplyScroll}
            />
          </View>
        )}
        <ChatInput
          onSend={handleSend}
          onShareVideoLink={currentUserRole === 'doctor' ? () => setIsVideoModalVisible(true) : undefined}
          onFileUpload={handleFileUpload}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
          onEditSubmit={handleEditSubmit}
        />
      </KeyboardAvoidingView>

      <Modal
        visible={isVideoModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsVideoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Video Consultation Link</Text>
            <Text style={styles.modalSubtitle}>
              Create a virtual room for this consultation or enter an external Zoom/Google Meet link.
            </Text>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => {
                const generatedRoom = `https://meet.jit.si/medlink-consultation-${roomId}`;
                setMeetingLink(generatedRoom);
              }}
            >
              <Ionicons name="sparkles" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.generateButtonText}>Generate MedLink Room</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.modalDivider} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.modalDivider} />
            </View>

            <TextInput
              style={styles.modalInput}
              value={meetingLink}
              onChangeText={setMeetingLink}
              placeholder="Paste Zoom, Google Meet or Teams link here..."
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsVideoModalVisible(false);
                  setMeetingLink('');
                }}
                disabled={sendingLink}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.sendLinkButton,
                  (!meetingLink.trim() || sendingLink) && styles.sendLinkButtonDisabled
                ]}
                onPress={handleSendVideoLink}
                disabled={!meetingLink.trim() || sendingLink}
              >
                {sendingLink ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.sendLinkButtonText}>Send Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  list: { padding: 16, paddingBottom: 8 },
  errorText: { fontSize: 16, color: theme.colors.error, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  emptyHint: { fontSize: 15, color: theme.colors.textSecondary },

  headerTitleContainer: { alignItems: 'center' },
  headerTitleText: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  headerSubtitleText: { fontSize: 12, color: theme.colors.primary },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },

  dateHeader: { alignSelf: 'center', backgroundColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginVertical: 12 },
  dateHeaderText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },

  quickReplyContainer: { backgroundColor: theme.colors.surface, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.colors.border },
  quickReplyScroll: { paddingHorizontal: 12, gap: 8 },
  quickReplyChip: { backgroundColor: theme.colors.background, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  quickReplyText: { fontSize: 14, color: theme.colors.primary, fontWeight: '500' },

  doctorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CCE4FF',
  },
  doctorBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorBannerTextContainer: {
    marginLeft: 12,
  },
  doctorBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#005BB5',
  },
  doctorBannerSubtitle: {
    fontSize: 13,
    color: theme.colors.primary,
    marginTop: 2,
  },
  doctorBannerBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doctorBannerBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  modalDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  sendLinkButton: {
    backgroundColor: theme.colors.primary,
  },
  sendLinkButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  sendLinkButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ChatScreen;
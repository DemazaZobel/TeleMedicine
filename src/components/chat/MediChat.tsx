// ─── MediChat.tsx ─────────────────────────────────────────────────────────────
// Drop-in floating chatbot for Medlink.
// Add <MediChat /> anywhere in your root layout — it floats above all screens.

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Linking,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  sendChatMessage,
  validateChatConfig,
  type ChatMessage,
  type Doctor,
} from '../../services/chatbot.service';

// ── Config ────────────────────────────────────────────────────────────────────

const BRAND_GREEN = '#00A86B';
const BRAND_DARK  = '#0D3B2E';
const SURFACE     = '#F5FAF7';
const { height: SCREEN_H } = Dimensions.get('window');

// ── Doctor card ───────────────────────────────────────────────────────────────

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const initials = `${doctor.first_name[0]}${doctor.last_name[0]}`.toUpperCase();
  return (
    <View style={styles.doctorCard}>
      {doctor.profile_image ? (
        <Image source={{ uri: doctor.profile_image }} style={styles.doctorAvatar} />
      ) : (
        <View style={[styles.doctorAvatar, styles.doctorAvatarPlaceholder]}>
          <Text style={styles.doctorInitials}>{initials}</Text>
        </View>
      )}
      <View style={styles.doctorInfo}>
        <View style={styles.doctorNameRow}>
          <Text style={styles.doctorName}>Dr. {doctor.first_name} {doctor.last_name}</Text>
          {doctor.is_verified && <Text style={styles.verifiedBadge}>✓</Text>}
        </View>
        <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
        <View style={styles.doctorMeta}>
          <Text style={styles.doctorMetaText}>⭐ {Number(doctor.average_rating).toFixed(1)}</Text>
          <Text style={styles.doctorMetaDot}>·</Text>
          <Text style={styles.doctorMetaText}>{doctor.years_of_experience} yrs</Text>
          {doctor.hospital && (
            <>
              <Text style={styles.doctorMetaDot}>·</Text>
              <Text style={styles.doctorMetaText} numberOfLines={1}>{doctor.hospital}</Text>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8}>
        <Text style={styles.bookBtnText}>Book</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Typing dots ───────────────────────────────────────────────────────────────

function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.typingContainer}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, {
            opacity: dot,
            transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
          }]}
        />
      ))}
    </View>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperBot]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>M</Text>
        </View>
      )}
      <View style={{ flex: 1, maxWidth: '85%' }}>
        {message.isLoading ? (
          <View style={[styles.bubble, styles.bubbleBot]}>
            <TypingDots />
          </View>
        ) : (
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
              {message.content}
            </Text>
          </View>
        )}
        {message.doctors && message.doctors.length > 0 && (
          <View style={styles.doctorList}>
            {message.doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
          </View>
        )}
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MediChat() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm Medi 👋 I can help you find a doctor, check your symptoms, or answer questions about Medlink. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]         = useState('');
  const [isSending, setIsSending] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const fabScale    = useRef(new Animated.Value(1)).current;
  const panelAnim   = useRef(new Animated.Value(0)).current;

  // ── Validate API key on mount ─────────────────────────────────────────────
  useEffect(() => {
    const check = validateChatConfig();
    if (!check.ok) {
      console.error('[MediChat] ❌', check.error);
      setConfigError(check.error ?? 'Configuration error');
    } else {
      console.log('[MediChat] ✅ Config OK — Gemini key loaded');
    }
  }, []);

  // ── FAB bounce on mount ───────────────────────────────────────────────────
  useEffect(() => {
    Animated.sequence([
      Animated.delay(800),
      Animated.spring(fabScale, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1,    useNativeDriver: true }),
    ]).start();
  }, []);

  const openChat = () => {
    setIsOpen(true);
    Animated.spring(panelAnim, { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }).start();
  };

  const closeChat = () => {
    Animated.timing(panelAnim, { toValue: 0, duration: 250, useNativeDriver: true })
      .start(() => setIsOpen(false));
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput('');
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    scrollToBottom();

    try {
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(history, text);

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: response.text,
          doctors: response.doctors,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      // Show the REAL error message — not a generic fallback
      const errText = err?.message ?? 'Unknown error';
      console.error('[MediChat] Send failed:', errText);

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          // Show the specific error so you know exactly what to fix
          content: __DEV__
            ? `⚠️ Error: ${errText}`
            : "Sorry, I couldn't connect right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  }, [input, isSending, messages, scrollToBottom]);

  const panelTranslateY = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_H, 0],
  });

  return (
    <>
      {/* ── FAB ── */}
      {!isOpen && (
        <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity onPress={openChat} activeOpacity={0.85} style={styles.fabInner}>
            <Text style={styles.fabIcon}>💬</Text>
            {/* Red dot if config error */}
            {configError && (
              <View style={styles.fabErrorDot} />
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Chat Modal ── */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeChat}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeChat} activeOpacity={1} />

          <Animated.View style={[styles.panel, { transform: [{ translateY: panelTranslateY }] }]}>
            <SafeAreaView style={{ flex: 1 }}>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerAvatar}>
                    <Text style={styles.headerAvatarText}>M</Text>
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Medi</Text>
                    <Text style={styles.headerSubtitle}>Medlink Health Assistant</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeChat} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Config error banner — only in dev */}
              {configError && __DEV__ && (
                <View style={styles.configErrorBanner}>
                  <Text style={styles.configErrorText}>⚠️ {configError}</Text>
                </View>
              )}

              {/* Messages */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={m => m.id}
                renderItem={({ item }) => <MessageBubble message={item} />}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={scrollToBottom}
                showsVerticalScrollIndicator={false}
              />

              {/* Input */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={20}
              >
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ask me anything…"
                    placeholderTextColor="#9BB0A8"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!input.trim() || isSending}
                    activeOpacity={0.8}
                  >
                    {isSending
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.sendBtnText}>↑</Text>
                    }
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.emergencyBanner}
                  onPress={() => Linking.openURL('tel:907')}
                >
                  <Text style={styles.emergencyText}>🚨 Emergency? Call 907</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>

            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 28, right: 20, zIndex: 999,
    shadowColor: BRAND_GREEN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 12,
  },
  fabInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center', alignItems: 'center',
  },
  fabIcon: { fontSize: 26 },
  fabErrorDot: {
    position: 'absolute', top: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#fff',
  },

  modalOverlay:  { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  panel: {
    height: SCREEN_H * 0.88, backgroundColor: SURFACE,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: BRAND_DARK, paddingHorizontal: 16, paddingVertical: 14,
  },
  headerLeft:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: BRAND_GREEN, justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerTitle:      { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerSubtitle:   { color: '#A8C8BB', fontSize: 12 },
  closeBtn:         { padding: 6 },
  closeBtnText:     { color: '#A8C8BB', fontSize: 18 },

  configErrorBanner: {
    backgroundColor: '#FFF3CD', padding: 10,
    borderBottomWidth: 1, borderBottomColor: '#FFE08A',
  },
  configErrorText: { color: '#7D4600', fontSize: 12, lineHeight: 18 },

  messageList: { padding: 16, gap: 12 },
  bubbleWrapper:     { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bubbleWrapperUser: { justifyContent: 'flex-end' },
  bubbleWrapperBot:  { justifyContent: 'flex-start' },
  botAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', marginBottom: 2,
  },
  botAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: '100%' },
  bubbleUser: { backgroundColor: BRAND_GREEN, borderBottomRightRadius: 4 },
  bubbleBot: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  bubbleText:     { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextBot:  { color: '#1A2E27' },

  typingContainer: { flexDirection: 'row', gap: 5, paddingVertical: 4, paddingHorizontal: 2 },
  typingDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: BRAND_GREEN },

  doctorList:  { marginTop: 8, gap: 8 },
  doctorCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 10, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  doctorAvatar:            { width: 46, height: 46, borderRadius: 23 },
  doctorAvatarPlaceholder: { backgroundColor: BRAND_DARK, justifyContent: 'center', alignItems: 'center' },
  doctorInitials:          { color: '#fff', fontWeight: '700', fontSize: 16 },
  doctorInfo:              { flex: 1 },
  doctorNameRow:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doctorName:              { fontWeight: '700', fontSize: 14, color: '#0D2B20' },
  verifiedBadge:           { color: BRAND_GREEN, fontSize: 13, fontWeight: '700' },
  doctorSpecialty:         { color: '#4A7060', fontSize: 13, marginTop: 1 },
  doctorMeta:              { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  doctorMetaText:          { color: '#7A9E8E', fontSize: 12 },
  doctorMetaDot:           { color: '#B0C8BE', fontSize: 12 },
  bookBtn: {
    backgroundColor: BRAND_GREEN, paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 20,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5F0EA',
  },
  input: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15, color: '#1A2E27', maxHeight: 100,
    borderWidth: 1, borderColor: '#D0E8DC',
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: BRAND_GREEN, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#B0D4C4' },
  sendBtnText:     { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },

  emergencyBanner: {
    backgroundColor: '#FFF3F3', paddingVertical: 8,
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#FFD6D6',
  },
  emergencyText: { color: '#C0392B', fontSize: 13, fontWeight: '600' },
});
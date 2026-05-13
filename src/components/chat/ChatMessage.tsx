// src/components/chat/ChatMessage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '../../types/chat';

interface Props {
  message: Message;
  isOwn: boolean;
}

const ChatMessage: React.FC<Props> = ({ message, isOwn }) => {
  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>{message.text}</Text>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 4, maxWidth: '80%' },
  ownContainer: { alignSelf: 'flex-end' },
  otherContainer: { alignSelf: 'flex-start' },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 16 },
  ownText: { color: '#FFF' },
  otherText: { color: '#1C1C1E' },
  timestamp: { fontSize: 11, marginTop: 4, textAlign: 'right', color: '#8E8E93' },
});

export default ChatMessage;
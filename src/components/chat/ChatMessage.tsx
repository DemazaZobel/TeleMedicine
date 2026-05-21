import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Message } from '../../types/chat';
import { formatTime } from '../../utils/index';

interface Props {
  message: Message;
  isOwn: boolean;
}

const ChatMessage: React.FC<Props> = ({ message, isOwn }) => {
  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {!isOwn && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatTime(message.timestamp)}
          {isOwn && (
            <Text style={styles.readStatus}>{message.isRead ? '  ✓✓' : '  ✓'}</Text>
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 4, maxWidth: '80%' },
  ownContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherContainer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 12, color: '#8E8E93', marginBottom: 2, marginLeft: 4 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  text: { fontSize: 16, lineHeight: 22 },
  ownText: { color: '#FFF' },
  otherText: { color: '#1C1C1E' },
  timestamp: { fontSize: 11, marginTop: 4 },
  ownTimestamp: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  otherTimestamp: { color: '#8E8E93', textAlign: 'left' },
  readStatus: { fontSize: 11 },
});

export default ChatMessage;
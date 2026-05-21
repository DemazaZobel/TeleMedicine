import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onSend: (text: string) => Promise<void>;
}

const ChatInput: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const toSend = text.trim();
    setText('');
    setSending(true);
    try {
      await onSend(toSend);
    } catch (e) {
      // restore text if send failed
      setText(toSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#8E8E93"
        multiline
        maxLength={2000}
        returnKeyType="default"
      />
      <TouchableOpacity
        onPress={handleSend}
        style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
        disabled={!text.trim() || sending}
        activeOpacity={0.7}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Ionicons name="send" size={18} color="#FFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFF',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
    color: '#1C1C1E',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
});

export default ChatInput;
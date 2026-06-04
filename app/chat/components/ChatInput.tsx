import { useTheme, type Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Message } from '@/types/chat';

interface Props {
  onSend: (text: string) => Promise<void>;
  onShareVideoLink?: () => void;
  onFileUpload?: (file: { uri: string; name: string; type: string; mimeType: string }) => Promise<void>;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  onEditSubmit?: (messageId: string, text: string) => Promise<void>;
}

const ChatInput: React.FC<Props> = ({
  onSend,
  onShareVideoLink,
  onFileUpload,
  editingMessage,
  onCancelEdit,
  onEditSubmit
}) => {
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
    } else {
      setText('');
    }
  }, [editingMessage]);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const toSend = text.trim();
    setText('');
    setSending(true);
    try {
      if (editingMessage && onEditSubmit) {
        await onEditSubmit(editingMessage.id, toSend);
      } else {
        await onSend(toSend);
      }
    } catch (e) {
      // restore text if send failed
      setText(toSend);
    } finally {
      setSending(false);
    }
  };

  const handleAttachment = async () => {
    if (!onFileUpload || sending) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSending(true);
        await onFileUpload({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType?.startsWith('image/') ? 'image' : 'document',
          mimeType: asset.mimeType || 'application/octet-stream',
        });
      }
    } catch (e) {
      console.error("Document picking failed", e);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setRecordingDuration(0);
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording || !onFileUpload) return;
    setSending(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(null);
      setRecordingDuration(0);

      if (uri) {
        await onFileUpload({
          uri,
          name: `audio_${Date.now()}.m4a`,
          type: 'audio',
          mimeType: 'audio/m4a'
        });
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setSending(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.outerContainer}>
      {editingMessage && (
        <View style={styles.editingBanner}>
          <View style={styles.editingBannerContent}>
            <Ionicons name="pencil" size={16} color={theme.colors.primary} />
            <Text style={styles.editingText}>Editing message</Text>
          </View>
          <TouchableOpacity onPress={onCancelEdit}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.container}>
        {onFileUpload && !recording && !editingMessage && (
          <TouchableOpacity
            onPress={handleAttachment}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="attach-outline" size={22} color="#8E8E93" />
          </TouchableOpacity>
        )}
        {onShareVideoLink && !recording && !editingMessage && (
          <TouchableOpacity
            onPress={onShareVideoLink}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam-outline" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        {recording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.recordingText}>{formatDuration(recordingDuration)}</Text>
          </View>
        ) : (
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
        )}

        {text.trim() ? (
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            disabled={sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            style={[styles.micButton, sending && styles.sendButtonDisabled, recording && styles.micButtonRecording]}
            disabled={sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name={recording ? "stop" : "mic"} size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  outerContainer: {
    backgroundColor: theme.colors.surface,
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  editingBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F2F2F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
    color: theme.colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#FF3B30',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F2F2F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 40,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default ChatInput;
import { useTheme, type Theme } from '@/theme';
import { formatTime } from '@/utils/index';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Message } from '@/types/chat';

interface Props {
  message: Message;
  isOwn: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

const isVideoLink = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;

  return (
    lower.includes('zoom.us') ||
    lower.includes('meet.google.com') ||
    lower.includes('teams.live.com') ||
    lower.includes('teams.microsoft.com') ||
    lower.includes('jitsi.org') ||
    lower.includes('jit.si') ||
    lower.includes('whereby.com') ||
    lower.includes('skype.com') ||
    lower.includes('teleport.video') ||
    lower.includes('medlink')
  );
};

const ChatMessage: React.FC<Props> = ({ message, isOwn, onEdit, onDelete }) => {
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const isVideo = isVideoLink(message.text);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [sound]);

  const handleLongPress = () => {
    if (!isOwn) return;
    Alert.alert(
      "Message Options",
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          onPress: () => onEdit && onEdit(message)
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Delete Message", "Are you sure you want to delete this message?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => onDelete && onDelete(message.id) }
            ]);
          }
        }
      ]
    );
  };

  const handleOpenLink = () => {
    Linking.openURL(message.text).catch((err) => {
      console.error('Failed to open link:', err);
    });
  };

  const handlePlayAudio = async () => {
    if (!message.fileUrl) return;
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.fileUrl },
          { shouldPlay: true }
        );
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              newSound.setPositionAsync(0);
            }
          }
        });
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Failed to play audio", e);
    }
  };

  const getFileType = () => {
    if (message.fileType) {
      if (message.fileType.startsWith('image/') || message.fileType === 'image') return 'image';
      if (message.fileType.startsWith('audio/') || message.fileType === 'audio') return 'audio';
      return 'document';
    }
    if (!message.fileUrl && !message.fileName) return undefined;
    const ref = (message.fileUrl || message.fileName || '').toLowerCase();
    if (ref.match(/\.(jpeg|jpg|gif|png|webp)$/)) return 'image';
    if (ref.match(/\.(m4a|mp3|wav|ogg)$/)) return 'audio';
    return 'document';
  };

  const fileType = getFileType();

  return (
    <TouchableOpacity
      style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer, isVideo && styles.videoContainer]}
      onLongPress={handleLongPress}
      delayLongPress={300}
      activeOpacity={1}
    >
      {!isOwn && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      {isVideo ? (
        <View style={styles.videoCard}>
          <View style={styles.videoCardHeader}>
            <Ionicons name="videocam" size={18} color="#2E7D32" style={{ marginRight: 6 }} />
            <Text style={styles.videoCardTitle}>Video Consultation</Text>
          </View>
          <Text style={styles.videoCardText}>
            A virtual consultation link has been shared.{'\n'}Tap below to join.
          </Text>
          <TouchableOpacity
            style={styles.videoCardButton}
            onPress={handleOpenLink}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.videoCardButtonText}>Join Call</Text>
          </TouchableOpacity>
          <Text style={styles.videoCardTimestamp}>
            {formatTime(message.timestamp)}
            {isOwn && (
              <Text style={styles.readReceipt}>{message.isRead ? '  ✓✓' : '  ✓'}</Text>
            )}
          </Text>
        </View>
      ) : (
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble, message.fileUrl && fileType === 'image' && styles.imageBubble]}>
          {message.fileUrl ? (
            fileType === 'image' ? (
              <Image source={{ uri: message.fileUrl }} style={styles.imageAttachment} resizeMode="cover" />
            ) : fileType === 'audio' ? (
              <View style={styles.audioAttachment}>
                <TouchableOpacity onPress={handlePlayAudio} style={styles.audioPlayButton}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={isOwn ? "#FFF" : theme.colors.primary} />
                </TouchableOpacity>
                <View style={styles.audioWaveform}>
                  <View style={[styles.audioLine, isOwn ? styles.ownAudioLine : styles.otherAudioLine]} />
                </View>
                <Text style={[styles.audioDuration, isOwn ? styles.ownText : styles.otherText]}>
                  Audio
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.docAttachment} onPress={() => Linking.openURL(message.fileUrl!)}>
                <Ionicons name="document" size={24} color={isOwn ? "#FFF" : theme.colors.primary} />
                <Text style={[styles.docName, isOwn ? styles.ownText : styles.otherText]} numberOfLines={1}>
                  {message.fileName || 'Attached Document'}
                </Text>
              </TouchableOpacity>
            )
          ) : null}
          {!!message.text && !message.fileUrl && (
            <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
              {message.text}
            </Text>
          )}
          <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
            {message.isEdited ? '(edited) ' : ''}{formatTime(message.timestamp)}
            {isOwn && (
              <Text style={message.isRead ? styles.readReceipt : styles.sentReceipt}>
                {message.isRead ? '  ✓✓' : '  ✓'}
              </Text>
            )}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  container: { marginVertical: 4, maxWidth: '80%' },
  ownContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherContainer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2, marginLeft: 4 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 16, lineHeight: 22 },
  ownText: { color: '#FFF' },
  otherText: { color: theme.colors.text },
  timestamp: { fontSize: 11, marginTop: 4 },
  ownTimestamp: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  otherTimestamp: { color: theme.colors.textSecondary, textAlign: 'left' },
  sentReceipt: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  readReceipt: { fontSize: 11, color: '#4ADE80', fontWeight: 'bold' },

  // Attachments
  imageBubble: { paddingHorizontal: 4, paddingVertical: 4, paddingBottom: 10 },
  imageAttachment: { width: 220, height: 220, borderRadius: 16 },
  docAttachment: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 },
  docName: { fontSize: 14, marginLeft: 8, flex: 1, fontWeight: '500' },

  // Audio Attachment
  audioAttachment: { flexDirection: 'row', alignItems: 'center', minWidth: 150, paddingVertical: 4 },
  audioPlayButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  audioWaveform: { flex: 1, height: 24, justifyContent: 'center', marginRight: 8 },
  audioLine: { height: 3, borderRadius: 1.5, width: '100%', opacity: 0.5 },
  ownAudioLine: { backgroundColor: '#FFF' },
  otherAudioLine: { backgroundColor: theme.colors.primary },
  audioDuration: { fontSize: 12, fontWeight: '500' },

  // Video Consultation Card styles
  videoContainer: {
    maxWidth: 280,
  },
  videoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  videoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
  videoCardText: {
    fontSize: 13,
    color: '#4E5D4E',
    lineHeight: 18,
    marginBottom: 12,
  },
  videoCardButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCardButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  videoCardTimestamp: {
    fontSize: 10,
    color: '#8E9E8E',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default ChatMessage;
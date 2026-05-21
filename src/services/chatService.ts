import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { ChatRoom, Message } from '../types/chat';

const API_BASE = 'https://medlinkethiopia.pythonanywhere.com/api';

// expo-secure-store doesn't work on web — fall back to localStorage
const getAuthToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('auth_token');
  }
  return SecureStore.getItemAsync('auth_token');
};

const getHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeConversation = (conversation: any): ChatRoom => ({
  id: conversation.id?.toString() ?? conversation.pk?.toString() ?? '',
  participantId:
    conversation.participant_id ??
    conversation.participantId ??
    conversation.doctor_id ??
    conversation.patient_id ??
    '',
  participantName:
    conversation.participant_name ??
    conversation.participantName ??
    conversation.name ??
    'Conversation',
  participantAvatar:
    conversation.participant_avatar ??
    conversation.participantAvatar ??
    conversation.avatar ??
    undefined,
  participantRole:
    conversation.participant_role ?? conversation.participantRole ?? 'doctor',
  lastMessage:
    conversation.last_message ??
    conversation.lastMessage ??
    conversation.last_message_text ??
    '',
  lastMessageTime:
    conversation.last_message_time ??
    conversation.lastMessageTime ??
    conversation.updated_at ??
    '',
  unreadCount: conversation.unread_count ?? conversation.unreadCount ?? 0,
});

const normalizeMessage = (message: any): Message => ({
  id: message.id?.toString() ?? message.pk?.toString() ?? '',
  roomId:
    message.conversation_id ?? message.conversationId ?? message.roomId ?? '',
  senderId:
    message.sender_id ?? message.senderId ?? message.user_id ?? '',
  senderName:
    message.sender_name ?? message.senderName ?? message.user_name ?? 'Unknown',
  senderRole:
    message.sender_role ??
    message.senderRole ??
    (message.sender_is_doctor ? 'doctor' : 'patient'),
  text: message.text ?? message.body ?? message.message ?? '',
  timestamp: message.timestamp ?? message.created_at ?? message.createdAt ?? '',
  isRead: message.is_read ?? message.isRead ?? false,
});

const checkResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${response.statusText} ${text}`);
  }
  return response.json();
};

const getJsonData = (data: any): any => {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  if (data?.conversations) return data.conversations;
  if (data?.messages) return data.messages;
  return data;
};

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await fetch(`${API_BASE}/chat/conversations/`, {
    method: 'GET',
    headers: await getHeaders(),
  });
  const json = await checkResponse(response);
  const list = getJsonData(json);
  return Array.isArray(list) ? list.map(normalizeConversation) : [];
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/messages/`,
    {
      method: 'GET',
      headers: await getHeaders(),
    }
  );
  const json = await checkResponse(response);
  const list = getJsonData(json);
  return Array.isArray(list) ? list.map(normalizeMessage) : [];
};

export const sendMessage = async (
  conversationId: string,
  text: string
): Promise<Message> => {
  const response = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/messages/`,
    {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ text }),
    }
  );
  const json = await checkResponse(response);
  const messageData = getJsonData(json);
  return normalizeMessage(Array.isArray(messageData) ? messageData[0] : messageData);
};

export const uploadChatFile = async (
  conversationId: string,
  file: { uri: string; name: string; type: string }
): Promise<any> => {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
  const response = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/files/`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );
  return checkResponse(response);
};

export const saveAuthToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem('auth_token', token);
  } else {
    await SecureStore.setItemAsync('auth_token', token);
  }
};

export const clearAuthToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('auth_token');
  } else {
    await SecureStore.deleteItemAsync('auth_token');
  }
};
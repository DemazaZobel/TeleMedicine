// src/services/chatService.ts
import apiClient, { STORAGE_KEYS } from './api';
import * as Storage from './storage';
import type { ChatRoom, Message } from '../types/chat';

// ─── Normalizers ─────────────────────────────────────────

const normalizeConversation = (conversation: any, currentUserId?: string): ChatRoom => {
  const isPatient = conversation.patient?.id === currentUserId;
  const participant = isPatient ? conversation.doctor : conversation.patient;

  return {
    id: conversation.id?.toString() ?? '',
    participantId: participant?.id ?? '',
    participantName: participant
      ? `${participant.first_name} ${participant.last_name}`
      : 'Conversation',
    participantAvatar: undefined,
    participantRole: participant?.role?.toLowerCase() === 'doctor' ? 'doctor' : 'patient',
    lastMessage: conversation.last_message ?? 'Open chat to view messages',
    lastMessageTime: conversation.last_message_at ?? conversation.created_at ?? '',
    unreadCount: conversation.unread_count ?? 0,
  };
};

const normalizeMessage = (message: any): Message => {
  const rawFileUrl = message.attachments?.[0]?.file ?? message.file_url ?? message.file ?? message.attachment ?? undefined;
  const fileUrl = rawFileUrl && !rawFileUrl.startsWith('http') 
    ? `https://medlinkethiopia.pythonanywhere.com${rawFileUrl.startsWith('/') ? '' : '/'}${rawFileUrl}` 
    : rawFileUrl;

  // Compare timestamps strictly if we must, but usually a small difference is just DB lag. 
  // We'll check if the difference is more than 1 second.
  let isEdited = message.is_edited ?? false;
  if (message.updated_at && message.created_at) {
    const updatedMs = new Date(message.updated_at).getTime();
    const createdMs = new Date(message.created_at).getTime();
    if (updatedMs - createdMs > 1000) {
      isEdited = true;
    }
  }

  return {
    id: message.id?.toString() ?? '',
    roomId: message.conversation_id?.toString() ?? '',
    senderId: message.sender?.id ?? '',
    senderName: message.sender
      ? `${message.sender.first_name} ${message.sender.last_name}`
      : 'Unknown',
    senderRole: message.sender?.role?.toLowerCase() === 'doctor' ? 'doctor' : 'patient',
    text: message.content ?? '',
    timestamp: message.created_at ?? '',
    isRead: message.is_read ?? false,
    fileUrl,
    fileType: message.attachments?.[0]?.file_type ?? message.file_type ?? message.type ?? undefined,
    fileName: message.file_name ?? message.name ?? undefined,
    isEdited,
  };
};

const getJsonData = (data: any): any => {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  if (data?.conversations) return data.conversations;
  if (data?.messages) return data.messages;
  return data;
};

const getCurrentUserId = async (): Promise<string | undefined> => {
  const userJson = await Storage.getItemAsync(STORAGE_KEYS.USER);
  const currentUser = userJson ? JSON.parse(userJson) : null;
  return currentUser?.id;
};

// ─── API Functions ────────────────────────────────────────

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const { data } = await apiClient.get('/chat/conversations/');
  const list = getJsonData(data);
  const currentUserId = await getCurrentUserId();
  return Array.isArray(list)
    ? list.map((item) => normalizeConversation(item, currentUserId))
    : [];
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await apiClient.get(
    `/chat/conversations/${conversationId}/messages/`
  );
  console.log("Raw getMessages response:", JSON.stringify(data).substring(0, 500));
  const list = getJsonData(data);
  return Array.isArray(list) ? list.map(normalizeMessage) : [];
};

export const sendMessage = async (
  conversationId: string,
  text: string
): Promise<Message> => {
  const { data } = await apiClient.post(
    `/chat/conversations/${conversationId}/messages/`,
    { content: text, message_type: 'TEXT' }
  );
  const messageData = getJsonData(data);
  return normalizeMessage(Array.isArray(messageData) ? messageData[0] : messageData);
};

export const createOrGetConversation = async (params: {
  doctorId?: string;
  patientId?: string;
  appointmentId?: string;
}): Promise<ChatRoom> => {
  const body: any = {};
  if (params.doctorId) body.doctor_id = params.doctorId;
  if (params.patientId) body.patient_id = params.patientId;
  if (params.appointmentId) body.appointment_id = params.appointmentId;

  const { data } = await apiClient.post('/chat/conversations/', body);
  const currentUserId = await getCurrentUserId();
  return normalizeConversation(data, currentUserId);
};

export const uploadChatFile = async (
  conversationId: string,
  file: { uri: string; name: string; type: string; mimeType?: string }
): Promise<any> => {
  const formData = new FormData();
  // React Native requires the actual MIME type (e.g. 'image/jpeg') for the file to upload correctly, 
  // not our custom UI classification ('image' or 'document')
  formData.append('file', { 
    uri: file.uri, 
    name: file.name, 
    type: file.mimeType || 'application/octet-stream' 
  } as any);

  const { data } = await apiClient.post(
    `/chat/conversations/${conversationId}/files/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const shareVideoLink = async (
  conversationId: string,
  videoLink: string
): Promise<Message> => {
  const { data } = await apiClient.post(
    `/chat/conversations/${conversationId}/video-link/`,
    { url: videoLink }
  );
  const messageData = getJsonData(data);
  return normalizeMessage(Array.isArray(messageData) ? messageData[0] : messageData);
};

export const editMessage = async (
  conversationId: string,
  messageId: string,
  text: string
): Promise<Message> => {
  const { data } = await apiClient.patch(
    `/chat/conversations/${conversationId}/messages/${messageId}/`,
    { content: text }
  );
  const messageData = getJsonData(data);
  return normalizeMessage(Array.isArray(messageData) ? messageData[0] : messageData);
};

export const deleteMessage = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  await apiClient.delete(`/chat/conversations/${conversationId}/messages/${messageId}/`);
};
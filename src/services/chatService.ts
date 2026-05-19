import type { ChatRoom, Message } from "../types/chat";

const API_BASE = "https://medlinkethiopia.pythonanywhere.com/api";

const normalizeConversation = (conversation: any): ChatRoom => ({
  id: conversation.id?.toString() ?? conversation.pk?.toString() ?? "",
  participantId:
    conversation.participant_id ??
    conversation.participantId ??
    conversation.doctor_id ??
    conversation.patient_id ??
    "",
  participantName:
    conversation.participant_name ??
    conversation.participantName ??
    conversation.name ??
    "Conversation",
  participantAvatar:
    conversation.participant_avatar ??
    conversation.participantAvatar ??
    conversation.avatar ??
    undefined,
  participantRole:
    conversation.participant_role ?? conversation.participantRole ?? "doctor",
  lastMessage:
    conversation.last_message ??
    conversation.lastMessage ??
    conversation.last_message_text ??
    conversation.lastMessageText ??
    "",
  lastMessageTime:
    conversation.last_message_time ??
    conversation.lastMessageTime ??
    conversation.updated_at ??
    conversation.updatedAt ??
    "",
  unreadCount: conversation.unread_count ?? conversation.unreadCount ?? 0,
});

const normalizeMessage = (message: any): Message => ({
  id: message.id?.toString() ?? message.pk?.toString() ?? "",
  roomId:
    message.conversation_id ?? message.conversationId ?? message.roomId ?? "",
  senderId:
    message.sender_id ??
    message.senderId ??
    message.user_id ??
    message.userId ??
    "",
  senderName:
    message.sender_name ??
    message.senderName ??
    message.user_name ??
    message.userName ??
    "Unknown",
  senderRole:
    message.sender_role ??
    message.senderRole ??
    (message.sender_is_doctor ? "doctor" : "patient"),
  text: message.text ?? message.body ?? message.message ?? "",
  timestamp: message.timestamp ?? message.created_at ?? message.createdAt ?? "",
  isRead: message.is_read ?? message.isRead ?? false,
});

const checkResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API error ${response.status}: ${response.statusText} ${text}`,
    );
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
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await checkResponse(response);
  const list = getJsonData(json);
  return Array.isArray(list) ? list.map(normalizeConversation) : [];
};

export const getMessages = async (
  conversationId: string,
): Promise<Message[]> => {
  const response = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/messages/`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  const json = await checkResponse(response);
  const list = getJsonData(json);
  return Array.isArray(list) ? list.map(normalizeMessage) : [];
};

export const sendMessage = async (
  conversationId: string,
  text: string,
): Promise<Message> => {
  const response = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/messages/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
  );

  const json = await checkResponse(response);
  const messageData = getJsonData(json);
  return normalizeMessage(
    Array.isArray(messageData) ? messageData[0] : messageData,
  );
};

export const uploadChatFile = async (
  conversationId: string,
  file: { uri: string; name: string; type: string },
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const response = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/files/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    },
  );

  return checkResponse(response);
};

export const shareVideoLink = async (
  conversationId: string,
  videoUrl: string,
): Promise<any> => {
  const response = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/video-link/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: videoUrl }),
    },
  );

  return checkResponse(response);
};

// src/types/chat.ts
export interface ChatRoom {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: 'doctor' | 'patient';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatRoomResponse {
  rooms: ChatRoom[];
}

export interface MessagesResponse {
  messages: Message[];
}
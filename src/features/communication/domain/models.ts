export type NotificationType = 
  | 'MEDICATION_REMINDER' 
  | 'LOW_STOCK' 
  | 'DOSE_MISSED' 
  | 'APPOINTMENT_REMINDER' 
  | 'CLINICAL_ALERT' 
  | 'CHAT_MESSAGE'
  | 'SYSTEM';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS';
export type NotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED';

export interface Notification {
  readonly id: string;
  readonly recipientUserId: number;
  readonly patientId: number | null;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly status: NotificationStatus;
  readonly title: string;
  readonly message: string;
  readonly sourceEvent: string;
  readonly createdAt: string;
  readonly readAt: string | null;
}

export interface ChatMessage {
  readonly id: string;
  readonly chatId: string;
  readonly senderUserId: number;
  readonly recipientUserId: number;
  readonly content: string;
  readonly sentAt: string;
}

export interface SendChatMessagePayload {
  readonly recipientUserId: number;
  readonly content: string;
  readonly sentAt: string;
}

export interface Conversation {
  readonly participantUserId: number;
  readonly participantName: string;
  readonly lastMessage: string;
  readonly lastMessageAt: string;
  readonly unreadCount: number;
}

export type MessageKind = "text" | "image" | "document" | "audio" | "video" | "call";

export type CallType = "voice" | "video";

export type CallStatus = "ringing" | "connecting" | "active" | "ended" | "missed" | "declined";

export type MessageAttachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  content: string;
  attachments?: MessageAttachment[];
  callType?: CallType;
  callStatus?: CallStatus;
  callDurationSec?: number;
  replyToId?: string;
  createdAt: string;
  status: "sending" | "sent" | "delivered" | "read";
};

export type ChatParticipant = {
  id: string;
  name: string;
  role?: string;
  avatar: string;
  accent: string;
  online: boolean;
  lastSeen?: string;
};

export type Conversation = {
  id: string;
  type: "direct" | "group";
  title: string;
  subtitle?: string;
  avatar: string;
  accent: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinned?: boolean;
  muted?: boolean;
};

export type ActiveCall = {
  callId: string;
  conversationId: string;
  callType: CallType;
  isInitiator: boolean;
  remoteParticipant: ChatParticipant;
  status: CallStatus;
  startedAt?: number;
};

export type SignalPayload = {
  type: "offer" | "answer" | "ice" | "hangup" | "decline";
  payload?: RTCSessionDescriptionInit | RTCIceCandidateInit;
  fromUserId: string;
};

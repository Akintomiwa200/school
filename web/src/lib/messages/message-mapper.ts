import type { ChatMessage, ChatParticipant, Conversation } from "@/components/dashboard/messages/messages-types";

const ACCENTS = [
  "from-violet-400 to-violet-600",
  "from-sky-400 to-blue-600",
  "from-brand-purple to-brand-blue",
  "from-brand-orange to-brand-pink",
  "from-emerald-400 to-teal-600",
] as const;

type MessageUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string | null;
};

type RawMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string | null;
  content: string;
  isRead: boolean;
  createdAt: Date | string;
  sender: MessageUser;
  receiver: MessageUser;
};

function accentFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % ACCENTS.length;
  return ACCENTS[hash]!;
}

function toParticipant(user: MessageUser): ChatParticipant {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role.replace("_", " "),
    avatar: user.avatar ?? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase(),
    accent: accentFor(user.id),
    online: false,
  };
}

export function conversationIdFor(userA: string, userB: string) {
  return `conv:${[userA, userB].sort().join(":")}`;
}

export function mapMessagesToChat(currentUserId: string, rows: RawMessage[]) {
  const messages: ChatMessage[] = rows.map((row) => {
    const conversationId = conversationIdFor(row.senderId, row.receiverId);
    const isMine = row.senderId === currentUserId;
    return {
      id: row.id,
      conversationId,
      senderId: row.senderId,
      kind: "text" as const,
      content: row.content,
      createdAt: new Date(row.createdAt).toISOString(),
      status: isMine ? "delivered" : row.isRead ? "read" : "delivered",
    };
  });

  const conversationMap = new Map<string, Conversation>();

  for (const row of rows) {
    const conversationId = conversationIdFor(row.senderId, row.receiverId);
    const otherUser = row.senderId === currentUserId ? row.receiver : row.sender;
    const lastMessage = messages.find((m) => m.id === row.id);

    conversationMap.set(conversationId, {
      id: conversationId,
      type: "direct",
      title: `${otherUser.firstName} ${otherUser.lastName}`,
      subtitle: otherUser.role.replace("_", " "),
      avatar: otherUser.avatar ?? `${otherUser.firstName[0]}${otherUser.lastName[0]}`.toUpperCase(),
      accent: accentFor(otherUser.id),
      participants: [toParticipant(otherUser)],
      lastMessage: lastMessage ?? conversationMap.get(conversationId)?.lastMessage,
      unreadCount: 0,
    });
  }

  for (const conv of conversationMap.values()) {
    conv.unreadCount = rows.filter(
      (row) =>
        conversationIdFor(row.senderId, row.receiverId) === conv.id &&
        row.receiverId === currentUserId &&
        !row.isRead,
    ).length;
  }

  const conversations = [...conversationMap.values()].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return { currentUserId, conversations, messages };
}

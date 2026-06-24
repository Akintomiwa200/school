import type { ChatMessage, ChatParticipant, Conversation } from "./messages-types";

export const CURRENT_USER_ID = "user-student-1";

export const DEMO_PARTICIPANTS: Record<string, ChatParticipant> = {
  "teacher-mary": {
    id: "teacher-mary",
    name: "Mary Johnson",
    role: "Science mentor",
    avatar: "MJ",
    accent: "from-violet-400 to-violet-600",
    online: true,
  },
  "teacher-james": {
    id: "teacher-james",
    name: "James Brown",
    role: "Chinese",
    avatar: "JB",
    accent: "from-sky-400 to-blue-600",
    online: false,
    lastSeen: "Today, 2:14 PM",
  },
  "teacher-sarah": {
    id: "teacher-sarah",
    name: "Dr. Sarah Kim",
    role: "Mathematics",
    avatar: "SK",
    accent: "from-brand-purple to-brand-blue",
    online: true,
  },
  "group-cs2026": {
    id: "group-cs2026",
    name: "CS-2026 Class",
    role: "24 members",
    avatar: "CS",
    accent: "from-brand-blue to-brand-purple",
    online: true,
  },
  "parent-liaison": {
    id: "parent-liaison",
    name: "Ms. Anita Rao",
    role: "Parent liaison",
    avatar: "AR",
    accent: "from-brand-orange to-brand-pink",
    online: false,
    lastSeen: "Yesterday",
  },
};

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-mary",
    senderId: "teacher-mary",
    kind: "text",
    content: "Hi Alex! How did you find yesterday's lab worksheet?",
    createdAt: hoursAgo(26),
    status: "read",
  },
  {
    id: "msg-2",
    conversationId: "conv-mary",
    senderId: CURRENT_USER_ID,
    kind: "text",
    content: "It was challenging but I managed question 4 with the hint you gave.",
    createdAt: hoursAgo(25.5),
    status: "read",
  },
  {
    id: "msg-3",
    conversationId: "conv-mary",
    senderId: "teacher-mary",
    kind: "document",
    content: "Here's the answer key for self-check.",
    attachments: [
      {
        id: "att-1",
        fileName: "Lab-4-Answer-Key.pdf",
        fileType: "application/pdf",
        fileSize: 248_000,
        url: "#",
      },
    ],
    createdAt: hoursAgo(25),
    status: "read",
  },
  {
    id: "msg-4",
    conversationId: "conv-mary",
    senderId: CURRENT_USER_ID,
    kind: "image",
    content: "My setup for the experiment",
    attachments: [
      {
        id: "att-2",
        fileName: "lab-setup.jpg",
        fileType: "image/jpeg",
        fileSize: 1_240_000,
        url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      },
    ],
    createdAt: hoursAgo(3),
    status: "delivered",
  },
  {
    id: "msg-5",
    conversationId: "conv-mary",
    senderId: "teacher-mary",
    kind: "text",
    content: "Great setup! Submit photos with your report on Friday.",
    createdAt: minutesAgo(42),
    status: "read",
  },
  {
    id: "msg-6",
    conversationId: "conv-james",
    senderId: "teacher-james",
    kind: "text",
    content: "Remember to practice tones for Monday's oral quiz.",
    createdAt: hoursAgo(5),
    status: "read",
  },
  {
    id: "msg-7",
    conversationId: "conv-james",
    senderId: CURRENT_USER_ID,
    kind: "audio",
    content: "Voice note",
    attachments: [
      {
        id: "att-3",
        fileName: "pronunciation-practice.webm",
        fileType: "audio/webm",
        fileSize: 186_000,
        url: "#",
      },
    ],
    createdAt: hoursAgo(4.5),
    status: "read",
  },
  {
    id: "msg-8",
    conversationId: "conv-james",
    senderId: "teacher-james",
    kind: "call",
    content: "Voice call",
    callType: "voice",
    callStatus: "missed",
    createdAt: hoursAgo(2),
    status: "read",
  },
  {
    id: "msg-9",
    conversationId: "conv-cs2026",
    senderId: "teacher-sarah",
    kind: "text",
    content: "Assignment 3 deadline extended to Thursday 11:59 PM.",
    createdAt: hoursAgo(8),
    status: "read",
  },
  {
    id: "msg-10",
    conversationId: "conv-cs2026",
    senderId: CURRENT_USER_ID,
    kind: "document",
    content: "Shared my project brief draft",
    attachments: [
      {
        id: "att-4",
        fileName: "CS-Project-Brief.docx",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: 52_400,
        url: "#",
      },
      {
        id: "att-5",
        fileName: "wireframes.fig",
        fileType: "application/octet-stream",
        fileSize: 890_000,
        url: "#",
      },
    ],
    createdAt: hoursAgo(1.5),
    status: "sent",
  },
  {
    id: "msg-11",
    conversationId: "conv-liaison",
    senderId: "parent-liaison",
    kind: "text",
    content: "Fee payment receipt has been emailed to your guardian.",
    createdAt: hoursAgo(30),
    status: "read",
  },
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-mary",
    type: "direct",
    title: DEMO_PARTICIPANTS["teacher-mary"].name,
    subtitle: DEMO_PARTICIPANTS["teacher-mary"].role,
    avatar: DEMO_PARTICIPANTS["teacher-mary"].avatar,
    accent: DEMO_PARTICIPANTS["teacher-mary"].accent,
    participants: [DEMO_PARTICIPANTS["teacher-mary"]],
    lastMessage: SEED_MESSAGES.find((m) => m.id === "msg-5"),
    unreadCount: 1,
    pinned: true,
  },
  {
    id: "conv-james",
    type: "direct",
    title: DEMO_PARTICIPANTS["teacher-james"].name,
    subtitle: DEMO_PARTICIPANTS["teacher-james"].role,
    avatar: DEMO_PARTICIPANTS["teacher-james"].avatar,
    accent: DEMO_PARTICIPANTS["teacher-james"].accent,
    participants: [DEMO_PARTICIPANTS["teacher-james"]],
    lastMessage: SEED_MESSAGES.find((m) => m.id === "msg-8"),
    unreadCount: 0,
  },
  {
    id: "conv-cs2026",
    type: "group",
    title: "CS-2026 Class",
    subtitle: "Dr. Sarah Kim, you, +22",
    avatar: DEMO_PARTICIPANTS["group-cs2026"].avatar,
    accent: DEMO_PARTICIPANTS["group-cs2026"].accent,
    participants: [DEMO_PARTICIPANTS["teacher-sarah"], DEMO_PARTICIPANTS["group-cs2026"]],
    lastMessage: SEED_MESSAGES.find((m) => m.id === "msg-10"),
    unreadCount: 3,
  },
  {
    id: "conv-liaison",
    type: "direct",
    title: DEMO_PARTICIPANTS["parent-liaison"].name,
    subtitle: DEMO_PARTICIPANTS["parent-liaison"].role,
    avatar: DEMO_PARTICIPANTS["parent-liaison"].avatar,
    accent: DEMO_PARTICIPANTS["parent-liaison"].accent,
    participants: [DEMO_PARTICIPANTS["parent-liaison"]],
    lastMessage: SEED_MESSAGES.find((m) => m.id === "msg-11"),
    unreadCount: 0,
  },
];

export function getSeedMessages() {
  return [...SEED_MESSAGES];
}

export function getSeedConversations() {
  return DEMO_CONVERSATIONS.map((conversation) => ({ ...conversation }));
}

export function getConversationById(id: string) {
  return DEMO_CONVERSATIONS.find((conversation) => conversation.id === id);
}

export function getParticipantById(id: string) {
  return DEMO_PARTICIPANTS[id];
}

export function getConversationForParticipant(participantId: string) {
  const map: Record<string, string> = {
    "teacher-mary": "conv-mary",
    "teacher-james": "conv-james",
    "teacher-sarah": "conv-cs2026",
    "group-cs2026": "conv-cs2026",
    "parent-liaison": "conv-liaison",
  };
  return map[participantId];
}

export function formatMessageTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageType(fileType: string) {
  return fileType.startsWith("image/");
}

export function isAudioType(fileType: string) {
  return fileType.startsWith("audio/");
}

export function isVideoType(fileType: string) {
  return fileType.startsWith("video/");
}

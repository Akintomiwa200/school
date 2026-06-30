import { NotificationType, UserRole } from "@/shared";
import { resolveSharedPathForRole } from "@/shared/permissions";

export type Audience = UserRole[] | "all";

export type HubNotification = {
  id: string;
  userId: string;
  audience: Audience;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  actorName?: string;
  actorAvatar?: string;
  announcementId?: string;
};

export type HubAnnouncement = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  priority: "normal" | "important" | "urgent";
  pinned: boolean;
  audience: Audience;
  createdAt: string;
  readBy: string[];
};

export type RealtimeEvent =
  | { type: "sync"; payload: { notifications: HubNotification[]; announcements: HubAnnouncement[] } }
  | { type: "notification:new"; payload: HubNotification }
  | { type: "notification:update"; payload: HubNotification }
  | { type: "notification:remove"; payload: { id: string; userId: string } }
  | { type: "announcement:new"; payload: HubAnnouncement }
  | { type: "announcement:update"; payload: HubAnnouncement };

type StreamClient = {
  id: string;
  userId: string;
  role: UserRole;
  send: (event: RealtimeEvent) => void;
};

const now = Date.now();

const announcements: HubAnnouncement[] = [
  {
    id: "ann-1",
    title: "Spring term exams schedule published",
    body: "The full exam timetable for Spring 2026 is now available. Check your student portal timetable and calendar for room assignments. Contact your homeroom teacher if you spot a clash.",
    authorId: "admin-1",
    authorName: "School Administration",
    authorRole: UserRole.ADMIN,
    priority: "important",
    pinned: true,
    audience: "all",
    createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
    readBy: [],
  },
  {
    id: "ann-2",
    title: "Library extended hours during exam week",
    body: "The digital and physical library will stay open until 8 PM from June 20–27. Study rooms can be booked through the library page.",
    authorId: "lib-1",
    authorName: "Pathway Library Team",
    authorRole: UserRole.LIBRARIAN,
    priority: "normal",
    pinned: false,
    audience: [UserRole.STUDENT, UserRole.TEACHER],
    createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    readBy: [],
  },
  {
    id: "ann-3",
    title: "Fee payment reminder — Spring balance",
    body: "Outstanding Spring 2026 fees are due by June 30. Pay online from the Fees section or visit the accounts office.",
    authorId: "acc-1",
    authorName: "Finance Office",
    authorRole: UserRole.ACCOUNTANT,
    priority: "urgent",
    pinned: false,
    audience: [UserRole.STUDENT, UserRole.PARENT],
    createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
    readBy: [],
  },
];

let notifications: HubNotification[] = [
  {
    id: "ntf-1",
    userId: "*",
    audience: [UserRole.STUDENT],
    type: NotificationType.ANNOUNCEMENT,
    title: "Spring term exams schedule published",
    message: "Exam timetable is live — review your schedule.",
    link: "/shared/announcements/ann-1",
    isRead: false,
    createdAt: new Date(now - 1000 * 60 * 44).toISOString(),
    actorName: "School Administration",
    actorAvatar: "SA",
    announcementId: "ann-1",
  },
  {
    id: "ntf-2",
    userId: "*",
    audience: [UserRole.STUDENT],
    type: NotificationType.ASSIGNMENT,
    title: "New assignment in Advanced Biology",
    message: "Mr. Thompson posted Lab Report 3 — due Friday.",
    link: "/student/assignments",
    isRead: false,
    createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
    actorName: "Mr. Thompson",
    actorAvatar: "MT",
  },
  {
    id: "ntf-3",
    userId: "*",
    audience: [UserRole.STUDENT],
    type: NotificationType.PAYMENT,
    title: "Payment received",
    message: "Your library fee payment of $180 was confirmed.",
    link: "/student/fees/payments",
    isRead: true,
    createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
    actorName: "Finance Office",
    actorAvatar: "FO",
  },
  {
    id: "ntf-4",
    userId: "*",
    audience: [UserRole.STUDENT, UserRole.TEACHER],
    type: NotificationType.MESSAGE,
    title: "New message from Mary Johnson",
    message: "Can we review the ecosystem project draft tomorrow?",
    link: "/shared/messages?chat=conv-mary",
    isRead: false,
    createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
    actorName: "Mary Johnson",
    actorAvatar: "MJ",
  },
  {
    id: "ntf-5",
    userId: "*",
    audience: [UserRole.TEACHER, UserRole.ADMIN],
    type: NotificationType.INFO,
    title: "Staff meeting — curriculum review",
    message: "Thursday 3 PM in the main conference room.",
    link: "/shared/calendar",
    isRead: false,
    createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    actorName: "HR Team",
    actorAvatar: "HR",
  },
  {
    id: "ntf-6",
    userId: "*",
    audience: [UserRole.PARENT],
    type: NotificationType.ATTENDANCE,
    title: "Attendance update for Alex Johnson",
    message: "Present for all sessions today.",
    link: "/parent/attendance",
    isRead: false,
    createdAt: new Date(now - 1000 * 60 * 50).toISOString(),
    actorName: "Attendance System",
    actorAvatar: "AS",
  },
];

const streamClients = new Map<string, StreamClient>();
const readStateByUser = new Map<string, Set<string>>();

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function matchesAudience(audience: Audience, role: UserRole) {
  return audience === "all" || audience.includes(role);
}

function getUserReadSet(userId: string) {
  if (!readStateByUser.has(userId)) readStateByUser.set(userId, new Set());
  return readStateByUser.get(userId)!;
}

function withUserReadState(items: HubNotification[], userId: string) {
  const readSet = getUserReadSet(userId);
  return items.map((item) => ({
    ...item,
    isRead: item.isRead || readSet.has(item.id),
  }));
}

function withRoleScopedLinks(items: HubNotification[], role: UserRole) {
  return items.map((item) => ({
    ...item,
    link: item.link ? resolveSharedPathForRole(item.link, role) : item.link,
  }));
}

export function getNotificationsForUser(userId: string, role: UserRole) {
  return withRoleScopedLinks(
    withUserReadState(
      notifications
        .filter((item) => item.userId === "*" || item.userId === userId)
        .filter((item) => matchesAudience(item.audience, role)),
      userId,
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    role,
  );
}

export function getAnnouncementsForUser(userId: string, role: UserRole) {
  return announcements
    .filter((item) => matchesAudience(item.audience, role))
    .map((item) => ({
      ...item,
      isRead: item.readBy.includes(userId),
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function getAnnouncementById(id: string) {
  return announcements.find((item) => item.id === id) ?? null;
}

function broadcast(event: RealtimeEvent) {
  for (const client of streamClients.values()) {
    try {
      client.send(event);
    } catch {
      streamClients.delete(client.id);
    }
  }
}

export function registerStreamClient(input: {
  userId: string;
  role: UserRole;
  send: StreamClient["send"];
}) {
  const id = nextId("stream");
  const client: StreamClient = { id, ...input };
  streamClients.set(id, client);

  client.send({
    type: "sync",
    payload: {
      notifications: getNotificationsForUser(input.userId, input.role),
      announcements: getAnnouncementsForUser(input.userId, input.role),
    },
  });

  return () => {
    streamClients.delete(id);
  };
}

export function markNotificationRead(id: string, userId: string, role: UserRole) {
  const item = notifications.find((entry) => entry.id === id);
  if (!item) return null;
  if (!matchesAudience(item.audience, role) && item.userId !== userId && item.userId !== "*") {
    return null;
  }

  getUserReadSet(userId).add(id);
  const updated = { ...item, isRead: true };
  broadcast({ type: "notification:update", payload: updated });
  return updated;
}

export function markAllNotificationsRead(userId: string, role: UserRole) {
  const visible = getNotificationsForUser(userId, role);
  const readSet = getUserReadSet(userId);
  for (const item of visible) {
    readSet.add(item.id);
    broadcast({ type: "notification:update", payload: { ...item, isRead: true } });
  }
  return visible.length;
}

export function clearNotificationsForUser(userId: string, role: UserRole) {
  const toRemove = notifications.filter(
    (item) =>
      (item.userId === userId || item.userId === "*") && matchesAudience(item.audience, role),
  );
  notifications = notifications.filter((item) => !toRemove.some((removed) => removed.id === item.id));
  for (const item of toRemove) {
    broadcast({ type: "notification:remove", payload: { id: item.id, userId } });
  }
  return toRemove.length;
}

export function markAnnouncementRead(announcementId: string, userId: string, role: UserRole) {
  const item = announcements.find((entry) => entry.id === announcementId);
  if (!item || !matchesAudience(item.audience, role)) return null;
  if (!item.readBy.includes(userId)) item.readBy.push(userId);

  const related = notifications.filter((entry) => entry.announcementId === announcementId);
  for (const entry of related) {
    getUserReadSet(userId).add(entry.id);
    broadcast({ type: "notification:update", payload: { ...entry, isRead: true } });
  }

  broadcast({ type: "announcement:update", payload: item });
  return item;
}

export function publishAnnouncement(input: {
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  priority?: HubAnnouncement["priority"];
  pinned?: boolean;
  audience?: Audience;
}) {
  const announcement: HubAnnouncement = {
    id: nextId("ann"),
    title: input.title.trim(),
    body: input.body.trim(),
    authorId: input.authorId,
    authorName: input.authorName,
    authorRole: input.authorRole,
    priority: input.priority ?? "normal",
    pinned: input.pinned ?? false,
    audience: input.audience ?? "all",
    createdAt: new Date().toISOString(),
    readBy: [],
  };

  announcements.unshift(announcement);

  const notification: HubNotification = {
    id: nextId("ntf"),
    userId: "*",
    audience: announcement.audience,
    type: NotificationType.ANNOUNCEMENT,
    title: announcement.title,
    message: announcement.body.slice(0, 140) + (announcement.body.length > 140 ? "…" : ""),
    link: `/shared/announcements/${announcement.id}`,
    isRead: false,
    createdAt: announcement.createdAt,
    actorName: announcement.authorName,
    actorAvatar: announcement.authorName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    announcementId: announcement.id,
  };

  notifications.unshift(notification);
  broadcast({ type: "announcement:new", payload: announcement });
  broadcast({ type: "notification:new", payload: notification });

  return { announcement, notification };
}

export function pushSystemNotification(input: Omit<HubNotification, "id" | "createdAt" | "isRead">) {
  const notification: HubNotification = {
    ...input,
    id: nextId("ntf"),
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notification);
  broadcast({ type: "notification:new", payload: notification });
  return notification;
}

let heartbeatStarted = false;

export function ensureDemoHeartbeat() {
  if (heartbeatStarted) return;
  heartbeatStarted = true;

  const samples = [
    {
      audience: [UserRole.STUDENT] as Audience,
      type: NotificationType.INFO,
      title: "Live update",
      message: "A class resource was updated in your course materials.",
      link: "/student/courses",
      actorName: "Course Portal",
      actorAvatar: "CP",
    },
    {
      audience: [UserRole.STUDENT, UserRole.TEACHER] as Audience,
      type: NotificationType.MESSAGE,
      title: "New activity in CS-2026",
      message: "Someone replied in the class group chat.",
      link: "/shared/messages?chat=conv-cs2026",
      actorName: "CS-2026 Class",
      actorAvatar: "CS",
    },
  ];

  let index = 0;
  setInterval(() => {
    if (streamClients.size === 0) return;
    const sample = samples[index % samples.length];
    index += 1;
    pushSystemNotification({
      userId: "*",
      audience: sample.audience,
      type: sample.type,
      title: sample.title,
      message: sample.message,
      link: sample.link,
      actorName: sample.actorName,
      actorAvatar: sample.actorAvatar,
    });
  }, 45000);
}

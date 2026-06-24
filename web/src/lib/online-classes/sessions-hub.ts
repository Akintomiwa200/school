import { UserRole } from "@/shared";

export type OnlineClassStatus = "scheduled" | "live" | "ended";

export type OnlineClassMaterial = {
  id: string;
  label: string;
  href: string;
};

export type OnlineClassSession = {
  id: string;
  title: string;
  subject: string;
  courseId?: string;
  teacherName: string;
  teacherAvatar: string;
  teacherRole: UserRole;
  description: string;
  startAt: string;
  endAt: string;
  status: OnlineClassStatus;
  meetingCode: string;
  joinCount: number;
  maxParticipants: number;
  hasRecording: boolean;
  recordingUrl?: string;
  materials: OnlineClassMaterial[];
  tags: string[];
  coverTone: string;
  audience: UserRole[] | "all";
};

export type ClassChatMessage = {
  id: string;
  sessionId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
};

export type OnlineClassEvent =
  | { type: "sync"; payload: { sessions: OnlineClassSession[] } }
  | { type: "session:update"; payload: OnlineClassSession }
  | { type: "chat:message"; payload: ClassChatMessage };

type StreamClient = {
  id: string;
  send: (event: OnlineClassEvent) => void;
};

const now = Date.now();
const hour = 60 * 60 * 1000;

function atOffset(hours: number, durationMin = 60) {
  const start = new Date(now + hours * hour);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

let sessions: OnlineClassSession[] = [
  {
    id: "cls-live-1",
    title: "Advanced Biology — Cell Division Lab",
    subject: "Biology",
    courseId: "3",
    teacherName: "Mr. Thompson",
    teacherAvatar: "MT",
    teacherRole: UserRole.TEACHER,
    description: "Live walkthrough of mitosis slides, breakout Q&A, and worksheet review.",
    ...atOffset(-0.25, 90),
    status: "live",
    meetingCode: "BIO-4821",
    joinCount: 18,
    maxParticipants: 35,
    hasRecording: false,
    materials: [
      { id: "m1", label: "Lab worksheet PDF", href: "/student/courses/3/materials" },
      { id: "m2", label: "Slide deck", href: "/student/courses/3/lessons" },
    ],
    tags: ["Lab", "Interactive"],
    coverTone: "from-emerald-200 via-teal-100 to-cyan-100",
    audience: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: "cls-up-1",
    title: "Mathematics — Quadratic Functions Workshop",
    subject: "Mathematics",
    courseId: "1",
    teacherName: "Mary Johnson",
    teacherAvatar: "MJ",
    teacherRole: UserRole.TEACHER,
    description: "Problem-solving session covering graphs, roots, and exam-style questions.",
    ...atOffset(2, 75),
    status: "scheduled",
    meetingCode: "MAT-9033",
    joinCount: 0,
    maxParticipants: 40,
    hasRecording: false,
    materials: [{ id: "m1", label: "Practice set", href: "/student/assignments" }],
    tags: ["Workshop", "Exam prep"],
    coverTone: "from-violet-200 via-purple-100 to-fuchsia-100",
    audience: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: "cls-up-2",
    title: "English Literature — Poetry Circle",
    subject: "English",
    teacherName: "James Brown",
    teacherAvatar: "JB",
    teacherRole: UserRole.TEACHER,
    description: "Discuss this week's anthology selections and peer feedback rounds.",
    ...atOffset(5, 60),
    status: "scheduled",
    meetingCode: "ENG-2210",
    joinCount: 0,
    maxParticipants: 28,
    hasRecording: false,
    materials: [{ id: "m1", label: "Anthology excerpt", href: "/student/library/books/ong-2" }],
    tags: ["Discussion"],
    coverTone: "from-rose-200 via-pink-100 to-fuchsia-100",
    audience: "all",
  },
  {
    id: "cls-end-1",
    title: "Physics — Waves & Light Recap",
    subject: "Physics",
    courseId: "2",
    teacherName: "Dr. Samuel Reed",
    teacherAvatar: "SR",
    teacherRole: UserRole.TEACHER,
    description: "Recorded recap of chapter 6 with demo clips and quiz answers.",
    ...atOffset(-30, 60),
    status: "ended",
    meetingCode: "PHY-1188",
    joinCount: 31,
    maxParticipants: 35,
    hasRecording: true,
    recordingUrl: "/shared/online-classes/cls-end-1/recording",
    materials: [{ id: "m1", label: "Chapter notes", href: "/student/library/books/ong-1/read" }],
    tags: ["Recording"],
    coverTone: "from-indigo-200 via-violet-100 to-purple-100",
    audience: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: "cls-up-3",
    title: "Staff PD — Digital Assessment Tools",
    subject: "Professional development",
    teacherName: "School Admin",
    teacherAvatar: "SA",
    teacherRole: UserRole.ADMIN,
    description: "Training on grading workflows, rubrics, and online submission review.",
    ...atOffset(26, 45),
    status: "scheduled",
    meetingCode: "PD-7001",
    joinCount: 0,
    maxParticipants: 50,
    hasRecording: false,
    materials: [],
    tags: ["Staff", "Training"],
    coverTone: "from-amber-200 via-orange-100 to-yellow-100",
    audience: [UserRole.TEACHER, UserRole.ADMIN, UserRole.HR],
  },
];

const chatBySession = new Map<string, ClassChatMessage[]>([
  [
    "cls-live-1",
    [
      {
        id: "chat-1",
        sessionId: "cls-live-1",
        authorName: "Mr. Thompson",
        authorAvatar: "MT",
        content: "Welcome everyone — we'll start with the mitosis demo in 2 minutes.",
        createdAt: new Date(now - 1000 * 60 * 8).toISOString(),
      },
      {
        id: "chat-2",
        sessionId: "cls-live-1",
        authorName: "Alex Johnson",
        authorAvatar: "AJ",
        content: "Ready when you are!",
        createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
      },
    ],
  ],
]);

const streamClients = new Map<string, StreamClient>();

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function matchesAudience(audience: OnlineClassSession["audience"], role: UserRole) {
  return audience === "all" || audience.includes(role);
}

function deriveStatus(session: OnlineClassSession): OnlineClassStatus {
  const start = new Date(session.startAt).getTime();
  const end = new Date(session.endAt).getTime();
  const t = Date.now();
  if (session.status === "ended") return "ended";
  if (t >= start && t <= end) return "live";
  if (t > end) return "ended";
  return "scheduled";
}

function normalizeSessions() {
  sessions = sessions.map((session) => ({
    ...session,
    status: deriveStatus(session),
  }));
}

function broadcast(event: OnlineClassEvent) {
  for (const client of streamClients.values()) {
    try {
      client.send(event);
    } catch {
      streamClients.delete(client.id);
    }
  }
}

export function getSessionsForRole(role: UserRole) {
  normalizeSessions();
  return sessions
    .filter((session) => matchesAudience(session.audience, role))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function getSessionById(id: string) {
  normalizeSessions();
  return sessions.find((session) => session.id === id) ?? null;
}

export function getSessionChat(sessionId: string) {
  return chatBySession.get(sessionId) ?? [];
}

export function registerClassStreamClient(send: StreamClient["send"]) {
  normalizeSessions();
  const id = nextId("cls-stream");
  streamClients.set(id, { id, send });
  send({ type: "sync", payload: { sessions } });
  return () => streamClients.delete(id);
}

export function joinSession(sessionId: string, participantName: string) {
  normalizeSessions();
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status === "ended") throw new Error("This class has ended");
  if (session.joinCount >= session.maxParticipants) throw new Error("Class is full");

  session.joinCount += 1;
  broadcast({ type: "session:update", payload: session });

  const message: ClassChatMessage = {
    id: nextId("chat"),
    sessionId,
    authorName: participantName,
    authorAvatar: participantName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    content: "joined the class",
    createdAt: new Date().toISOString(),
  };
  addChatMessage(message);
  return session;
}

export function addChatMessage(message: ClassChatMessage) {
  const list = chatBySession.get(message.sessionId) ?? [];
  list.push(message);
  chatBySession.set(message.sessionId, list.slice(-200));
  broadcast({ type: "chat:message", payload: message });
  return message;
}

export function postChatMessage(sessionId: string, authorName: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  return addChatMessage({
    id: nextId("chat"),
    sessionId,
    authorName,
    authorAvatar: authorName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    content: trimmed,
    createdAt: new Date().toISOString(),
  });
}

export function startSessionEarly(sessionId: string) {
  normalizeSessions();
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) throw new Error("Session not found");
  session.status = "live";
  session.startAt = new Date().toISOString();
  broadcast({ type: "session:update", payload: session });
  return session;
}

let tickerStarted = false;

export function ensureSessionTicker() {
  if (tickerStarted) return;
  tickerStarted = true;
  setInterval(() => {
    if (streamClients.size === 0) return;
    normalizeSessions();
    broadcast({ type: "sync", payload: { sessions } });
  }, 30000);
}

export function getClassStats(role: UserRole) {
  const list = getSessionsForRole(role);
  return {
    live: list.filter((item) => item.status === "live").length,
    upcoming: list.filter((item) => item.status === "scheduled").length,
    recordings: list.filter((item) => item.hasRecording).length,
  };
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RealtimeEvent =
  | { type: "sync"; payload: { notifications: unknown[]; announcements: unknown[] } }
  | { type: "notification:new"; payload: unknown }
  | { type: "notification:update"; payload: unknown }
  | { type: "notification:remove"; payload: { id: string; userId: string } }
  | { type: "announcement:new"; payload: unknown }
  | { type: "announcement:update"; payload: unknown };

const streamClients = new Map<string, { userId: string; role: string; send: (event: RealtimeEvent) => void }>();

let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastPollTime = new Date();

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function pollForChanges() {
  if (streamClients.size === 0) return;

  try {
    const newNotifications = await prisma.notification.findMany({
      where: { createdAt: { gt: lastPollTime } },
      take: 20,
    });

    const newAnnouncements = await prisma.announcement.findMany({
      where: { createdAt: { gt: lastPollTime } },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
      take: 10,
    });

    lastPollTime = new Date();

    for (const notification of newNotifications) {
      for (const client of streamClients.values()) {
        if (client.userId === notification.userId) {
          try {
            client.send({
              type: "notification:new",
              payload: {
                id: notification.id,
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                link: notification.link,
                isRead: notification.isRead,
                createdAt: notification.createdAt.toISOString(),
              },
            });
          } catch {
            streamClients.delete(client.userId);
          }
        }
      }
    }

    for (const announcement of newAnnouncements) {
      const event = {
        id: announcement.id,
        title: announcement.title,
        body: announcement.content,
        authorId: announcement.authorId,
        authorName: `${announcement.author.firstName} ${announcement.author.lastName}`,
        authorRole: announcement.author.role,
        priority: "normal" as const,
        pinned: announcement.isPinned,
        audience: announcement.targetRoles ?? "all",
        createdAt: announcement.publishedAt.toISOString(),
        readBy: [] as string[],
      };

      for (const client of streamClients.values()) {
        try {
          client.send({ type: "announcement:new", payload: event });
        } catch {
          streamClients.delete(client.userId);
        }
      }
    }
  } catch (error) {
    console.error("Notification poll error:", error);
  }
}

function startPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(pollForChanges, 10000);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  startPolling();

  const [notifications, announcements] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.announcement.findMany({
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 50,
    }).then((all) =>
      all.filter((a) => {
        if (a.targetRoles === null) return true;
        try {
          const roles = Array.isArray(a.targetRoles) ? a.targetRoles : JSON.parse(String(a.targetRoles));
          return Array.isArray(roles) && roles.includes(user.role);
        } catch {
          return true;
        }
      }),
    ),
  ]);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: RealtimeEvent) => {
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.payload)}\n\n`));
      };

      const clientKey = `${user.id}-${Date.now()}`;
      streamClients.set(clientKey, {
        userId: user.id,
        role: user.role,
        send,
      });

      send({
        type: "sync",
        payload: {
          notifications: notifications.map((n) => ({
            id: n.id,
            userId: n.userId,
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link,
            isRead: n.isRead,
            createdAt: n.createdAt.toISOString(),
          })),
          announcements: announcements.map((a) => ({
            id: a.id,
            title: a.title,
            body: a.content,
            authorId: a.authorId,
            authorName: `${a.author.firstName} ${a.author.lastName}`,
            authorRole: "ADMIN",
            priority: "normal",
            pinned: a.isPinned,
            audience: a.targetRoles ?? "all",
            createdAt: a.publishedAt.toISOString(),
            readBy: [],
          })),
        },
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        streamClients.delete(clientKey);
        controller.close();
        if (streamClients.size === 0 && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

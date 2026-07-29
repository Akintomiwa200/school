import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSuperAdminContext } from "@/lib/api/super-admin-helpers";

export const dynamic = "force-dynamic";

type SuperAdminStreamEvent =
  | { type: "super-admin:sync"; payload: { connectedAt: string } }
  | { type: "super-admin:invalidate"; payload: { reason: string; at: string } };

type StreamClient = {
  userId: string;
  lastPoll: Date;
  send: (event: SuperAdminStreamEvent) => void;
};

const streamClients = new Map<string, StreamClient>();
let pollInterval: ReturnType<typeof setInterval> | null = null;

async function hasSuperAdminChanges(client: StreamClient, since: Date): Promise<boolean> {
  const { userId } = client;

  const [
    schoolChanges,
    userChanges,
    auditChanges,
    settingsChanges,
    messageChanges,
    eventChanges,
    supportChanges,
    notificationChanges,
  ] = await Promise.all([
    prisma.school.count({
      where: { OR: [{ createdAt: { gt: since } }, { updatedAt: { gt: since } }] },
    }),
    prisma.user.count({
      where: { OR: [{ createdAt: { gt: since } }, { updatedAt: { gt: since } }] },
    }),
    prisma.auditLog.count({ where: { createdAt: { gt: since } } }),
    prisma.schoolSettings.count({ where: { updatedAt: { gt: since } } }),
    prisma.message.count({
      where: {
        createdAt: { gt: since },
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    }),
    prisma.event.count({ where: { createdAt: { gt: since } } }),
    prisma.supportTicket.count({
      where: {
        OR: [{ createdAt: { gt: since } }, { updatedAt: { gt: since } }],
      },
    }),
    prisma.notification.count({ where: { userId, createdAt: { gt: since } } }),
  ]);

  return (
    schoolChanges +
      userChanges +
      auditChanges +
      settingsChanges +
      messageChanges +
      eventChanges +
      supportChanges +
      notificationChanges >
    0
  );
}

async function pollForChanges() {
  if (streamClients.size === 0) return;

  for (const client of streamClients.values()) {
    try {
      const since = client.lastPoll;
      const changed = await hasSuperAdminChanges(client, since);
      client.lastPoll = new Date();

      if (changed) {
        client.send({
          type: "super-admin:invalidate",
          payload: { reason: "data_changed", at: new Date().toISOString() },
        });
      }
    } catch (error) {
      console.error("Super admin stream poll error:", error);
    }
  }
}

function startPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(pollForChanges, 8_000);
}

function stopPollingIfIdle() {
  if (streamClients.size === 0 && pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export async function GET(request: NextRequest) {
  let userId: string;

  try {
    const user = await getSuperAdminContext();
    userId = user.id;
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  startPolling();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: SuperAdminStreamEvent) => {
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.payload)}\n\n`));
      };

      const clientKey = `${userId}-${Date.now()}`;
      const client: StreamClient = {
        userId,
        lastPoll: new Date(),
        send,
      };
      streamClients.set(clientKey, client);

      send({ type: "super-admin:sync", payload: { connectedAt: new Date().toISOString() } });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        streamClients.delete(clientKey);
        stopPollingIfIdle();
        controller.close();
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

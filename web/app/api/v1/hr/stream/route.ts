import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getHrContext } from "@/lib/api/hr-helpers";

export const dynamic = "force-dynamic";

type HrStreamEvent =
  | { type: "hr:sync"; payload: { connectedAt: string } }
  | { type: "hr:invalidate"; payload: { reason: string; at: string } };

type StreamClient = {
  userId: string;
  lastPoll: Date;
  send: (event: HrStreamEvent) => void;
};

const streamClients = new Map<string, StreamClient>();
let pollInterval: ReturnType<typeof setInterval> | null = null;

async function hasHrChanges(client: StreamClient, since: Date): Promise<boolean> {
  const { userId } = client;

  const [
    staffChanges,
    leaveChanges,
    jobChanges,
    applicationChanges,
    messageChanges,
    eventChanges,
    supportChanges,
    notificationChanges,
  ] = await Promise.all([
    prisma.staff.count({ where: { updatedAt: { gt: since } } }),
    prisma.leaveRequest.count({
      where: {
        OR: [{ createdAt: { gt: since } }, { approvedAt: { gt: since } }],
      },
    }),
    prisma.jobPosting.count({
      where: {
        OR: [{ createdAt: { gt: since } }, { updatedAt: { gt: since } }],
      },
    }),
    prisma.jobApplication.count({ where: { createdAt: { gt: since } } }),
    prisma.message.count({
      where: {
        createdAt: { gt: since },
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    }),
    prisma.event.count({ where: { createdAt: { gt: since } } }),
    prisma.supportTicket.count({
      where: {
        userId,
        OR: [{ createdAt: { gt: since } }, { updatedAt: { gt: since } }],
      },
    }),
    prisma.notification.count({ where: { userId, createdAt: { gt: since } } }),
  ]);

  return (
    staffChanges +
      leaveChanges +
      jobChanges +
      applicationChanges +
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
      const changed = await hasHrChanges(client, since);
      client.lastPoll = new Date();

      if (changed) {
        client.send({
          type: "hr:invalidate",
          payload: { reason: "data_changed", at: new Date().toISOString() },
        });
      }
    } catch (error) {
      console.error("HR stream poll error:", error);
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
    const { user } = await getHrContext();
    userId = user.id;
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  startPolling();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: HrStreamEvent) => {
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

      send({ type: "hr:sync", payload: { connectedAt: new Date().toISOString() } });

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

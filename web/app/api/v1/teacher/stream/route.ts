import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getTeacherContext, getTeacherClassIds } from "@/lib/api/teacher-helpers";

export const dynamic = "force-dynamic";

type TeacherStreamEvent =
  | { type: "teacher:sync"; payload: { connectedAt: string } }
  | { type: "teacher:invalidate"; payload: { reason: string; at: string } };

type StreamClient = {
  staffId: string;
  userId: string;
  classIds: string[];
  lastPoll: Date;
  send: (event: TeacherStreamEvent) => void;
};

const streamClients = new Map<string, StreamClient>();
let pollInterval: ReturnType<typeof setInterval> | null = null;

async function hasTeacherChanges(client: StreamClient, since: Date): Promise<boolean> {
  const { staffId, userId, classIds } = client;
  if (classIds.length === 0) return false;

  const [
    assignmentChanges,
    submissionChanges,
    courseChanges,
    materialChanges,
    attendanceChanges,
    gradeChanges,
    messageChanges,
    eventChanges,
    supportChanges,
    notificationChanges,
    onlineClassChanges,
  ] = await Promise.all([
    prisma.assignment.count({
      where: { course: { teacherId: staffId }, updatedAt: { gt: since } },
    }),
    prisma.assignmentSubmission.count({
      where: {
        assignment: { course: { teacherId: staffId } },
        OR: [{ createdAt: { gt: since } }, { gradedAt: { gt: since } }],
      },
    }),
    prisma.course.count({
      where: { teacherId: staffId, updatedAt: { gt: since } },
    }),
    prisma.courseMaterial.count({
      where: { course: { teacherId: staffId }, createdAt: { gt: since } },
    }),
    prisma.attendance.count({
      where: { classId: { in: classIds }, createdAt: { gt: since } },
    }),
    prisma.grade.count({
      where: { student: { classId: { in: classIds } }, createdAt: { gt: since } },
    }),
    prisma.message.count({
      where: {
        createdAt: { gt: since },
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    }),
    prisma.event.count({
      where: { createdAt: { gt: since } },
    }),
    prisma.supportTicket.count({
      where: {
        userId,
        OR: [{ createdAt: { gt: since } }, { updatedAt: { gt: since } }],
      },
    }),
    prisma.notification.count({
      where: { userId, createdAt: { gt: since } },
    }),
    prisma.onlineClass.count({
      where: {
        hostId: userId,
        createdAt: { gt: since },
      },
    }),
  ]);

  return (
    assignmentChanges +
      submissionChanges +
      courseChanges +
      materialChanges +
      attendanceChanges +
      gradeChanges +
      messageChanges +
      eventChanges +
      supportChanges +
      notificationChanges +
      onlineClassChanges >
    0
  );
}

async function pollForChanges() {
  if (streamClients.size === 0) return;

  for (const client of streamClients.values()) {
    try {
      const since = client.lastPoll;
      const changed = await hasTeacherChanges(client, since);
      client.lastPoll = new Date();

      if (changed) {
        client.send({
          type: "teacher:invalidate",
          payload: { reason: "data_changed", at: new Date().toISOString() },
        });
      }
    } catch (error) {
      console.error("Teacher stream poll error:", error);
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
  let staffId: string;
  let userId: string;
  let classIds: string[];

  try {
    const { user, staff } = await getTeacherContext();
    staffId = staff.id;
    userId = user.id;
    classIds = await getTeacherClassIds(staff.id);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  startPolling();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: TeacherStreamEvent) => {
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.payload)}\n\n`));
      };

      const clientKey = `${staffId}-${Date.now()}`;
      const client: StreamClient = {
        staffId,
        userId,
        classIds,
        lastPoll: new Date(),
        send,
      };
      streamClients.set(clientKey, client);

      send({ type: "teacher:sync", payload: { connectedAt: new Date().toISOString() } });

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

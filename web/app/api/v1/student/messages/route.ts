import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { receiverId: user.id },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = messages.map((m) => ({
      id: m.id,
      subject: m.subject,
      content: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt,
      sender: {
        id: m.sender.id,
        name: `${m.sender.firstName} ${m.sender.lastName}`,
        avatar: m.sender.avatar,
        initials: `${m.sender.firstName[0]}${m.sender.lastName[0]}`.toUpperCase(),
      },
    }));

    const unreadCount = messages.filter((m) => !m.isRead).length;

    return NextResponse.json(
      createApiResponse({ messages: result, unreadCount }, "Student messages loaded"),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("messages_error", error instanceof Error ? error.message : "Failed to load messages"),
      { status: 500 },
    );
  }
}

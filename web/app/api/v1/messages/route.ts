import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError } from "@/shared";
import { mapMessagesToChat } from "@/lib/messages/message-mapper";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
    }

    const rows = await prisma.message.findMany({
      where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatar: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const payload = mapMessagesToChat(user.id, rows);
    return NextResponse.json(createApiResponse(payload, "Messages loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load messages";
    return NextResponse.json(createApiError("error", message), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
    }

    const body = await request.json();
    const receiverId = body.receiverId as string | undefined;
    const content = body.content?.trim() as string | undefined;

    if (!receiverId || !content) {
      return NextResponse.json(createApiError("validation_error", "receiverId and content are required"), { status: 400 });
    }

    if (receiverId === user.id) {
      return NextResponse.json(createApiError("validation_error", "Cannot message yourself"), { status: 400 });
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json(createApiError("not_found", "Recipient not found"), { status: 404 });
    }

    const created = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
        subject: body.subject?.trim() ?? null,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatar: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatar: true } },
      },
    });

    const mapped = mapMessagesToChat(user.id, [created]);
    const message = mapped.messages[0]!;

    return NextResponse.json(createApiResponse(message, "Message sent"), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json(createApiError("error", message), { status: 500 });
  }
}

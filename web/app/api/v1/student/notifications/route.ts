import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    const result = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    return NextResponse.json(
      createApiResponse({ notifications: result, unreadCount }, "Student notifications loaded"),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("notifications_error", error instanceof Error ? error.message : "Failed to load notifications"),
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id || user.role !== UserRole.STUDENT) {
      return NextResponse.json(createApiError("forbidden", "Student access required"), { status: 403 });
    }

    const body = (await request.json()) as { action?: string; id?: string };

    if (body.action === "read-all") {
      const result = await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json(createApiResponse({ count: result.count }, "All notifications marked as read"));
    }

    if (body.action === "read" && body.id) {
      const result = await prisma.notification.updateMany({
        where: { id: body.id, userId: user.id },
        data: { isRead: true },
      });
      if (result.count === 0) {
        return NextResponse.json(createApiError("not_found", "Notification not found"), { status: 404 });
      }
      return NextResponse.json(createApiResponse({ id: body.id, isRead: true }, "Notification marked as read"));
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      createApiError("notification_error", error instanceof Error ? error.message : "Update failed"),
      { status: 500 },
    );
  }
}

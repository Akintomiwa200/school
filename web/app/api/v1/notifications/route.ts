import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
    }

    const [notifications, announcements, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.announcement.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 20,
        include: {
          author: { select: { firstName: true, lastName: true, role: true } },
        },
      }).then((all) =>
        all.filter((a) => {
          if (a.targetRoles === null) return true;
          try {
            const roles = Array.isArray(a.targetRoles) ? a.targetRoles : JSON.parse(String(a.targetRoles));
            return Array.isArray(roles) && roles.includes(user!.role);
          } catch {
            return true;
          }
        }),
      ),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    return NextResponse.json(
      createApiResponse(
        {
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
            authorRole: a.author.role,
            priority: "normal" as const,
            pinned: a.isPinned,
            audience: a.targetRoles ?? "all",
            createdAt: a.publishedAt.toISOString(),
            readBy: [] as string[],
          })),
          unreadCount,
        },
        "Notifications loaded",
      ),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("notification_error", error instanceof Error ? error.message : "Failed to load notifications"),
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
    }

    const body = (await request.json()) as { action?: string; id?: string };

    if (body.action === "read-all") {
      const result = await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json(createApiResponse({ count: result.count }, "All notifications marked as read"));
    }

    if (body.action === "clear-all") {
      const result = await prisma.notification.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json(createApiResponse({ count: result.count }, "Notifications cleared"));
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
      { status: 400 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, UserRole } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
    }

    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    const filtered = announcements.filter((a) => {
      if (a.targetRoles === null) return true;
      try {
        const roles = Array.isArray(a.targetRoles) ? a.targetRoles : JSON.parse(String(a.targetRoles));
        return Array.isArray(roles) && roles.includes(user.role);
      } catch {
        return true;
      }
    });

    return NextResponse.json(
      createApiResponse(
        filtered.map((a) => ({
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
        "Announcements loaded",
      ),
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("announcement_error", error instanceof Error ? error.message : "Failed to load announcements"),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
    }
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(createApiError("forbidden", "You cannot publish announcements"), { status: 403 });
    }

    const body = (await request.json()) as {
      title?: string;
      body?: string;
      priority?: string;
      pinned?: boolean;
      audience?: UserRole[] | "all";
    };

    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json(createApiError("validation_error", "title and body are required"), { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: body.title.trim(),
        content: body.body.trim(),
        authorId: user.id,
        isPinned: body.pinned ?? false,
        targetRoles: body.audience === "all" ? null : (body.audience ?? null),
      },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
      },
    });

    return NextResponse.json(
      createApiResponse(
        {
          id: announcement.id,
          title: announcement.title,
          body: announcement.content,
          authorId: announcement.authorId,
          authorName: `${announcement.author.firstName} ${announcement.author.lastName}`,
          authorRole: announcement.author.role,
          priority: body.priority ?? "normal",
          pinned: announcement.isPinned,
          audience: announcement.targetRoles ?? "all",
          createdAt: announcement.publishedAt.toISOString(),
          readBy: [],
        },
        "Announcement published",
      ),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      createApiError("announcement_error", error instanceof Error ? error.message : "Publish failed"),
      { status: 400 },
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

    if (body.action === "read" && body.id) {
      return NextResponse.json(createApiResponse({ id: body.id, isRead: true }, "Announcement marked as read"));
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      createApiError("announcement_error", error instanceof Error ? error.message : "Update failed"),
      { status: 400 },
    );
  }
}

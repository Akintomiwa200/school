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

    const allAnnouncements = await prisma.announcement.findMany({
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    const announcements = allAnnouncements.filter((a) => {
      if (a.targetRoles === null) return true;
      try {
        const roles = Array.isArray(a.targetRoles) ? a.targetRoles : JSON.parse(String(a.targetRoles));
        return Array.isArray(roles) && roles.includes("STUDENT");
      } catch {
        return true;
      }
    });

    const result = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      author: `${a.author.firstName} ${a.author.lastName}`,
      authorRole: a.author.role,
      isPinned: a.isPinned,
      publishedAt: a.publishedAt,
      createdAt: a.createdAt,
    }));

    return NextResponse.json(createApiResponse(result, "Student announcements loaded"));
  } catch (error) {
    return NextResponse.json(
      createApiError("announcements_error", error instanceof Error ? error.message : "Failed to load announcements"),
      { status: 500 },
    );
  }
}

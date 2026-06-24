import { NextRequest, NextResponse } from "next/server";
import {
  getAnnouncementsForUser,
  markAnnouncementRead,
  publishAnnouncement,
} from "@/lib/notifications/realtime-hub";
import { canPublishAnnouncements, resolveRealtimeUser } from "@/lib/notifications/realtime-auth";
import { createApiError, createApiResponse, UserRole } from "@/shared";

export async function GET() {
  const user = await resolveRealtimeUser();
  return NextResponse.json(
    createApiResponse(getAnnouncementsForUser(user.id, user.role), "Announcements loaded"),
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await resolveRealtimeUser();
    if (!canPublishAnnouncements(user.role)) {
      return NextResponse.json(createApiError("forbidden", "You cannot publish announcements"), {
        status: 403,
      });
    }

    const body = (await request.json()) as {
      title?: string;
      body?: string;
      priority?: "normal" | "important" | "urgent";
      pinned?: boolean;
      audience?: UserRole[] | "all";
    };

    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json(createApiError("validation_error", "title and body are required"), {
        status: 400,
      });
    }

    const result = publishAnnouncement({
      title: body.title,
      body: body.body,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      priority: body.priority,
      pinned: body.pinned,
      audience: body.audience,
    });

    return NextResponse.json(createApiResponse(result, "Announcement published"), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      createApiError("announcement_error", error instanceof Error ? error.message : "Publish failed"),
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await resolveRealtimeUser();
    const body = (await request.json()) as { action?: string; id?: string };

    if (body.action === "read" && body.id) {
      const updated = markAnnouncementRead(body.id, user.id, user.role);
      if (!updated) {
        return NextResponse.json(createApiError("not_found", "Announcement not found"), { status: 404 });
      }
      return NextResponse.json(createApiResponse(updated, "Announcement marked as read"));
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      createApiError("announcement_error", error instanceof Error ? error.message : "Update failed"),
      { status: 400 },
    );
  }
}

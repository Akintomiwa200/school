import { NextRequest, NextResponse } from "next/server";
import {
  clearNotificationsForUser,
  getAnnouncementsForUser,
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/realtime-hub";
import { resolveRealtimeUser } from "@/lib/notifications/realtime-auth";
import { createApiError, createApiResponse } from "@/shared";

export async function GET() {
  const user = await resolveRealtimeUser();
  return NextResponse.json(
    createApiResponse(
      {
        notifications: getNotificationsForUser(user.id, user.role),
        announcements: getAnnouncementsForUser(user.id, user.role),
      },
      "Notifications loaded",
    ),
  );
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await resolveRealtimeUser();
    const body = (await request.json()) as { action?: string; id?: string };

    if (body.action === "read-all") {
      const count = markAllNotificationsRead(user.id, user.role);
      return NextResponse.json(createApiResponse({ count }, "All notifications marked as read"));
    }

    if (body.action === "clear-all") {
      const count = clearNotificationsForUser(user.id, user.role);
      return NextResponse.json(createApiResponse({ count }, "Notifications cleared"));
    }

    if (body.action === "read" && body.id) {
      const updated = markNotificationRead(body.id, user.id, user.role);
      if (!updated) {
        return NextResponse.json(createApiError("not_found", "Notification not found"), { status: 404 });
      }
      return NextResponse.json(createApiResponse(updated, "Notification marked as read"));
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      createApiError("notification_error", error instanceof Error ? error.message : "Update failed"),
      { status: 400 },
    );
  }
}

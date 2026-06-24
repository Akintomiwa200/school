import { NextResponse } from "next/server";
import { getAnnouncementById } from "@/lib/notifications/realtime-hub";
import { resolveRealtimeUser } from "@/lib/notifications/realtime-auth";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ announcementId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await resolveRealtimeUser();
  const { announcementId } = await context.params;
  const announcement = getAnnouncementById(announcementId);

  if (!announcement) {
    return NextResponse.json(createApiError("not_found", "Announcement not found"), { status: 404 });
  }

  const audienceOk =
    announcement.audience === "all" || announcement.audience.includes(user.role);

  if (!audienceOk) {
    return NextResponse.json(createApiError("forbidden", "Announcement not available"), { status: 403 });
  }

  return NextResponse.json(
    createApiResponse(
      {
        ...announcement,
        isRead: announcement.readBy.includes(user.id),
      },
      "Announcement loaded",
    ),
  );
}

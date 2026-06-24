import { NextRequest, NextResponse } from "next/server";
import { getSessionById, postChatMessage, startSessionEarly } from "@/lib/online-classes/sessions-hub";
import { canHostOnlineClasses, resolveClassUser } from "@/lib/online-classes/class-auth";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await resolveClassUser();
  const { sessionId } = await context.params;
  const session = getSessionById(sessionId);

  if (!session) {
    return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
  }

  const audienceOk = session.audience === "all" || session.audience.includes(user.role);
  if (!audienceOk) {
    return NextResponse.json(createApiError("forbidden", "Session not available"), { status: 403 });
  }

  return NextResponse.json(createApiResponse(session, "Session loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await resolveClassUser();
    const { sessionId } = await context.params;
    const body = (await request.json()) as { action?: string; content?: string };

    if (body.action === "start" && canHostOnlineClasses(user.role)) {
      const session = startSessionEarly(sessionId);
      return NextResponse.json(createApiResponse(session, "Class started"));
    }

    if (body.action === "chat" && body.content) {
      const session = getSessionById(sessionId);
      if (!session) {
        return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
      }
      const message = postChatMessage(sessionId, user.name, body.content);
      return NextResponse.json(createApiResponse(message, "Message sent"));
    }

    return NextResponse.json(createApiError("validation_error", "Unsupported action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      createApiError("session_error", error instanceof Error ? error.message : "Update failed"),
      { status: 400 },
    );
  }
}

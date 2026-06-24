import { NextResponse } from "next/server";
import { joinSession } from "@/lib/online-classes/sessions-hub";
import { resolveClassUser } from "@/lib/online-classes/class-auth";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await resolveClassUser();
    const { sessionId } = await context.params;
    const session = joinSession(sessionId, user.name);
    return NextResponse.json(createApiResponse(session, "Joined class"), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      createApiError("join_error", error instanceof Error ? error.message : "Could not join"),
      { status: 400 },
    );
  }
}

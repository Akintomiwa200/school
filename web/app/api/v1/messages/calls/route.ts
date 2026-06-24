import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { requireAuth } from "@/lib/auth";
import { createCall } from "@/lib/messages/signaling-store";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = (await request.json()) as {
      conversationId?: string;
      callType?: "voice" | "video";
    };

    if (!body.conversationId || !body.callType) {
      return NextResponse.json(
        createApiResponse(null, "conversationId and callType are required"),
        { status: 400 },
      );
    }

    const session = createCall(body.conversationId, body.callType, user.id);
    return NextResponse.json(createApiResponse(session, "Call created"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create call";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

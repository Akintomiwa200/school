import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { requireAuth } from "@/lib/auth";
import { addSignal, endCall, getCall, getSignalsSince } from "@/lib/messages/signaling-store";

type RouteContext = {
  params: Promise<{ callId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth();
    const { callId } = await context.params;
    const since = Number(request.nextUrl.searchParams.get("since") ?? "0");
    const call = getCall(callId);

    if (!call) {
      return NextResponse.json({ success: false, error: "Call not found" }, { status: 404 });
    }

    const signals = getSignalsSince(callId, since);
    return NextResponse.json(createApiResponse({ signals }, "Signals fetched"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch signals";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { callId } = await context.params;
    const body = (await request.json()) as {
      type?: "offer" | "answer" | "ice" | "hangup" | "decline";
      payload?: unknown;
      fromUserId?: string;
    };

    if (!body.type) {
      return NextResponse.json({ success: false, error: "Signal type required" }, { status: 400 });
    }

    const call = getCall(callId);
    if (!call) {
      return NextResponse.json({ success: false, error: "Call not found" }, { status: 404 });
    }

    const signal = addSignal(callId, {
      type: body.type,
      payload: body.payload,
      fromUserId: body.fromUserId ?? user.id,
    });

    if (body.type === "hangup" || body.type === "decline") {
      endCall(callId);
    }

    return NextResponse.json(createApiResponse(signal, "Signal posted"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not post signal";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

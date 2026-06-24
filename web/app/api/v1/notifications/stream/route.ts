import { NextRequest } from "next/server";
import {
  ensureDemoHeartbeat,
  registerStreamClient,
  type RealtimeEvent,
} from "@/lib/notifications/realtime-hub";
import { resolveRealtimeUser } from "@/lib/notifications/realtime-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await resolveRealtimeUser();
  ensureDemoHeartbeat();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: RealtimeEvent) => {
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.payload)}\n\n`));
      };

      const unregister = registerStreamClient({
        userId: user.id,
        role: user.role,
        send,
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        unregister();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

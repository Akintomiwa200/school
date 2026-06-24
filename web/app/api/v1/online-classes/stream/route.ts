import { NextRequest } from "next/server";
import {
  ensureSessionTicker,
  registerClassStreamClient,
  type OnlineClassEvent,
} from "@/lib/online-classes/sessions-hub";
import { resolveClassUser } from "@/lib/online-classes/class-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await resolveClassUser();
  ensureSessionTicker();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: OnlineClassEvent) => {
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.payload)}\n\n`));
      };

      const unregister = registerClassStreamClient(send);

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

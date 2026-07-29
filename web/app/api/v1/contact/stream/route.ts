import { NextRequest } from "next/server";
import { getContactMessagesUpdatedAt } from "@/lib/api/contact-messages-store";
import {
  registerContactStreamClient,
  unregisterContactStreamClient,
  type ContactStreamEvent,
} from "@/lib/api/contact-events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: ContactStreamEvent) => {
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.payload)}\n\n`));
      };

      const clientKey = `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      registerContactStreamClient(clientKey, { send });

      send({
        type: "contact:sync",
        payload: { connectedAt: new Date().toISOString(), updatedAt: getContactMessagesUpdatedAt() },
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        unregisterContactStreamClient(clientKey);
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

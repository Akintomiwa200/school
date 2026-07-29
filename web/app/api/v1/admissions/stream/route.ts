import { NextRequest } from "next/server";
import { getAdmissionConfig } from "@/lib/api/admission-config-store";
import {
  registerAdmissionStreamClient,
  unregisterAdmissionStreamClient,
  type AdmissionStreamEvent,
} from "@/lib/api/admission-config-events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: AdmissionStreamEvent) => {
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.payload)}\n\n`));
      };

      const clientKey = `admissions-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      registerAdmissionStreamClient(clientKey, { send });

      const config = getAdmissionConfig();
      send({
        type: "admissions:sync",
        payload: { connectedAt: new Date().toISOString(), updatedAt: config.updatedAt },
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        unregisterAdmissionStreamClient(clientKey);
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

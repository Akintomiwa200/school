import { NextResponse } from "next/server";
import { getClassStats, getSessionsForRole } from "@/lib/online-classes/sessions-hub";
import { resolveClassUser } from "@/lib/online-classes/class-auth";
import { createApiResponse } from "@/shared";

export async function GET() {
  const user = await resolveClassUser();
  const sessions = getSessionsForRole(user.role);
  return NextResponse.json(
    createApiResponse({ sessions, stats: getClassStats(user.role) }, "Online classes loaded"),
  );
}

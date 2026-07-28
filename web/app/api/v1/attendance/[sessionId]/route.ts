import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const body = await request.json();
    const present = Number(body.present ?? 0);
    const absent = Number(body.absent ?? 0);

    const parts = sessionId.split("-");
    const datePart = parts[parts.length - 1];
    const classId = parts.slice(0, parts.length - 1).join("-");

    const classIds = await prisma.course.findMany({ select: { classId: true }, distinct: ["classId"] });
    const validClassId = classIds.some((c) => c.classId === classId) ? classId : null;

    if (!validClassId || !datePart) {
      return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
    }

    return NextResponse.json(createApiResponse({ id: sessionId, present, absent, marked: true }, "Attendance marked"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark attendance";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("error", message), { status });
  }
}

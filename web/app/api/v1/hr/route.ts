import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getHrContext } from "@/lib/api/hr-helpers";
import { buildHrPortalPayload } from "@/lib/hr/map-hr-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getHrContext();

    const [staffRows, leaveRows, jobRows] = await Promise.all([
      prisma.staff.findMany({
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { joiningDate: "desc" },
      }),
      prisma.leaveRequest.findMany({
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.jobPosting.findMany({
        include: { _count: { select: { applications: true } } },
        orderBy: { postedAt: "desc" },
      }),
    ]);

    const payload = buildHrPortalPayload({ staffRows, leaveRows, jobRows });
    return NextResponse.json(createApiResponse(payload, "HR data loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load HR data";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json(createApiError("hr_load_failed", message), { status });
  }
}

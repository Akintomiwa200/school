import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getHrContext } from "@/lib/api/hr-helpers";
import type { HrJobDetail } from "@/lib/hr/map-hr-api";
import type { JobStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ jobId: string }> };

function mapJobDetail(job: {
  id: string;
  title: string;
  department: string;
  description: string | null;
  status: JobStatus;
  postedAt: Date;
  updatedAt: Date;
  applications: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: Date;
  }[];
}): HrJobDetail {
  return {
    id: job.id,
    title: job.title,
    department: job.department,
    description: job.description ?? undefined,
    applicants: job.applications.length,
    posted: job.postedAt.toISOString().slice(0, 10),
    status: job.status.toLowerCase() as HrJobDetail["status"],
    applications: job.applications.map((app) => ({
      id: app.id,
      name: app.name,
      email: app.email,
      phone: app.phone,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
    })),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await getHrContext();
    const { jobId } = await context.params;

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { applications: { orderBy: { createdAt: "desc" } } },
    });

    if (!job) {
      return NextResponse.json(createApiError("not_found", "Job posting not found"), { status: 404 });
    }

    return NextResponse.json(createApiResponse(mapJobDetail(job), "Job posting loaded"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load job posting";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json(createApiError("job_load_failed", message), { status });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getHrContext();
    const { jobId } = await context.params;
    const body = (await request.json()) as { status?: "open" | "interviewing" | "closed" };

    const statusMap = {
      open: "OPEN",
      interviewing: "INTERVIEWING",
      closed: "CLOSED",
    } as const;

    if (!body.status || !(body.status in statusMap)) {
      return NextResponse.json(createApiError("invalid_status", "status must be open, interviewing, or closed"), {
        status: 400,
      });
    }

    const job = await prisma.jobPosting.update({
      where: { id: jobId },
      data: { status: statusMap[body.status] },
      include: { applications: { orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json(createApiResponse(mapJobDetail(job), "Job posting updated"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update job posting";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json(createApiError("job_update_failed", message), { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getHrContext } from "@/lib/api/hr-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await getHrContext();
    const body = (await request.json()) as {
      title?: string;
      department?: string;
      description?: string;
    };

    if (!body.title?.trim() || !body.department?.trim()) {
      return NextResponse.json(createApiError("validation_error", "title and department are required"), {
        status: 400,
      });
    }

    const job = await prisma.jobPosting.create({
      data: {
        title: body.title.trim(),
        department: body.department.trim(),
        description: body.description?.trim() || null,
        status: "OPEN",
      },
      include: { _count: { select: { applications: true } } },
    });

    return NextResponse.json(
      createApiResponse(
        {
          id: job.id,
          title: job.title,
          department: job.department,
          applicants: job._count.applications,
          posted: job.postedAt.toISOString().slice(0, 10),
          status: "open",
          description: job.description ?? undefined,
        },
        "Job posting created",
      ),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create job posting";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json(createApiError("job_create_failed", message), { status });
  }
}

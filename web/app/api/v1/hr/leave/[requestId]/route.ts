import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getHrContext } from "@/lib/api/hr-helpers";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const { user } = await getHrContext();
    const { requestId } = await params;
    const body = (await request.json()) as { action?: "approve" | "reject" };

    if (body.action !== "approve" && body.action !== "reject") {
      return NextResponse.json(createApiError("invalid_action", "action must be approve or reject"), {
        status: 400,
      });
    }

    const existing = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!existing) {
      return NextResponse.json(createApiError("not_found", "Leave request not found"), { status: 404 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: body.action === "approve" ? "APPROVED" : "REJECTED",
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    });

    return NextResponse.json(createApiResponse(updated, `Leave request ${body.action}d`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update leave request";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json(createApiError("leave_update_failed", message), { status });
  }
}

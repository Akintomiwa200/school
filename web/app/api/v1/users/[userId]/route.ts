import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { getSuperAdminContext } from "@/lib/api/super-admin-helpers";

type RouteContext = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const actor = await getSuperAdminContext();
    const { userId } = await context.params;
    const body = (await request.json()) as { action?: string };

    if (body.action !== "suspend" && body.action !== "restore") {
      return NextResponse.json(createApiError("validation", "action must be suspend or restore"), { status: 400 });
    }

    if (actor.id === userId) {
      return NextResponse.json(createApiError("forbidden", "You cannot change your own account status"), { status: 403 });
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true, role: true },
    });

    if (!existing) {
      return NextResponse.json(createApiError("not_found", "User not found"), { status: 404 });
    }

    const isActive = body.action === "restore";

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        school: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: isActive ? "User restored" : "User suspended",
        entity: "User",
        entityId: userId,
        newValue: { email: existing.email, isActive },
      },
    });

    return NextResponse.json(
      createApiResponse(
        {
          id: updated.id,
          name: `${updated.firstName} ${updated.lastName}`,
          email: updated.email,
          role: updated.role,
          school: updated.school?.name ?? "Unassigned",
          status: updated.isActive ? ("active" as const) : ("suspended" as const),
          lastLogin: updated.createdAt.toISOString().split("T")[0],
        },
        isActive ? "User restored" : "User suspended",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json(createApiError("user_update_failed", message), { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse } from "@/shared";

type RouteContext = { params: Promise<{ schoolId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { schoolId } = await context.params;
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json(createApiError("not_found", "School not found"), { status: 404 });
  }

  const [studentCount, adminCount, teacherCount, staffCount, totalUsers] = await Promise.all([
    prisma.user.count({ where: { schoolId, role: "STUDENT" } }),
    prisma.user.count({ where: { schoolId, role: "ADMIN" } }),
    prisma.user.count({ where: { schoolId, role: "TEACHER" } }),
    prisma.user.count({ where: { schoolId, role: "NON_TEACHING_STAFF" } }),
    prisma.user.count({ where: { schoolId } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    where: { schoolId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(
    createApiResponse({
      id: school.id,
      name: school.name,
      location: school.location ?? "",
      email: school.email ?? "",
      phone: school.phone ?? "",
      logo: school.logo ?? "",
      website: school.website ?? "",
      status: school.status,
      createdAt: school.createdAt.toISOString().split("T")[0],
      stats: {
        students: studentCount,
        admins: adminCount,
        teachers: teacherCount,
        staff: staffCount,
        totalUsers,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        joinedAt: u.createdAt.toISOString().split("T")[0],
      })),
    }, "School loaded"),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { schoolId } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const existing = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!existing) {
    return NextResponse.json(createApiError("not_found", "School not found"), { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name);
  if (body.location !== undefined) data.location = body.location ? String(body.location) : null;
  if (body.email !== undefined) data.email = body.email ? String(body.email) : null;
  if (body.phone !== undefined) data.phone = body.phone ? String(body.phone) : null;
  if (body.logo !== undefined) data.logo = body.logo ? String(body.logo) : null;
  if (body.website !== undefined) data.website = body.website ? String(body.website) : null;
  if (body.status !== undefined) data.status = String(body.status);

  const updated = await prisma.school.update({ where: { id: schoolId }, data });

  return NextResponse.json(
    createApiResponse({
      id: updated.id,
      name: updated.name,
      location: updated.location ?? "",
      email: updated.email ?? "",
      phone: updated.phone ?? "",
      status: updated.status,
      createdAt: updated.createdAt.toISOString().split("T")[0],
    }, "School updated"),
  );
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { schoolId } = await context.params;
  const existing = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!existing) {
    return NextResponse.json(createApiError("not_found", "School not found"), { status: 404 });
  }

  await prisma.school.update({ where: { id: schoolId }, data: { status: "suspended" } });
  return NextResponse.json(createApiResponse({ id: schoolId }, "School suspended"));
}

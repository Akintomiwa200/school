import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError, getPaginationParams, createPaginationMeta } from "@/shared";
import { getSuperAdminContext } from "@/lib/api/super-admin-helpers";

export async function GET(request: NextRequest) {
  try {
    await getSuperAdminContext();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json(createApiError("unauthorized", message), { status });
  }

  const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const result = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
    school: u.school?.name ?? "Unassigned",
    status: u.isActive ? ("active" as const) : ("suspended" as const),
    lastLogin: u.createdAt.toISOString().split("T")[0],
  }));

  return NextResponse.json(createApiResponse(result, "Users loaded", createPaginationMeta(total, page, limit)));
}

export async function POST(request: NextRequest) {
  try {
    await getSuperAdminContext();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json(createApiError("unauthorized", message), { status });
  }

  const body = (await request.json()) as Record<string, unknown>;
  if (!body.firstName || !body.lastName || !body.email || !body.role) {
    return NextResponse.json(createApiError("validation", "firstName, lastName, email, and role are required"), { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      firstName: String(body.firstName),
      lastName: String(body.lastName),
      email: String(body.email),
      role: String(body.role) as "ADMIN" | "TEACHER" | "STUDENT" | "ACCOUNTANT" | "HR" | "LIBRARIAN" | "RECEPTIONIST" | "NON_TEACHING_STAFF" | "PARENT",
      schoolId: body.schoolId ? String(body.schoolId) : null,
    },
  });

  return NextResponse.json(
    createApiResponse({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      school: "Unassigned",
      status: "active" as const,
      lastLogin: "Never",
    }, "User created"),
    { status: 201 },
  );
}

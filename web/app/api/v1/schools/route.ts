import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError, getPaginationParams, createPaginationMeta } from "@/shared";

export async function GET(request: NextRequest) {
  const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { location: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [schools, total] = await Promise.all([
    prisma.school.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.school.count({ where }),
  ]);

  const counts = await Promise.all(
    schools.map((s) =>
      prisma.user.groupBy({
        by: ["role"],
        where: { schoolId: s.id },
        _count: true,
      })
    ),
  );

  const result = schools.map((s, i) => {
    const roleCounts = counts[i];
    const students = roleCounts.find((r) => r.role === "STUDENT")?._count ?? 0;
    const admins = roleCounts.find((r) => r.role === "ADMIN")?._count ?? 0;
    const teachers = roleCounts.find((r) => r.role === "TEACHER")?._count ?? 0;
    return {
      id: s.id,
      name: s.name,
      location: s.location ?? "",
      students,
      admins,
      teachers,
      status: s.status as "active" | "provisioning" | "suspended",
      createdAt: s.createdAt.toISOString().split("T")[0],
    };
  });

  return NextResponse.json(createApiResponse(result, "Schools loaded", createPaginationMeta(total, page, limit)));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  if (!body.name) {
    return NextResponse.json(createApiError("validation", "name is required"), { status: 400 });
  }

  const school = await prisma.school.create({
    data: {
      name: String(body.name),
      location: body.location ? String(body.location) : null,
      email: body.email ? String(body.email) : null,
      phone: body.phone ? String(body.phone) : null,
      status: "provisioning",
    },
  });

  return NextResponse.json(
    createApiResponse({
      id: school.id,
      name: school.name,
      location: school.location ?? "",
      students: 0,
      admins: 0,
      teachers: 0,
      status: school.status as "active" | "provisioning" | "suspended",
      createdAt: school.createdAt.toISOString().split("T")[0],
    }, "School created"),
    { status: 201 },
  );
}

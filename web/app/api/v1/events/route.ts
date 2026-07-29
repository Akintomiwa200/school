import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createApiResponse, createApiError, getPaginationParams, createPaginationMeta } from "@/shared";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
  }

  const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { location: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json(createApiResponse(events, "Events loaded", createPaginationMeta(total, page, limit)));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(createApiError("unauthorized", "Authentication required"), { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  if (!body.title || !body.startDate || !body.endDate) {
    return NextResponse.json(createApiError("validation", "title, startDate, and endDate are required"), { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title: String(body.title),
      description: body.description ? String(body.description) : null,
      startDate: new Date(String(body.startDate)),
      endDate: new Date(String(body.endDate)),
      location: body.location ? String(body.location) : null,
      isPublic: body.isPublic !== false,
      createdBy: user.id,
    },
  });

  return NextResponse.json(createApiResponse(event, "Event created"), { status: 201 });
}

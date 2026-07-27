import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError, getPaginationParams, createPaginationMeta } from "@/shared";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") ?? "platform";

  if (scope === "finance") {
    const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);

    const where = search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" as const } },
            { entity: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const result = logs.map((l) => ({
      id: l.id,
      actor: l.user ? `${l.user.firstName} ${l.user.lastName}` : "System",
      action: l.action,
      reference: l.entity,
      details: l.newValue ? JSON.stringify(l.newValue) : "",
      timestamp: l.createdAt.toISOString(),
    }));

    return NextResponse.json(createApiResponse(result, "Audit log loaded", createPaginationMeta(total, page, limit)));
  }

  // Platform scope
  const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);

  const where = search
    ? {
        OR: [
          { action: { contains: search, mode: "insensitive" as const } },
          { entity: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const result = logs.map((l) => ({
    id: l.id,
    action: l.action,
    actor: l.user ? `${l.user.firstName} ${l.user.lastName}` : "System",
    target: l.entity + (l.entityId ? ` (${l.entityId.slice(0, 8)})` : ""),
    school: "Main School",
    timestamp: l.createdAt.toISOString(),
    severity: l.action.toLowerCase().includes("delete") || l.action.toLowerCase().includes("suspend")
      ? "warning"
      : l.action.toLowerCase().includes("fail")
        ? "critical"
        : "info" as "info" | "warning" | "critical",
  }));

  return NextResponse.json(createApiResponse(result, "Audit log loaded", createPaginationMeta(total, page, limit)));
}

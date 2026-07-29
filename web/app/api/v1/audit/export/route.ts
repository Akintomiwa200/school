import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exportAuditEventsCsv } from "@/lib/api/audit-entity-store";
import { getSuperAdminContext } from "@/lib/api/super-admin-helpers";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportPlatformAuditCsv(
  rows: Array<{
    action: string;
    entity: string;
    entityId: string | null;
    createdAt: Date;
    user: { firstName: string; lastName: string; email: string } | null;
  }>,
) {
  const header = ["Timestamp", "Actor", "Action", "Entity", "Entity ID"].join(",");
  const lines = rows.map((row) =>
    [
      row.createdAt.toISOString(),
      row.user ? `${row.user.firstName} ${row.user.lastName}`.trim() : "System",
      row.action,
      row.entity,
      row.entityId ?? "",
    ]
      .map((cell) => escapeCsv(String(cell)))
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    await getSuperAdminContext();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const scope = request.nextUrl.searchParams.get("scope") ?? "platform";
  const date = new Date().toISOString().slice(0, 10);

  if (scope === "platform") {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    const csv = exportPlatformAuditCsv(logs);
    const filename = `platform-audit-${date}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const csv = exportAuditEventsCsv("finance");
  const filename = `finance-audit-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

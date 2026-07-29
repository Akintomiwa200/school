import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse } from "@/shared";
import { getSuperAdminContext } from "@/lib/api/super-admin-helpers";

export async function GET() {
  try {
    await getSuperAdminContext();
  } catch {
    return NextResponse.json({ success: false, error: { code: "unauthorized", message: "Unauthorized" } }, { status: 401 });
  }

  const [schoolCount, userCount, auditCount, recentAudit, schools] = await Promise.all([
    prisma.school.count(),
    prisma.user.count(),
    prisma.auditLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.school.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const stats = [
    { id: "schools", label: "Schools", value: String(schoolCount), hint: "Connected institutions", tone: "purple" as const },
    { id: "users", label: "Users", value: userCount.toLocaleString(), hint: "All platform accounts", tone: "blue" as const },
    { id: "audit", label: "Audit events", value: auditCount.toLocaleString(), hint: "Last 30 days", tone: "green" as const },
    { id: "health", label: "System health", value: "99.9%", hint: "Uptime this month", tone: "orange" as const },
  ];

  const studentCounts = await Promise.all(
    schools.map(() => prisma.student.count()),
  );

  const schoolList = schools.map((s, i) => ({
    id: s.id,
    name: s.name,
    location: s.location ?? "",
    students: studentCounts[i] ?? 0,
    status: s.status === "active" ? "Active" : s.status === "provisioning" ? "Provisioning" : "Suspended",
  }));

  const auditLog = recentAudit.map((a) => ({
    id: a.id,
    action: a.action,
    actor: a.user ? `${a.user.firstName} ${a.user.lastName}` : "System",
    target: a.entity,
    time: formatRelativeTime(a.createdAt),
  }));

  return NextResponse.json(
    createApiResponse({ stats, schools: schoolList, auditLog }, "Dashboard loaded"),
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await requireAuth();
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    include: { user: { select: { id: true, name: true, email: true } }, replies: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  const data = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    category: t.category ?? "",
    description: t.description,
    status: t.status.toLowerCase(),
    priority: t.priority.toLowerCase(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    replyCount: t.replies.length,
    user: t.user,
  }));
  return NextResponse.json({ success: true, data, message: "Support tickets loaded" });
}

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const body = await request.json();
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject: body.subject,
      description: body.description,
      category: body.category ?? null,
      priority: (body.priority?.toUpperCase() ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(
    { success: true, data: { ...ticket, status: ticket.status.toLowerCase(), priority: ticket.priority.toLowerCase(), createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString() }, message: "Support ticket created" },
    { status: 201 },
  );
}

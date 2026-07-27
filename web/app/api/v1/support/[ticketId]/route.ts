import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await requireAuth();
  const { ticketId } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      replies: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!ticket) return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
  if (ticket.userId !== user.id && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  const data = {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category ?? "",
    description: ticket.description,
    status: ticket.status.toLowerCase(),
    priority: ticket.priority.toLowerCase(),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    user: ticket.user,
    replies: ticket.replies.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
  };
  return NextResponse.json({ success: true, data, message: "Support ticket loaded" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await requireAuth();
  const { ticketId } = await params;
  const body = await request.json();
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
  if (ticket.userId !== user.id && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      ...(body.status && { status: body.status.toUpperCase() }),
      ...(body.priority && { priority: body.priority.toUpperCase() }),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ success: true, data: { ...updated, status: updated.status.toLowerCase(), priority: updated.priority.toLowerCase(), createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() }, message: "Ticket updated" });
}

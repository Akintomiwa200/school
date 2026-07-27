import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const replies = await prisma.supportReply.findMany({
    where: { ticketId },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
  const data = replies.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
  }));
  return NextResponse.json({ success: true, data, message: "Replies loaded" });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await requireAuth();
  const { ticketId } = await params;
  const body = await request.json();
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
  if (ticket.userId !== user.id && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  const reply = await prisma.supportReply.create({
    data: { ticketId, userId: user.id, content: body.content },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  await prisma.supportTicket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } });
  return NextResponse.json(
    { success: true, data: { id: reply.id, content: reply.content, createdAt: reply.createdAt.toISOString(), user: reply.user }, message: "Reply sent" },
    { status: 201 },
  );
}

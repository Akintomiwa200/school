import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { addSupportTicket, getMutableSupportTickets } from "@/lib/api/memory-stores";

export async function GET() {
  return jsonData(getMutableSupportTickets(), "Support tickets loaded");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const created = addSupportTicket({
    subject: body.subject,
    category: body.category,
    priority: body.priority,
    description: body.description,
  });
  return jsonData(created, "Support ticket created", 201);
}

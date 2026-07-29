import { NextRequest, NextResponse } from "next/server";
import { getContactStaffContext } from "@/lib/api/contact-helpers";
import { getContactMessage, updateContactMessage } from "@/lib/api/contact-messages-store";
import type { ContactMessageStatus } from "@/lib/contact/contact-messages-data";
import { createApiError, createApiResponse } from "@/shared";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    await getContactStaffContext();
    const { messageId } = await params;
    const message = getContactMessage(messageId);
    if (!message) {
      return NextResponse.json(createApiError("not_found", "Message not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(message, "Contact message loaded"));
  } catch {
    return NextResponse.json(createApiError("unauthorized", "Unauthorized"), { status: 401 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    await getContactStaffContext();
    const { messageId } = await params;
    const body = (await request.json()) as { status?: ContactMessageStatus };
    const updated = updateContactMessage(messageId, { status: body.status });
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Message not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(updated, "Contact message updated"));
  } catch {
    return NextResponse.json(createApiError("unauthorized", "Unauthorized"), { status: 401 });
  }
}

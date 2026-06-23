import { NextRequest, NextResponse } from "next/server";
import {
  sendContactConfirmationEmail,
  sendContactFormEmail,
} from "@/lib/email";
import { contactFormSchema, createApiError, createApiResponse } from "@/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid input"),
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;

    await sendContactFormEmail({ name, email, subject, message });

    try {
      await sendContactConfirmationEmail(email, name);
    } catch (error) {
      console.error("Contact confirmation email failed:", error);
    }

    return NextResponse.json(
      createApiResponse(null, "Message sent! We will get back to you within 1–2 business days."),
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      createApiError(
        "server_error",
        error instanceof Error ? error.message : "Could not send your message. Please try again.",
      ),
      { status: 500 },
    );
  }
}

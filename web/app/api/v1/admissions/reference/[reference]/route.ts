import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getAdmissionByReference } from "@/lib/api/admin-entity-store";

type RouteContext = { params: Promise<{ reference: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { reference } = await context.params;
  const admission = getAdmissionByReference(decodeURIComponent(reference));
  if (!admission) {
    return NextResponse.json(createApiError("not_found", "Application not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(admission, "Application loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { reference } = await context.params;
  const admission = getAdmissionByReference(decodeURIComponent(reference));
  if (!admission) {
    return NextResponse.json(createApiError("not_found", "Application not found"), { status: 404 });
  }

  const body = (await request.json()) as { action?: "pay" };
  if (body.action !== "pay") {
    return NextResponse.json(createApiError("validation", "Unsupported action"), { status: 400 });
  }

  const { recordAdmissionPayment } = await import("@/lib/api/admin-entity-store");
  const updated = recordAdmissionPayment(admission.id);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Payment could not be recorded"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(updated, "Payment successful"));
}

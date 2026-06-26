import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { jsonList } from "@/lib/api/route-handlers";
import { addAdmission, getMutableAdmissions } from "@/lib/api/admin-entity-store";
import { getAdmissionConfig } from "@/lib/api/admission-config-store";
import type { UploadedAdmissionDocument } from "@/components/admissions/admissions-workflow-data";

export async function GET(request: NextRequest) {
  return jsonList(getMutableAdmissions(), "Admissions loaded", request, [
    "applicantName",
    "guardian",
    "gradeApplied",
    "email",
    "reference",
  ]);
}

export async function POST(request: NextRequest) {
  const config = getAdmissionConfig();
  if (!config.applicationOpen) {
    return NextResponse.json(createApiError("closed", "Applications are currently closed"), { status: 403 });
  }

  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gradeApplied?: string;
    guardian?: string;
    documents?: UploadedAdmissionDocument[];
    authPreference?: "email" | "google" | "apple";
  };

  if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.gradeApplied || !body.guardian) {
    return NextResponse.json(createApiError("validation", "Missing required fields"), { status: 400 });
  }

  const admission = addAdmission({
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.trim(),
    gradeApplied: body.gradeApplied,
    guardian: body.guardian.trim(),
    documents: body.documents,
    authPreference: body.authPreference,
  });

  return NextResponse.json(createApiResponse(admission, "Application submitted"), { status: 201 });
}

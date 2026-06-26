import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import {
  getAdmissionConfig,
  resetAdmissionConfig,
  setSchoolType,
  updateAdmissionConfig,
} from "@/lib/api/admission-config-store";
import type { AdmissionConfig, SchoolType } from "@/components/admissions/admissions-workflow-data";

export async function GET() {
  return NextResponse.json(createApiResponse(getAdmissionConfig(), "Admission config loaded"));
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as Partial<AdmissionConfig> & {
    action?: "reset" | "set_school_type";
    schoolType?: SchoolType;
  };

  if (body.action === "reset") {
    return NextResponse.json(createApiResponse(resetAdmissionConfig(body.schoolType), "Config reset"));
  }

  if (body.action === "set_school_type" && body.schoolType) {
    return NextResponse.json(createApiResponse(setSchoolType(body.schoolType), "School type updated"));
  }

  const { action: _action, schoolType: _schoolType, ...patch } = body;
  return NextResponse.json(createApiResponse(updateAdmissionConfig(patch), "Admission config saved"));
}

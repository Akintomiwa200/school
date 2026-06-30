import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { getPayrollSettings, updatePayrollSettings } from "@/lib/api/payroll-settings-store";

export async function GET() {
  return NextResponse.json(createApiResponse(getPayrollSettings(), "Payroll settings loaded"));
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as Partial<ReturnType<typeof getPayrollSettings>>;
  const updated = updatePayrollSettings(body);
  return NextResponse.json(createApiResponse(updated, "Payroll settings updated"));
}

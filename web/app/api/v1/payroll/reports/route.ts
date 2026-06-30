import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { getPayrollReports } from "@/lib/api/payroll-reports-service";

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();
  return NextResponse.json(createApiResponse(getPayrollReports(year), "Payroll reports loaded"));
}

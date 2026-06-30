import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  addAllStaffToPayrollRun,
  addStaffToPayrollRun,
  addSyntheticToPayrollRun,
  getPayrollRunById,
} from "@/lib/api/payroll-entity-store";
import { logPayrollEvent } from "@/lib/api/finance-audit-helpers";

type RouteContext = { params: Promise<{ runId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { runId } = await context.params;
  const run = getPayrollRunById(runId);

  if (!run || run.status !== "processing") {
    return NextResponse.json(createApiError("not_found", "Payroll run not found or not editable"), {
      status: 404,
    });
  }

  const body = (await request.json()) as { staffId?: string; action?: string };
  let detail;

  if (body.action === "add_all") {
    detail = addAllStaffToPayrollRun(runId);
  } else if (body.staffId) {
    detail = addStaffToPayrollRun(runId, body.staffId);
  } else {
    detail = addSyntheticToPayrollRun(runId);
  }

  if (!detail) {
    return NextResponse.json(createApiError("validation_error", "Unable to add employee to payroll run"), {
      status: 400,
    });
  }

  logPayrollEvent("employee_added", detail.run, `Employee added to ${detail.run.period} payroll`);
  return NextResponse.json(createApiResponse(detail, "Employee added to payroll run"), { status: 201 });
}

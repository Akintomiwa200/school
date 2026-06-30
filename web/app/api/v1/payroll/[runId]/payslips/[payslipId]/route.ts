import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  getPayslipById,
  getPayrollRunById,
  removePayslipFromRun,
  updatePayslipInRun,
} from "@/lib/api/payroll-entity-store";
import { logPayrollEvent } from "@/lib/api/finance-audit-helpers";
import { payslipPrintHtml, toPayslipPayload } from "@/lib/api/payroll-payslip-service";

type RouteContext = { params: Promise<{ runId: string; payslipId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { runId, payslipId } = await context.params;
  const payslip = getPayslipById(runId, payslipId);

  if (!payslip) {
    return NextResponse.json(createApiError("not_found", "Payslip not found"), { status: 404 });
  }

  const payload = toPayslipPayload(payslip);
  const format = request.nextUrl.searchParams.get("format");

  if (format === "html" || format === "download") {
    const html = payslipPrintHtml(payload);
    const filename = `payslip-${payslip.employeeId}-${payslip.period.replace(/\s+/g, "-").toLowerCase()}.html`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...(format === "download"
          ? { "Content-Disposition": `attachment; filename="${filename}"` }
          : {}),
      },
    });
  }

  return NextResponse.json(createApiResponse(payload, "Payslip loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { runId, payslipId } = await context.params;
  const body = (await request.json()) as { grossPay?: number };
  const detail = updatePayslipInRun(runId, payslipId, body.grossPay ?? 0);

  if (!detail) {
    return NextResponse.json(createApiError("not_found", "Payslip not found or run not editable"), {
      status: 404,
    });
  }

  const run = getPayrollRunById(runId);
  if (run) {
    logPayrollEvent("payslip_updated", run, `Payslip ${payslipId} gross pay updated`);
  }

  const payslip = getPayslipById(runId, payslipId);
  return NextResponse.json(createApiResponse({ detail, payslip }, "Payslip updated"));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { runId, payslipId } = await context.params;
  const detail = removePayslipFromRun(runId, payslipId);

  if (!detail) {
    return NextResponse.json(createApiError("not_found", "Payslip not found or run not editable"), {
      status: 404,
    });
  }

  logPayrollEvent("employee_removed", detail.run, `Employee removed from ${detail.run.period} payroll`);
  return NextResponse.json(createApiResponse(detail, "Employee removed from payroll run"));
}

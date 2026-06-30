import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  activateDraftRun,
  cancelPayrollRun,
  deleteDraftRun,
  duplicatePayrollRun,
  finalizePayrollRun,
  getPayrollRunDetail,
} from "@/lib/api/payroll-entity-store";
import { logPayrollEvent } from "@/lib/api/finance-audit-helpers";
import { payslipsToCsv } from "@/lib/api/payroll-payslip-service";

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { runId } = await context.params;
  const detail = getPayrollRunDetail(runId);

  if (!detail) {
    return NextResponse.json(createApiError("not_found", "Payroll run not found"), { status: 404 });
  }

  const format = request.nextUrl.searchParams.get("format");
  if (format === "csv") {
    const csv = payslipsToCsv(detail.payslips);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payroll-${runId}.csv"`,
      },
    });
  }

  return NextResponse.json(createApiResponse(detail, "Payroll run loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { runId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    finalizedBy?: string;
    disbursementRef?: string;
    period?: string;
  };

  if (body.action === "activate") {
    const updated = activateDraftRun(runId);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Payroll run not found or not a draft"), {
        status: 404,
      });
    }
    logPayrollEvent("activated", updated, `${updated.period} payroll run prepared`);
    return NextResponse.json(createApiResponse(getPayrollRunDetail(runId), "Payroll run activated"));
  }

  if (body.action === "cancel") {
    const updated = cancelPayrollRun(runId);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Payroll run not found or not processing"), {
        status: 404,
      });
    }
    logPayrollEvent("cancelled", updated, `${updated.period} payroll run cancelled`);
    return NextResponse.json(createApiResponse(updated, "Payroll run cancelled"));
  }

  if (body.action === "delete") {
    const deleted = deleteDraftRun(runId);
    if (!deleted) {
      return NextResponse.json(createApiError("not_found", "Payroll run not found or not a draft"), {
        status: 404,
      });
    }
    return NextResponse.json(createApiResponse(deleted, "Draft payroll run deleted"));
  }

  if (body.action === "duplicate") {
    const run = duplicatePayrollRun(runId, body.period);
    if (!run) {
      return NextResponse.json(createApiError("validation_error", "Unable to duplicate payroll run"), {
        status: 400,
      });
    }
    logPayrollEvent("started", run, `Duplicated payroll run for ${run.period}`);
    return NextResponse.json(createApiResponse(run, "Payroll run duplicated"), { status: 201 });
  }

  const updated = finalizePayrollRun(runId, body.finalizedBy, body.disbursementRef);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Payroll run not found or not processing"), {
      status: 404,
    });
  }
  logPayrollEvent(
    "finalized",
    updated,
    `${updated.period} payroll finalized — ${updated.staffCount} staff · ref ${updated.disbursementRef}`,
    body.finalizedBy,
  );
  return NextResponse.json(createApiResponse(getPayrollRunDetail(runId), "Payroll run finalized"));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { runId } = await context.params;
  const deleted = deleteDraftRun(runId);
  if (!deleted) {
    return NextResponse.json(createApiError("not_found", "Payroll run not found or not a draft"), {
      status: 404,
    });
  }
  return NextResponse.json(createApiResponse(deleted, "Draft payroll run deleted"));
}

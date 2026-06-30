import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { logPayrollEvent } from "@/lib/api/finance-audit-helpers";
import { getMutablePayrollRuns, startPayrollRun } from "@/lib/api/payroll-entity-store";

export async function GET() {
  return jsonData(getMutablePayrollRuns(), "Payroll runs loaded");
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    period?: string;
    notes?: string;
    duplicateFromRunId?: string;
  };

  const period =
    body.period ?? new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const run = startPayrollRun({
    period,
    notes: body.notes,
    duplicateFromRunId: body.duplicateFromRunId,
  });

  if (!run) {
    return jsonData(
      { error: "Unable to start payroll — a run may already be in progress or period exists" },
      "Validation failed",
      400,
    );
  }

  logPayrollEvent("started", run, `${run.period} payroll run started — ${run.staffCount} staff`);
  return jsonData(run, "Payroll run started", 201);
}

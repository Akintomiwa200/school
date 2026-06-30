import { NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { getMutableReconciliationItems, getReconciliationSummary } from "@/lib/api/audit-entity-store";
import { getMutableLedgerPayments } from "@/lib/api/payment-entity-store";

export type ReconciliationWorkspaceResponse = {
  items: ReturnType<typeof getMutableReconciliationItems>;
  summary: ReturnType<typeof getReconciliationSummary>;
  availablePayments: ReturnType<typeof getMutableLedgerPayments>;
};

export async function GET() {
  const payload: ReconciliationWorkspaceResponse = {
    items: getMutableReconciliationItems(),
    summary: getReconciliationSummary(),
    availablePayments: getMutableLedgerPayments().filter((payment) => payment.status === "completed"),
  };

  return NextResponse.json(createApiResponse(payload, "Reconciliation workspace loaded"));
}

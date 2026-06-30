import {
  AUDIT_EVENTS,
  RECONCILIATION_ITEMS,
  RECONCILIATION_PERIOD,
  type AuditAction,
  type AuditEntityType,
  type AuditEvent,
  type ReconciliationItem,
  type ReconciliationItemStatus,
} from "@/components/dashboard/accountant/accountant-data";
import { getMutableLedgerPayments } from "@/lib/api/payment-entity-store";

let auditEvents: AuditEvent[] = [...AUDIT_EVENTS];
let reconciliationItems: ReconciliationItem[] = [...RECONCILIATION_ITEMS];

function nextAuditId() {
  return `aud-${Date.now()}`;
}

export function getMutableAuditEvents() {
  return auditEvents;
}

export function getAuditEventById(id: string) {
  return auditEvents.find((event) => event.id === id);
}

export function addAuditEvent(input: {
  action: AuditAction;
  actor: string;
  reference: string;
  entityType: AuditEntityType;
  entityId?: string;
  amount?: number;
  details: string;
  actorEmail?: string;
  ipAddress?: string;
  metadata?: Record<string, string>;
  changes?: AuditEvent["changes"];
}): AuditEvent {
  const event: AuditEvent = {
    id: nextAuditId(),
    timestamp: new Date().toISOString(),
    ...input,
  };
  auditEvents = [event, ...auditEvents];
  return event;
}

export function getAuditStats() {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const eventsThisWeek = auditEvents.filter(
    (event) => new Date(event.timestamp).getTime() >= weekAgo,
  ).length;
  const flaggedReconciliation = reconciliationItems.filter(
    (item) => item.status === "flagged" || item.status === "unmatched",
  ).length;

  return {
    totalEvents: auditEvents.length,
    eventsThisWeek,
    flaggedReconciliation,
    reconciliationPeriod: RECONCILIATION_PERIOD,
  };
}

export function getMutableReconciliationItems() {
  return reconciliationItems;
}

export function getReconciliationItemById(id: string) {
  return reconciliationItems.find((item) => item.id === id);
}

export function getReconciliationSummary() {
  const unmatched = reconciliationItems.filter((item) => item.status === "unmatched").length;
  const matched = reconciliationItems.filter((item) => item.status === "matched").length;
  const flagged = reconciliationItems.filter((item) => item.status === "flagged").length;

  return {
    period: RECONCILIATION_PERIOD,
    total: reconciliationItems.length,
    unmatched,
    matched,
    flagged,
    needsReview: unmatched + flagged,
  };
}

export function matchReconciliationItem(itemId: string, paymentId: string, actor = "J. Accountant") {
  const item = reconciliationItems.find((entry) => entry.id === itemId);
  if (!item) return null;

  const payment = getMutableLedgerPayments().find((p) => p.id === paymentId);
  if (!payment) return null;

  reconciliationItems = reconciliationItems.map((entry) =>
    entry.id === itemId
      ? {
          ...entry,
          status: "matched" as ReconciliationItemStatus,
          matchedPaymentId: payment.id,
          matchedReceiptId: payment.receiptId,
          flagReason: undefined,
        }
      : entry,
  );

  const updated = reconciliationItems.find((entry) => entry.id === itemId)!;

  addAuditEvent({
    action: "reconciliation",
    actor,
    reference: payment.receiptId,
    entityType: "payment",
    entityId: payment.id,
    amount: payment.amount,
    details: `Matched bank line ${item.bankReference} to payment ${payment.receiptId}`,
    metadata: {
      reconciliationItemId: item.id,
      bankReference: item.bankReference,
      period: item.period,
    },
  });

  return updated;
}

export function unmatchReconciliationItem(itemId: string, actor = "J. Accountant") {
  const item = reconciliationItems.find((entry) => entry.id === itemId);
  if (!item) return null;

  const previousReceipt = item.matchedReceiptId;

  reconciliationItems = reconciliationItems.map((entry) =>
    entry.id === itemId
      ? {
          ...entry,
          status: "unmatched" as ReconciliationItemStatus,
          matchedPaymentId: undefined,
          matchedReceiptId: undefined,
          flagReason: undefined,
        }
      : entry,
  );

  const updated = reconciliationItems.find((entry) => entry.id === itemId)!;

  addAuditEvent({
    action: "reconciliation",
    actor,
    reference: item.bankReference,
    entityType: "reconciliation",
    entityId: item.id,
    amount: item.bankAmount,
    details: previousReceipt
      ? `Unmatched bank line ${item.bankReference} from payment ${previousReceipt}`
      : `Cleared match on bank line ${item.bankReference}`,
    metadata: { reconciliationItemId: item.id, period: item.period },
  });

  return updated;
}

export function flagReconciliationItem(itemId: string, reason: string, actor = "J. Accountant") {
  const item = reconciliationItems.find((entry) => entry.id === itemId);
  if (!item) return null;

  reconciliationItems = reconciliationItems.map((entry) =>
    entry.id === itemId
      ? { ...entry, status: "flagged" as ReconciliationItemStatus, flagReason: reason }
      : entry,
  );

  const updated = reconciliationItems.find((entry) => entry.id === itemId)!;

  addAuditEvent({
    action: "reconciliation",
    actor,
    reference: item.bankReference,
    entityType: "reconciliation",
    entityId: item.id,
    amount: item.bankAmount,
    details: `Flagged for review: ${reason}`,
    metadata: { reconciliationItemId: item.id, period: item.period },
  });

  return updated;
}

export function exportAuditEventsCsv(scope: "finance" | "platform" = "finance") {
  if (scope !== "finance") {
    return "id,timestamp,action,actor,reference,amount,details\n";
  }

  const header = "id,timestamp,action,actor,reference,entity_type,entity_id,amount,details\n";
  const rows = auditEvents.map((event) =>
    [
      event.id,
      event.timestamp,
      event.action,
      csvEscape(event.actor),
      csvEscape(event.reference),
      event.entityType,
      event.entityId ?? "",
      event.amount ?? "",
      csvEscape(event.details),
    ].join(","),
  );

  return header + rows.join("\n");
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

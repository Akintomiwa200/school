"use client";

import { useSyncExternalStore } from "react";
import type { FeeItem, FeeStatus, PaymentRecord } from "./student-fees-data";

export type LiveFeePayment = {
  id: string;
  feeIds: string[];
  amount: number;
  method: PaymentRecord["method"];
  date: string;
  receiptId: string;
  description: string;
  status: "completed";
  paidAt: Date;
  gatewaySessionId?: string;
  cardLast4?: string;
  receiptGeneratedAt?: string;
};

type LiveFeeUpdate = {
  paidAmount: number;
  status: FeeStatus;
};

let livePayments: LiveFeePayment[] = [];
let liveFeeUpdates: Record<string, LiveFeeUpdate> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getPaymentsSnapshot() {
  return livePayments;
}

function getUpdatesSnapshot() {
  return liveFeeUpdates;
}

export function useLiveFeePayments() {
  return useSyncExternalStore(subscribe, getPaymentsSnapshot, () => []);
}

export function useLiveFeeUpdates() {
  return useSyncExternalStore(subscribe, getUpdatesSnapshot, () => ({}));
}

export function getLiveFeePayments() {
  return livePayments;
}

export function getLiveFeeUpdates() {
  return liveFeeUpdates;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildReceiptId(date: Date) {
  const key = formatDateKey(date).replace(/-/g, "");
  const suffix = String(livePayments.length + 1).padStart(3, "0");
  return `RCP-${key}-${suffix}`;
}

function resolveFeeStatus(amount: number, paidAmount: number): FeeStatus {
  if (paidAmount >= amount) return "paid";
  if (paidAmount > 0) return "partial";
  return "pending";
}

export function addLiveFeePayment(input: {
  id?: string;
  feeIds: string[];
  amount: number;
  method: PaymentRecord["method"];
  description: string;
  feeSnapshots: Array<{ id: string; amount: number; paidAmount: number; label: string }>;
  paidAt?: Date;
  receiptId?: string;
  gatewaySessionId?: string;
  cardLast4?: string;
  receiptGeneratedAt?: string;
}) {
  const paidAt = input.paidAt ?? new Date();
  const paymentId = input.id ?? `live-pay-${Date.now()}`;

  const payment: LiveFeePayment = {
    id: paymentId,
    feeIds: input.feeIds,
    amount: input.amount,
    method: input.method,
    date: formatDateKey(paidAt),
    receiptId: input.receiptId ?? buildReceiptId(paidAt),
    description: input.description,
    status: "completed",
    paidAt,
    gatewaySessionId: input.gatewaySessionId,
    cardLast4: input.cardLast4,
    receiptGeneratedAt: input.receiptGeneratedAt ?? new Date().toISOString(),
  };

  livePayments = [payment, ...livePayments];

  let remaining = input.amount;
  for (const fee of input.feeSnapshots) {
    if (remaining <= 0) break;
    const balance = fee.amount - fee.paidAmount;
    if (balance <= 0) continue;

    const applied = Math.min(balance, remaining);
    remaining -= applied;

    const current = liveFeeUpdates[fee.id] ?? { paidAmount: fee.paidAmount, status: "pending" as FeeStatus };
    const paidAmount = current.paidAmount + applied;
    liveFeeUpdates[fee.id] = {
      paidAmount,
      status: resolveFeeStatus(fee.amount, paidAmount),
    };
  }

  emit();
  return payment;
}

export function getLivePaymentById(paymentId: string) {
  return livePayments.find((payment) => payment.id === paymentId);
}

export function livePaymentToRecord(payment: LiveFeePayment): PaymentRecord {
  return {
    id: payment.id,
    date: payment.date,
    description: payment.description,
    amount: payment.amount,
    method: payment.method,
    receiptId: payment.receiptId,
    status: payment.status,
    feeIds: payment.feeIds,
  };
}

export function mergeFeeItem(base: FeeItem): FeeItem {
  const update = liveFeeUpdates[base.id];
  if (!update) return base;
  return { ...base, paidAmount: update.paidAmount, status: update.status };
}

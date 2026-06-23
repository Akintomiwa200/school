type PendingCheckout = {
  feeIds: string[];
  amount: number;
  method: string;
  status: "pending" | "completed";
  createdAt: number;
  cardLast4?: string;
};

const PAYABLE_FEES: Record<string, { amount: number; paidAmount: number; label: string }> = {
  "fee-tuition-spring": { amount: 3200, paidAmount: 2000, label: "Spring Term Tuition" },
  "fee-lab": { amount: 450, paidAmount: 0, label: "Computer Science Lab Fee" },
  "fee-library": { amount: 180, paidAmount: 180, label: "Library & Resources" },
  "fee-activities": { amount: 220, paidAmount: 0, label: "Student Activities" },
  "fee-transport": { amount: 600, paidAmount: 600, label: "School Transport" },
};

const pendingCheckouts = new Map<string, PendingCheckout>();

function calcExpectedTotal(feeIds: string[]) {
  let total = 0;
  const lines: Array<{ feeId: string; label: string; balance: number }> = [];

  for (const feeId of feeIds) {
    const fee = PAYABLE_FEES[feeId];
    if (!fee) throw new Error(`Fee ${feeId} not found`);
    const balance = Math.max(0, fee.amount - fee.paidAmount);
    if (balance <= 0) throw new Error(`${feeId} is already paid`);
    total += balance;
    lines.push({ feeId, label: fee.label, balance });
  }

  return { total, lines };
}

function purgeExpired() {
  const expiryMs = 30 * 60 * 1000;
  const now = Date.now();
  for (const [id, session] of pendingCheckouts.entries()) {
    if (now - session.createdAt > expiryMs) pendingCheckouts.delete(id);
  }
}

export function validateFeePayment(feeIds: string[], amount: number) {
  purgeExpired();
  const { total, lines } = calcExpectedTotal(feeIds);
  if (amount !== total) {
    throw new Error(`Amount must be ${total} for selected fees`);
  }
  return { total, lines };
}

export function createCheckoutSession(input: {
  feeIds: string[];
  amount: number;
  method: string;
  cardLast4?: string;
}) {
  purgeExpired();
  validateFeePayment(input.feeIds, input.amount);

  if (!["card", "bank"].includes(input.method)) {
    throw new Error("Invalid payment method");
  }

  const checkoutSessionId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  pendingCheckouts.set(checkoutSessionId, {
    feeIds: input.feeIds,
    amount: input.amount,
    method: input.method,
    status: "pending",
    createdAt: Date.now(),
    cardLast4: input.cardLast4,
  });

  return {
    checkoutSessionId,
    amount: input.amount,
    gateway: "Schooli Pay Gateway",
    expiresInSeconds: 1800,
  };
}

export function confirmCheckoutSession(checkoutSessionId: string) {
  purgeExpired();
  const session = pendingCheckouts.get(checkoutSessionId);
  if (!session) throw new Error("Checkout session expired or not found");
  if (session.status !== "pending") throw new Error("Checkout session already processed");

  const { lines } = validateFeePayment(session.feeIds, session.amount);
  session.status = "completed";

  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const receiptId = `RCP-${dateKey.replace(/-/g, "")}-${String(Math.floor(Math.random() * 900) + 100)}`;
  const paymentId = `pay-${Date.now()}`;

  for (const line of lines) {
    const fee = PAYABLE_FEES[line.feeId];
    if (fee) fee.paidAmount = Math.min(fee.amount, fee.paidAmount + line.balance);
  }

  return {
    paymentId,
    receiptId,
    feeIds: session.feeIds,
    amount: session.amount,
    method: session.method,
    date: dateKey,
    description:
      lines.length === 1
        ? lines[0].label
        : `Payment for ${lines.length} fees — Spring 2026`,
    status: "completed" as const,
    gatewaySessionId: checkoutSessionId,
    cardLast4: session.cardLast4,
    feeLines: lines.map((line) => ({ label: line.label, amount: line.balance })),
  };
}

export function getPaymentReceiptData(paymentId: string, receiptId?: string) {
  for (const session of pendingCheckouts.values()) {
    if (session.status === "completed") continue;
  }

  const basePayments: Record<
    string,
    {
      receiptId: string;
      amount: number;
      method: string;
      date: string;
      description: string;
      status: string;
      feeIds?: string[];
    }
  > = {
    "pay-001": {
      receiptId: "RCP-2026-0210",
      amount: 1200,
      method: "card",
      date: "2026-02-10",
      description: "Tuition installment — Spring 2026",
      status: "completed",
      feeIds: ["fee-tuition-spring"],
    },
    "pay-002": {
      receiptId: "RCP-2026-0128",
      amount: 180,
      method: "bank",
      date: "2026-01-28",
      description: "Library & Resources fee",
      status: "completed",
      feeIds: ["fee-library"],
    },
  };

  if (receiptId) {
    const match = Object.entries(basePayments).find(([, p]) => p.receiptId === receiptId);
    if (match) {
      const [id, payment] = match;
      return { paymentId: id, ...payment };
    }
  }

  return null;
}

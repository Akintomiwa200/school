import { BEST_SALES } from "@/components/dashboard/library/library-data";

type PendingCheckout = {
  itemIds: string[];
  amount: number;
  method: string;
  status: "pending" | "completed";
  createdAt: number;
  cardLast4?: string;
};

const pendingCheckouts = new Map<string, PendingCheckout>();

function calcExpectedTotal(itemIds: string[]) {
  let total = 0;
  const lines: Array<{
    itemId: string;
    title: string;
    amount: number;
    format: string;
    bookId?: string;
  }> = [];

  for (const itemId of itemIds) {
    const item = BEST_SALES.find((entry) => entry.id === itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);
    total += item.price;
    lines.push({
      itemId: item.id,
      title: item.title,
      amount: item.price,
      format: item.format,
      bookId: item.bookId,
    });
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

export function validateLibraryPayment(itemIds: string[], amount: number) {
  purgeExpired();
  const { total, lines } = calcExpectedTotal(itemIds);
  if (amount !== total) {
    throw new Error(`Amount must be ${total} for selected items`);
  }
  return { total, lines };
}

export function createLibraryCheckoutSession(input: {
  itemIds: string[];
  amount: number;
  method: string;
  cardLast4?: string;
}) {
  purgeExpired();
  validateLibraryPayment(input.itemIds, input.amount);

  const checkoutSessionId = `lib_chk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  pendingCheckouts.set(checkoutSessionId, {
    itemIds: input.itemIds,
    amount: input.amount,
    method: input.method,
    status: "pending",
    createdAt: Date.now(),
    cardLast4: input.cardLast4,
  });

  return { checkoutSessionId, amount: input.amount, itemIds: input.itemIds };
}

export function confirmLibraryCheckoutSession(checkoutSessionId: string) {
  purgeExpired();
  const session = pendingCheckouts.get(checkoutSessionId);
  if (!session) throw new Error("Checkout session expired or not found");
  if (session.status === "completed") throw new Error("Checkout already completed");

  const { lines } = calcExpectedTotal(session.itemIds);
  session.status = "completed";

  const paymentId = `lib_pay_${Date.now()}`;
  const receiptId = `LIB-RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(pendingCheckouts.size).padStart(3, "0")}`;

  return {
    paymentId,
    receiptId,
    itemIds: session.itemIds,
    amount: session.amount,
    method: session.method as "card" | "bank",
    date: new Date().toISOString().slice(0, 10),
    description: `Library purchase — ${lines.map((line) => line.title).join(", ")}`,
    gatewaySessionId: checkoutSessionId,
    cardLast4: session.cardLast4,
    lines,
  };
}

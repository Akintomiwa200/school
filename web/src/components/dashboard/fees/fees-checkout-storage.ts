const CHECKOUT_KEY = "schooli-fees-checkout";

export type FeesCheckoutDraft = {
  feeIds: string[];
  createdAt: number;
};

export function saveCheckoutDraft(draft: FeesCheckoutDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(draft));
}

export function readCheckoutDraft(): FeesCheckoutDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHECKOUT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as FeesCheckoutDraft;
    if (!Array.isArray(parsed.feeIds) || parsed.feeIds.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_KEY);
}

export function checkoutHref(feeIds?: string[]) {
  const base = "/student/fees/pay/checkout";
  if (!feeIds?.length) return base;
  return `${base}?fees=${feeIds.join(",")}`;
}

export function payConfirmationHref(paymentId: string) {
  return `/student/fees/pay/confirmation?paymentId=${paymentId}`;
}

export function receiptHref(paymentId: string) {
  return `/student/fees/payments/${paymentId}/receipt`;
}

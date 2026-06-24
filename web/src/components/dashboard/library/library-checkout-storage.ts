const CHECKOUT_KEY = "schooli-library-checkout";

export type LibraryCheckoutDraft = {
  itemIds: string[];
  createdAt: number;
};

export function saveLibraryCheckoutDraft(draft: LibraryCheckoutDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(draft));
}

export function readLibraryCheckoutDraft(): LibraryCheckoutDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHECKOUT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LibraryCheckoutDraft;
    if (!Array.isArray(parsed.itemIds) || parsed.itemIds.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLibraryCheckoutDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_KEY);
}

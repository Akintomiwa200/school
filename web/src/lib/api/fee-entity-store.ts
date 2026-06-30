import { FEE_PLANS, type FeePlan } from "@/components/dashboard/accountant/accountant-data";

let feePlans: FeePlan[] = [...FEE_PLANS];

export function getMutableFeePlans() {
  return feePlans;
}

export function getFeePlanById(id: string) {
  return feePlans.find((plan) => plan.id === id);
}

export function addFeePlan(input: Omit<FeePlan, "id">) {
  const plan: FeePlan = { ...input, id: `fp-${Date.now()}` };
  feePlans = [plan, ...feePlans];
  return plan;
}

export function updateFeePlan(id: string, patch: Partial<FeePlan>) {
  const existing = feePlans.find((plan) => plan.id === id);
  if (!existing) return null;

  const changes: { field: string; before: string; after: string }[] = [];
  for (const [key, value] of Object.entries(patch)) {
    const before = String(existing[key as keyof FeePlan] ?? "");
    const after = String(value ?? "");
    if (before !== after) changes.push({ field: key, before, after });
  }

  feePlans = feePlans.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan));
  const updated = feePlans.find((plan) => plan.id === id)!;

  return { updated, changes };
}

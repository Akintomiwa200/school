import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { addFeePlan, getMutableFeePlans } from "@/lib/api/fee-entity-store";
import type { FeePlan } from "@/components/dashboard/accountant/accountant-data";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");
  if (scope === "parent") {
    const { PARENT_FEE_ITEMS } = await import("@/components/dashboard/parent/parent-data");
    return jsonData(PARENT_FEE_ITEMS, "Parent fees loaded");
  }
  return jsonData(getMutableFeePlans(), "Fee plans loaded");
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<FeePlan>;
  if (!body.name || !body.category || !body.amount || !body.term || !body.grades) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }

  const plan = addFeePlan({
    name: body.name,
    category: body.category,
    amount: body.amount,
    term: body.term,
    grades: body.grades,
    status: body.status ?? "draft",
    dueDate: body.dueDate ?? new Date().toISOString().slice(0, 10),
  });

  return jsonData(plan, "Fee plan created", 201);
}

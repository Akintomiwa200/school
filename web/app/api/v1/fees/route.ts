import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { FEE_PLANS } from "@/components/dashboard/accountant/accountant-data";
import { PARENT_FEE_ITEMS } from "@/components/dashboard/parent/parent-data";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");
  if (scope === "parent") {
    return jsonData(PARENT_FEE_ITEMS, "Parent fees loaded");
  }
  return jsonData(FEE_PLANS, "Fee plans loaded");
}

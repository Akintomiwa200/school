import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { getMutableExpenses } from "@/lib/api/expense-entity-store";

export async function GET(request: NextRequest) {
  return jsonList(getMutableExpenses(), "Expenses loaded", request, [
    "description",
    "vendor",
    "category",
    "requestedBy",
  ]);
}

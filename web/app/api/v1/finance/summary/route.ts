import { jsonData } from "@/lib/api/route-handlers";
import { getFinanceSummaryFromStores } from "@/lib/api/finance-summary";

export async function GET() {
  return jsonData(getFinanceSummaryFromStores(), "Finance summary loaded");
}

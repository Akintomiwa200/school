import { jsonData } from "@/lib/api/route-handlers";
import { EXPENSES } from "@/components/dashboard/accountant/accountant-data";

export async function GET() {
  return jsonData(EXPENSES, "Expenses loaded");
}
